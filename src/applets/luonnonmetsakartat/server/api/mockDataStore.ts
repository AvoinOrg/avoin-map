import type { Polygon } from 'geojson'

import type {
  ColOptions,
  FolayerAreaCollection,
  FolayerFeature,
} from 'applets/luonnonmetsakartat/common/types'

export type LuonnonmetsakartatMockLayerRecord = {
  id: string
  name: string
  description: string
  color_code: string
  is_hidden: boolean
  created_ts: number
  updated_ts: number
  col_options: ColOptions
  areas: FolayerAreaCollection
}

type MockLayerInput = {
  name: string
  description?: string
  color_code: string
  is_hidden: boolean
  col_options: ColOptions
}

type MockLayerUpdates = Partial<MockLayerInput>

type MockPictureAttachment = {
  areaId: string
  fileName: string
}

type MockAreaPatchInput = {
  layerId: string
  featureId: string
  properties: Record<string, string>
}

type MockAreaMutationResult =
  | {
      status: 'ok'
      feature: FolayerFeature
    }
  | {
      status: 'layer-not-found'
    }
  | {
      status: 'area-not-found'
    }

type MockPictureAttachmentResult =
  | {
      status: 'ok'
      layer: LuonnonmetsakartatMockLayerRecord
    }
  | {
      status: 'layer-not-found'
    }
  | {
      status: 'area-not-found'
      areaId: string
    }

const MOCK_LAYER_CREATED_TS = 1_735_689_600
const MOCK_LAYER_UPDATED_TS = 1_735_776_000
const MOCK_MUTATION_LAYER_TS_BASE = MOCK_LAYER_UPDATED_TS + 3_600
const MOCK_MUTATION_AREA_TS_BASE = Date.UTC(2025, 1, 1, 0, 0, 0)
const MUTATION_TS_STEP_SECONDS = 60
const PROTECTED_AREA_PROPERTY_KEYS = new Set([
  'id',
  'created_ts',
  'updated_ts',
  'layer_id',
  'area_ha',
  'geometry',
])

let layersById = new Map<string, LuonnonmetsakartatMockLayerRecord>()
let nextLayerSequence = 1
let nextMutationSequence = 1

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const getNextMutationSequence = () => nextMutationSequence++

const getLayerMutationTimestamp = (mutationSequence: number) =>
  MOCK_MUTATION_LAYER_TS_BASE + mutationSequence * MUTATION_TS_STEP_SECONDS

const getAreaMutationTimestamp = (mutationSequence: number) =>
  new Date(
    MOCK_MUTATION_AREA_TS_BASE + mutationSequence * MUTATION_TS_STEP_SECONDS * 1000
  ).toISOString()

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
      [24.85 + offsetX, 60.22 + offsetY],
      [24.856 + offsetX, 60.22 + offsetY],
      [24.856 + offsetX, 60.225 + offsetY],
      [24.85 + offsetX, 60.225 + offsetY],
      [24.85 + offsetX, 60.22 + offsetY],
    ],
  ],
})

const createAreaFeature = ({
  areaHa,
  date,
  description,
  id,
  layerId,
  municipality,
  name,
  offsetX,
  offsetY,
  pictures,
  region,
  createdTs = '2025-01-01T00:00:00.000Z',
  updatedTs = '2025-01-02T00:00:00.000Z',
}: {
  areaHa: number
  date: string
  description: string
  id: string
  layerId: string
  municipality: string
  name: string
  offsetX: number
  offsetY: number
  pictures?: string[]
  region: string
  createdTs?: string
  updatedTs?: string
}): FolayerFeature => {
  const properties = {
    id,
    name,
    area_ha: areaHa,
    municipality,
    region,
    description,
    date,
    created_ts: createdTs,
    updated_ts: updatedTs,
    layer_id: layerId,
    ...(pictures ? { pictures: JSON.stringify(pictures) } : {}),
  } as unknown as FolayerFeature['properties']

  return {
    id,
    type: 'Feature',
    geometry: createPolygon({ offsetX, offsetY }),
    properties,
  }
}

const createDefaultColOptions = (): ColOptions => ({
  indexingStrategy: 'name_municipality',
  idCol: 'id',
  nameCol: 'name',
  municipalityCol: 'municipality',
  regionCol: 'region',
  descriptionCol: 'description',
  areaCol: 'area_ha',
})

const createAreaCollection = (features: FolayerFeature[] = []) => ({
  type: 'FeatureCollection' as const,
  features,
})

