import JSZip from 'jszip'
import type { Feature, FeatureCollection, Geometry, Polygon } from 'geojson'

import { MOCK_AUTH_USER_ID } from '#/common/auth/mock'
import type {
  FeatureProperties,
  ForestryScenarioId,
  PlanData,
} from 'applets/hiilikartta/common/types'

type HiilikarttaMockApiEnv = Record<string, string | undefined> & {
  HIILIKARTTA_MOCK_API_ENABLED?: string
  NODE_ENV?: string
}

type CalculationStatus = 'NOT_STARTED' | 'PROCESSING' | 'FINISHED' | 'ERROR'

type RawCalculationProperties = {
  id: string
  area: number
  zoning_code: string
  [key: string]: number | string
}

type RawCalculationData = {
  areas: FeatureCollection<Polygon, RawCalculationProperties>
  totals: FeatureCollection<Polygon, RawCalculationProperties>
  metadata: {
    calculated_ts: number
    forestry_scenario: ForestryScenarioId
    report_name: string
  }
}

type MockPlanRecord = {
  id: string
  visible_id: string
  name: string
  user_id: string
  created_ts: number
  saved_ts: number
  forestry_scenario: ForestryScenarioId
  calculation_status: CalculationStatus
  data: PlanData
  report_data?: RawCalculationData
}

type ExternalReportRecord = {
  name: string
  report_data: RawCalculationData
}

const ROUTE_PREFIX = '/api/hiilikartta'
const MOCK_API_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])
const MOCK_CREATED_TS = 1_735_689_600
const MOCK_SAVED_TS = 1_735_776_000
const MOCK_CALCULATED_TS = 1_735_776_120
const MOCK_MUTATION_BASE_TS = 1_735_862_400
const MOCK_FEATURE_YEARS = ['2024', '2030', '2040', '2050'] as const
const MOCK_FEATURE_COLS = [
  'bio_carbon_total',
  'ground_carbon_total',
  'bio_carbon_ha',
  'ground_carbon_ha',
] as const
const EXTERNAL_REPORT_ERROR_ID = 'mock-external-error'

let plansById = new Map<string, MockPlanRecord>()
let mutationCount = 0

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const getDefaultMockApiEnv = (): HiilikarttaMockApiEnv => ({
  HIILIKARTTA_MOCK_API_ENABLED: process.env.HIILIKARTTA_MOCK_API_ENABLED,
  NODE_ENV: process.env.NODE_ENV,
})

const isTruthyMockApiFlag = (value: string | undefined) =>
  MOCK_API_ENABLED_VALUES.has(normalizeFlag(value))

export const assertHiilikarttaMockApiAllowed = (
  env: HiilikarttaMockApiEnv = getDefaultMockApiEnv()
) => {
  if (
    isTruthyMockApiFlag(env.HIILIKARTTA_MOCK_API_ENABLED) &&
    env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Hiilikartta mock API cannot be enabled when NODE_ENV=production. Unset HIILIKARTTA_MOCK_API_ENABLED.'
    )
  }
}

export const isHiilikarttaMockApiEnabled = (
  env: HiilikarttaMockApiEnv = getDefaultMockApiEnv()
) => {
  assertHiilikarttaMockApiAllowed(env)

  return isTruthyMockApiFlag(env.HIILIKARTTA_MOCK_API_ENABLED)
}

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })

const jsonErrorResponse = (error: string, status: number) =>
  jsonResponse({ error }, status)

const round = (value: number) => Math.round(value * 100) / 100

const getNextMutationTimestamp = () => MOCK_MUTATION_BASE_TS + mutationCount++

const createPolygon = ({
  offsetX,
  offsetY,
}: {
  offsetX: number
  offsetY: number
}): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [24.93 + offsetX, 60.17 + offsetY],
      [24.934 + offsetX, 60.17 + offsetY],
      [24.934 + offsetX, 60.173 + offsetY],
      [24.93 + offsetX, 60.173 + offsetY],
      [24.93 + offsetX, 60.17 + offsetY],
    ],
  ],
})