const createImportedLayerAreaFeatures = ({
  areaTimestamp,
  layerId,
  layerName,
  layerSequence,
}: {
  areaTimestamp: string
  layerId: string
  layerName: string
  layerSequence: number
}) => {
  const baseOffsetX = 0.06 + layerSequence * 0.018
  const baseOffsetY = 0.02 + layerSequence * 0.006

  return [
    createAreaFeature({
      id: `${layerId}-area-1`,
      layerId,
      name: `${layerName} mock area 1`,
      municipality: 'Vantaa',
      region: 'Uusimaa',
      description: 'Deterministic imported mock forest area.',
      date: '2025-02-01',
      areaHa: 10 + layerSequence,
      offsetX: baseOffsetX,
      offsetY: baseOffsetY,
      createdTs: areaTimestamp,
      updatedTs: areaTimestamp,
    }),
    createAreaFeature({
      id: `${layerId}-area-2`,
      layerId,
      name: `${layerName} mock area 2`,
      municipality: 'Kirkkonummi',
      region: 'Uusimaa',
      description: 'Second deterministic imported mock forest area.',
      date: '2025-02-02',
      areaHa: 6.5 + layerSequence,
      offsetX: baseOffsetX + 0.012,
      offsetY: baseOffsetY + 0.004,
      createdTs: areaTimestamp,
      updatedTs: areaTimestamp,
    }),
  ]
}

const createSeedLayers = (): LuonnonmetsakartatMockLayerRecord[] => [
  {
    id: 'mock-visible-layer',
    name: 'Mock visible forest layer',
    description: 'Deterministic visible luonnonmetsa mock layer.',
    color_code: '#2f855a',
    is_hidden: false,
    created_ts: MOCK_LAYER_CREATED_TS,
    updated_ts: MOCK_LAYER_UPDATED_TS,
    col_options: createDefaultColOptions(),
    areas: createAreaCollection([
      createAreaFeature({
        id: 'mock-visible-area-picture',
        layerId: 'mock-visible-layer',
        name: 'Mock Ridge Forest',
        municipality: 'Espoo',
        region: 'Uusimaa',
        description: 'Old spruce stand with a small wetland edge.',
        date: '2025-05-10',
        areaHa: 12.34,
        offsetX: 0,
        offsetY: 0,
        pictures: [
          'https://example.org/mock/forest-ridge-1.jpg',
          'https://example.org/mock/forest-ridge-2.jpg',
        ],
      }),
      createAreaFeature({
        id: 'mock-visible-area-no-picture',
        layerId: 'mock-visible-layer',
        name: 'Mock Lakeside Grove',
        municipality: 'Lohja',
        region: 'Uusimaa',
        description: 'Mixed forest by a lakeside conservation corridor.',
        date: '2024-09-18',
        areaHa: 7.89,
        offsetX: 0.018,
        offsetY: 0.006,
      }),
    ]),
  },
  {
    id: 'mock-hidden-layer',
    name: 'Mock hidden review layer',
    description: 'Deterministic hidden luonnonmetsa mock layer.',
    color_code: '#805ad5',
    is_hidden: true,
    created_ts: MOCK_LAYER_CREATED_TS + 60,
    updated_ts: MOCK_LAYER_UPDATED_TS + 60,
    col_options: {
      ...createDefaultColOptions(),
      indexingStrategy: 'id',
    },
    areas: createAreaCollection([
      createAreaFeature({
        id: 'mock-hidden-area',
        layerId: 'mock-hidden-layer',
        name: 'Mock Hidden Ravine',
        municipality: 'Sipoo',
        region: 'Uusimaa',
        description: 'Hidden admin-only ravine forest candidate.',
        date: '2023-08-22',
        areaHa: 4.56,
        offsetX: 0.036,
        offsetY: 0.012,
      }),
    ]),
  },
  {
    id: 'mock-empty-layer',
    name: 'Mock empty visible layer',
    description: 'Visible mock layer without area features.',
    color_code: '#dd6b20',
    is_hidden: false,
    created_ts: MOCK_LAYER_CREATED_TS + 120,
    updated_ts: MOCK_LAYER_UPDATED_TS + 120,
    col_options: createDefaultColOptions(),
    areas: createAreaCollection(),
  },
]

const resetStorage = () => {
  nextLayerSequence = 1
  nextMutationSequence = 1
  layersById = new Map(
    createSeedLayers().map((layer) => [layer.id, deepClone(layer)])
  )
}

export const resetLuonnonmetsakartatMockApiForTests = () => {
  resetStorage()
}

export const getLuonnonmetsakartatMockLayers = () =>
  Array.from(layersById.values()).map((layer) => deepClone(layer))

export const getLuonnonmetsakartatMockLayer = (id: string) => {
  const layer = layersById.get(id)

  return layer ? deepClone(layer) : null
}

export const getLuonnonmetsakartatMockLayerAreas = (id: string) => {
  const layer = layersById.get(id)

  return layer ? deepClone(layer.areas) : null
}