const createPlanFeature = ({
  areaHa,
  id,
  name,
  offsetX,
  offsetY,
  zoningCode,
}: {
  areaHa: number
  id: string
  name: string
  offsetX: number
  offsetY: number
  zoningCode: string
}): Feature<Polygon, FeatureProperties> => ({
  id,
  type: 'Feature',
  geometry: createPolygon({ offsetX, offsetY }),
  properties: {
    id,
    name,
    area_ha: areaHa,
    zoning_code: zoningCode,
    landuse_built: 45,
    landuse_new_open_vegetation: 20,
    landuse_new_tree_vegetation: 15,
    landuse_existing: 20,
    soil_change_new_vegetation_pct: 25,
  },
})

const createSeedPlanData = (): PlanData<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    createPlanFeature({
      areaHa: 1.25,
      id: 'mock-area-ak',
      name: 'Mock residential block',
      offsetX: 0,
      offsetY: 0,
      zoningCode: 'AK',
    }),
    createPlanFeature({
      areaHa: 0.85,
      id: 'mock-area-vp',
      name: 'Mock park edge',
      offsetX: 0.006,
      offsetY: 0.001,
      zoningCode: 'VP',
    }),
  ],
})

const createExternalPlanData = (): PlanData<Polygon> => ({
  type: 'FeatureCollection',
  features: [
    createPlanFeature({
      areaHa: 2.1,
      id: 'mock-external-vl',
      name: 'Mock external forest',
      offsetX: 0.012,
      offsetY: 0.003,
      zoningCode: 'VL',
    }),
  ],
})

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFeatureCollection = (value: unknown): value is PlanData => {
  if (
    !isObject(value) ||
    value.type !== 'FeatureCollection' ||
    !Array.isArray(value.features)
  ) {
    return false
  }

  return value.features.every(
    (feature) =>
      isObject(feature) &&
      feature.type === 'Feature' &&
      isObject(feature.properties) &&
      isObject(feature.geometry)
  )
}

const getNumericProperty = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null

const getFeatureArea = (feature: Feature<Geometry | null, FeatureProperties>) =>
  getNumericProperty(feature.properties?.area_ha) ??
  getNumericProperty((feature.properties as Record<string, unknown>)?.area) ??
  1

const getFeatureZoningCode = (
  feature: Feature<Geometry | null, FeatureProperties>
) =>
  typeof feature.properties?.zoning_code === 'string' &&
  feature.properties.zoning_code.trim()
    ? feature.properties.zoning_code.trim()
    : 'AK'

const getPolygonGeometry = (
  feature: Feature<Geometry | null, FeatureProperties>,
  index: number
): Polygon =>
  feature.geometry?.type === 'Polygon'
    ? deepClone(feature.geometry)
    : createPolygon({ offsetX: index * 0.004, offsetY: index * 0.002 })

const getZoningFactor = (zoningCode: string) => {
  switch (zoningCode.toUpperCase()) {
    case 'VL':
    case 'VP':
      return 1.22
    case 'AK':
      return 0.9
    default:
      return 1
  }
}

const setCarbonValues = ({
  area,
  featureIndex,
  forestryScenario,
  properties,
  zoningCode,
}: {
  area: number
  featureIndex: number
  forestryScenario: ForestryScenarioId
  properties: RawCalculationProperties
  zoningCode: string
}) => {
  const zoningFactor = getZoningFactor(zoningCode)
  const scenarioFactor = 1 + forestryScenario * 0.045

  MOCK_FEATURE_COLS.forEach((featureCol, colIndex) => {
    const isPerHectare = featureCol.endsWith('_ha')
    const baseValue =
      (isPerHectare
        ? 7 + featureIndex * 1.75 + colIndex * 2.1
        : area * (42 + featureIndex * 6 + colIndex * 11)) * zoningFactor

    MOCK_FEATURE_YEARS.forEach((year, yearIndex) => {
      const nochangeGrowth =
        yearIndex * (isPerHectare ? 1.35 : area * 5.5) * zoningFactor
      const plannedDelta =
        (yearIndex + 1) *
        scenarioFactor *
        (isPerHectare ? 0.95 : area * 4.25)

      properties[`${featureCol}_nochange_${year}`] = round(
        baseValue + nochangeGrowth
      )
      properties[`${featureCol}_planned_${year}`] = round(
        baseValue + nochangeGrowth + plannedDelta
      )
    })
  })
}

const createAreaCalculationFeature = ({
  feature,
  forestryScenario,
  index,
}: {
  feature: Feature<Geometry | null, FeatureProperties>
  forestryScenario: ForestryScenarioId
  index: number
}): Feature<Polygon, RawCalculationProperties> => {
  const id = String(feature.properties?.id ?? feature.id ?? `mock-area-${index}`)
  const area = getFeatureArea(feature)
  const zoningCode = getFeatureZoningCode(feature)
  const properties: RawCalculationProperties = {
    id,
    area,
    zoning_code: zoningCode,
  }

  setCarbonValues({
    area,
    featureIndex: index,
    forestryScenario,
    properties,
    zoningCode,
  })

  return {
    id,
    type: 'Feature',
    geometry: getPolygonGeometry(feature, index),
    properties,
  }
}

const createFallbackPlanFeature = () =>
  createPlanFeature({
    areaHa: 1,
    id: 'mock-fallback-area',
    name: 'Mock fallback area',
    offsetX: 0.02,
    offsetY: 0.004,
    zoningCode: 'AK',
  })

const createTotalCalculationFeature = (
  areaFeatures: Feature<Polygon, RawCalculationProperties>[]
): Feature<Polygon, RawCalculationProperties> => {
  const properties: RawCalculationProperties = {
    id: 'mock-total',
    area: round(
      areaFeatures.reduce((sum, feature) => sum + feature.properties.area, 0)
    ),
    zoning_code: 'TOTAL',
  }

  MOCK_FEATURE_COLS.forEach((featureCol) => {
    MOCK_FEATURE_YEARS.forEach((year) => {
      for (const variant of ['nochange', 'planned'] as const) {
        const key = `${featureCol}_${variant}_${year}`
        properties[key] = round(
          areaFeatures.reduce(
            (sum, feature) => sum + Number(feature.properties[key] ?? 0),
            0
          )
        )
      }
    })
  })

  return {
    id: 'mock-total',
    type: 'Feature',
    geometry: createPolygon({ offsetX: 0.03, offsetY: 0.006 }),
    properties,
  }
}

const createRawCalculationData = ({
  calculatedTs = MOCK_CALCULATED_TS,
  forestryScenario,
  planData,
  reportName,
}: {
  calculatedTs?: number
  forestryScenario: ForestryScenarioId
  planData: PlanData
  reportName: string
}): RawCalculationData => {
  const planFeatures =
    planData.features.length > 0
      ? planData.features
      : [createFallbackPlanFeature()]

  const areaFeatures = planFeatures.map((feature, index) =>
    createAreaCalculationFeature({
      feature: feature as Feature<Geometry | null, FeatureProperties>,
      forestryScenario,
      index,
    })
  )

  return {
    areas: {
      type: 'FeatureCollection',
      features: areaFeatures,
    },
    totals: {
      type: 'FeatureCollection',
      features: [createTotalCalculationFeature(areaFeatures)],
    },
    metadata: {
      calculated_ts: calculatedTs,
      forestry_scenario: forestryScenario,
      report_name: reportName,
    },
  }
}

const createSeedPlans = () => {
  const planData = createSeedPlanData()
  const reportData = createRawCalculationData({
    forestryScenario: 2,
    planData,
    reportName: 'Mock seeded carbon plan',
  })

  return [
    {
      id: 'mock-plan-seeded',
      visible_id: 'mock-visible-seeded',
      name: 'Mock seeded carbon plan',
      user_id: MOCK_AUTH_USER_ID,
      created_ts: MOCK_CREATED_TS,
      saved_ts: MOCK_SAVED_TS,
      forestry_scenario: 2 as ForestryScenarioId,
      calculation_status: 'FINISHED' as CalculationStatus,
      data: planData,
      report_data: reportData,
    },
  ]
}

const createExternalReports = () => {
  const reportData = createRawCalculationData({
    calculatedTs: MOCK_CALCULATED_TS + 60,
    forestryScenario: 3,
    planData: createExternalPlanData(),
    reportName: 'Mock external carbon report',
  })

  return new Map<string, ExternalReportRecord>([
    [
      'mock-external-report',
      {
        name: 'Mock external carbon report',
        report_data: reportData,
      },
    ],
  ])
}

const resetStorage = () => {
  plansById = new Map(
    createSeedPlans().map((plan) => [plan.id, deepClone(plan)])
  )
  mutationCount = 0
}