export const createLuonnonmetsakartatMockLayer = (input: MockLayerInput) => {
  const layerSequence = nextLayerSequence++
  const mutationSequence = getNextMutationSequence()
  const timestamp = getLayerMutationTimestamp(mutationSequence)
  const areaTimestamp = getAreaMutationTimestamp(mutationSequence)
  const layerId = `mock-created-layer-${layerSequence}`
  const layer: LuonnonmetsakartatMockLayerRecord = {
    id: layerId,
    name: input.name,
    description: input.description ?? '',
    color_code: input.color_code,
    is_hidden: input.is_hidden,
    created_ts: timestamp,
    updated_ts: timestamp,
    col_options: deepClone(input.col_options),
    areas: createAreaCollection(
      createImportedLayerAreaFeatures({
        areaTimestamp,
        layerId,
        layerName: input.name,
        layerSequence,
      })
    ),
  }

  layersById.set(layerId, deepClone(layer))

  return deepClone(layer)
}

export const updateLuonnonmetsakartatMockLayer = (
  id: string,
  updates: MockLayerUpdates
) => {
  const layer = layersById.get(id)

  if (!layer) {
    return null
  }

  const mutationSequence = getNextMutationSequence()

  if (updates.name !== undefined) {
    layer.name = updates.name
  }

  if (updates.description !== undefined) {
    layer.description = updates.description
  }

  if (updates.color_code !== undefined) {
    layer.color_code = updates.color_code
  }

  if (updates.is_hidden !== undefined) {
    layer.is_hidden = updates.is_hidden
  }

  if (updates.col_options !== undefined) {
    layer.col_options = deepClone(updates.col_options)
  }

  layer.updated_ts = getLayerMutationTimestamp(mutationSequence)

  return deepClone(layer)
}

export const deleteLuonnonmetsakartatMockLayer = (id: string) => {
  const layer = layersById.get(id)

  if (!layer) {
    return false
  }

  layersById.delete(id)

  return true
}

const getPictureList = (pictures: unknown) => {
  if (Array.isArray(pictures)) {
    return pictures.filter((picture): picture is string =>
      typeof picture === 'string'
    )
  }

  if (typeof pictures !== 'string') {
    return []
  }

  try {
    const parsed = JSON.parse(pictures) as unknown

    return Array.isArray(parsed)
      ? parsed.filter((picture): picture is string =>
          typeof picture === 'string'
        )
      : []
  } catch {
    return []
  }
}

const createMockPictureUrl = ({
  areaId,
  fileName,
  index,
  layerId,
}: MockPictureAttachment & {
  index: number
  layerId: string
}) =>
  `https://example.org/mock/uploads/${encodeURIComponent(
    layerId
  )}/${encodeURIComponent(areaId)}/${index}-${encodeURIComponent(fileName)}`

export const attachLuonnonmetsakartatMockLayerAreaPictures = ({
  attachments,
  layerId,
}: {
  attachments: MockPictureAttachment[]
  layerId: string
}): MockPictureAttachmentResult => {
  const layer = layersById.get(layerId)

  if (!layer) {
    return { status: 'layer-not-found' }
  }

  const featuresById = new Map(
    layer.areas.features.map((feature) => [String(feature.properties.id), feature])
  )
  const missingAttachment = attachments.find(
    (attachment) => !featuresById.has(attachment.areaId)
  )

  if (missingAttachment) {
    return {
      status: 'area-not-found',
      areaId: missingAttachment.areaId,
    }
  }

  const mutationSequence = getNextMutationSequence()
  const updatedTs = getAreaMutationTimestamp(mutationSequence)

  attachments.forEach((attachment, index) => {
    const feature = featuresById.get(attachment.areaId)

    if (!feature) {
      return
    }

    const pictures = getPictureList(feature.properties.pictures)
    const mutableProperties = feature.properties as unknown as Record<
      string,
      unknown
    >

    pictures.push(
      createMockPictureUrl({
        ...attachment,
        index: index + 1,
        layerId,
      })
    )
    mutableProperties.pictures = JSON.stringify(pictures)
    mutableProperties.updated_ts = updatedTs
  })

  return { status: 'ok', layer: deepClone(layer) }
}

export const updateLuonnonmetsakartatMockLayerArea = ({
  featureId,
  layerId,
  properties,
}: MockAreaPatchInput): MockAreaMutationResult => {
  const layer = layersById.get(layerId)

  if (!layer) {
    return { status: 'layer-not-found' }
  }

  const feature = layer.areas.features.find(
    (item) => item.id === featureId || item.properties.id === featureId
  )

  if (!feature) {
    return { status: 'area-not-found' }
  }

  const mutableProperties = feature.properties as unknown as Record<
    string,
    unknown
  >

  Object.entries(properties).forEach(([key, value]) => {
    if (!PROTECTED_AREA_PROPERTY_KEYS.has(key)) {
      mutableProperties[key] = value
    }
  })

  const mutationSequence = getNextMutationSequence()
  mutableProperties.updated_ts = getAreaMutationTimestamp(mutationSequence)

  return {
    status: 'ok',
    feature: deepClone(feature),
  }
}

resetStorage()