export const resetHiilikarttaMockApiForTests = () => {
  resetStorage()
}

const getMockPath = (request: Request) => {
  const requestUrl = new URL(request.url)
  const normalizedPrefix = ROUTE_PREFIX.replace(/\/+$/, '')

  if (!requestUrl.pathname.startsWith(normalizedPrefix)) {
    return null
  }

  return requestUrl.pathname.slice(normalizedPrefix.length) || '/'
}

const getRequiredId = (requestUrl: URL) => {
  const id = requestUrl.searchParams.get('id')?.trim()

  return id || null
}

const parseForestryScenario = (
  value: string | null,
  fallback: ForestryScenarioId
): ForestryScenarioId => {
  const parsed = Number(value)

  return parsed === 1 || parsed === 2 || parsed === 3 ? parsed : fallback
}

const isBlobLike = (value: FormDataEntryValue | null): value is File =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as File).arrayBuffer === 'function'

const parseUploadedPlanData = async (request: Request) => {
  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return {
      error: jsonErrorResponse(
        'Expected multipart form data with file field',
        400
      ),
    }
  }

  const file = formData.get('file')

  if (!isBlobLike(file)) {
    return {
      error: jsonErrorResponse(
        'Expected multipart form data with file field',
        400
      ),
    }
  }

  let zip: JSZip

  try {
    zip = await JSZip.loadAsync(new Uint8Array(await file.arrayBuffer()))
  } catch {
    return { error: jsonErrorResponse('Uploaded file is not a valid zip', 400) }
  }

  const zipEntry =
    zip.file('file') ??
    Object.values(zip.files).find((entry) => !entry.dir) ??
    null

  if (!zipEntry) {
    return {
      error: jsonErrorResponse('Uploaded zip does not contain GeoJSON', 400),
    }
  }

  let parsedJson: unknown

  try {
    parsedJson = JSON.parse(await zipEntry.async('string'))
  } catch {
    return { error: jsonErrorResponse('Uploaded GeoJSON is not valid JSON', 400) }
  }

  if (!isFeatureCollection(parsedJson)) {
    return {
      error: jsonErrorResponse(
        'Uploaded GeoJSON must be a FeatureCollection',
        400
      ),
    }
  }

  return { data: parsedJson }
}

const createPlanResponse = (plan: MockPlanRecord) =>
  deepClone({
    ...plan,
    metadata: {
      forestry_scenario: plan.forestry_scenario,
    },
  })

const getPlanStatsResponse = () => ({
  stats: Array.from(plansById.values()).map((plan) =>
    deepClone({
      id: plan.id,
      visible_id: plan.visible_id,
      name: plan.name,
      user_id: plan.user_id,
      created_ts: plan.created_ts,
      saved_ts: plan.saved_ts,
      forestry_scenario: plan.forestry_scenario,
      calculation_status: plan.calculation_status,
    })
  ),
})

const handlePlanFetch = (requestUrl: URL) => {
  const id = getRequiredId(requestUrl)

  if (!id) {
    return jsonErrorResponse('Missing required plan id', 400)
  }

  const plan = plansById.get(id)

  if (!plan) {
    return jsonErrorResponse('Mock plan not found', 404)
  }

  return jsonResponse(createPlanResponse(plan))
}

const handlePlanDelete = (requestUrl: URL) => {
  const id = getRequiredId(requestUrl)

  if (!id) {
    return jsonErrorResponse('Missing required plan id', 400)
  }

  if (!plansById.has(id)) {
    return jsonErrorResponse('Mock plan not found', 404)
  }

  plansById.delete(id)

  return jsonResponse({ status: 'deleted', id })
}

const upsertPlanFromUpload = async ({
  calculate,
  request,
}: {
  calculate: boolean
  request: Request
}) => {
  const requestUrl = new URL(request.url)
  const parsedUpload = await parseUploadedPlanData(request)

  if ('error' in parsedUpload) {
    return parsedUpload.error
  }

  const existingId = requestUrl.searchParams.get('id')?.trim()
  const visibleId =
    requestUrl.searchParams.get('visible_id')?.trim() ??
    existingId ??
    `mock-visible-${plansById.size + 1}`
  const id = existingId || `mock-plan-${visibleId}`
  const existingPlan = plansById.get(id)
  const name =
    requestUrl.searchParams.get('name')?.trim() ??
    existingPlan?.name ??
    'Mock carbon plan'
  const forestryScenario = parseForestryScenario(
    requestUrl.searchParams.get('forestry_scenario'),
    existingPlan?.forestry_scenario ?? 1
  )
  const savedTs = getNextMutationTimestamp()
  const uploadedData = parsedUpload.data
  const planDataChanged =
    !existingPlan ||
    JSON.stringify(existingPlan.data) !== JSON.stringify(uploadedData)
  let calculationStatus: CalculationStatus =
    existingPlan?.calculation_status ?? 'NOT_STARTED'
  let reportData = existingPlan?.report_data

  if (calculate) {
    calculationStatus = 'FINISHED'
    reportData = createRawCalculationData({
      calculatedTs: savedTs + 60,
      forestryScenario,
      planData: uploadedData,
      reportName: name,
    })
  } else if (planDataChanged) {
    calculationStatus = 'NOT_STARTED'
    reportData = undefined
  }

  const plan: MockPlanRecord = {
    id,
    visible_id: visibleId,
    name,
    user_id: MOCK_AUTH_USER_ID,
    created_ts: existingPlan?.created_ts ?? savedTs,
    saved_ts: savedTs,
    forestry_scenario: forestryScenario,
    calculation_status: calculationStatus,
    data: uploadedData,
    ...(reportData ? { report_data: reportData } : {}),
  }

  plansById.set(id, deepClone(plan))

  return jsonResponse({
    status: calculate ? 'finished' : 'saved',
    id: plan.id,
    visible_id: plan.visible_id,
    name: plan.name,
    user_id: plan.user_id,
    created_ts: plan.created_ts,
    saved_ts: plan.saved_ts,
    forestry_scenario: plan.forestry_scenario,
    calculation_status: plan.calculation_status,
  })
}

const handleCalculationFetch = (requestUrl: URL) => {
  const id = getRequiredId(requestUrl)

  if (!id) {
    return jsonErrorResponse('Missing required calculation id', 400)
  }

  const plan = plansById.get(id)

  if (!plan) {
    return jsonErrorResponse('Mock plan not found', 404)
  }

  if (!plan.report_data) {
    return jsonResponse(
      {
        status: 'not-ready',
        id,
      },
      206
    )
  }

  return jsonResponse({ data: deepClone(plan.report_data) })
}

const handleExternalReportFetch = (requestUrl: URL) => {
  const id = getRequiredId(requestUrl)

  if (!id) {
    return jsonErrorResponse('Missing required external report id', 400)
  }

  if (id === EXTERNAL_REPORT_ERROR_ID) {
    return jsonErrorResponse('Mock external report cannot be processed', 422)
  }

  const externalReport = createExternalReports().get(id)

  if (!externalReport) {
    return jsonErrorResponse('Mock external report not found', 404)
  }

  return jsonResponse(deepClone(externalReport))
}

export const handleHiilikarttaMockApiRequest = async ({
  request,
}: {
  request: Request
}) => {
  const requestUrl = new URL(request.url)
  const method = request.method.toUpperCase()
  const mockPath = getMockPath(request)

  if (!mockPath) {
    return jsonErrorResponse('Mock proxy path is missing', 404)
  }

  if (mockPath === '/user/plans') {
    return method === 'GET'
      ? jsonResponse(getPlanStatsResponse())
      : jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/plan') {
    if (method === 'GET') {
      return handlePlanFetch(requestUrl)
    }

    if (method === 'PUT') {
      return upsertPlanFromUpload({ calculate: false, request })
    }

    if (method === 'DELETE') {
      return handlePlanDelete(requestUrl)
    }

    return jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/calculation') {
    if (method === 'POST') {
      return upsertPlanFromUpload({ calculate: true, request })
    }

    if (method === 'GET') {
      return handleCalculationFetch(requestUrl)
    }

    return jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/plan/external') {
    return method === 'GET'
      ? handleExternalReportFetch(requestUrl)
      : jsonErrorResponse('Method not allowed', 405)
  }

  return jsonErrorResponse('Unsupported Hiilikartta mock API endpoint', 404)
}

resetStorage()
