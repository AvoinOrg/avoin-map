jest.mock('#/common/store', () => ({
  useMapStore: {
    getState: () => ({
      removeSerializableLayerGroup: jest.fn(async () => undefined),
    }),
  },
}))

jest.mock('#/common/utils/store', () => {
  const actual = jest.requireActual<typeof import('#/common/utils/store')>(
    '#/common/utils/store'
  )

  return {
    ...actual,
    createIndexedDbStorage: () => () => ({
      getItem: async () => null,
      removeItem: async () => undefined,
      setItem: async () => undefined,
    }),
  }
})

import { useAppletStore } from 'applets/hiilikartta/state/appletStore'

import { FetchStatus } from '#/common/types/general'

import {
  CalculationState,
  GlobalState,
  featureCols,
} from '../types'
import {
  checkIsValidLandUseDistribution,
  getPlanLayerGroupId,
} from '../utils'
import {
  MOCK_COMPARISON_PLAN_ID,
  MOCK_COMPARISON_PLAN_SERVER_ID,
  MOCK_EXTERNAL_PLAN_ID,
  MOCK_EXTERNAL_REPORT_ERROR_SERVER_ID,
  MOCK_EXTERNAL_REPORT_SERVER_ID,
  MOCK_INVALID_PLAN_ID,
  MOCK_INVALID_PLAN_SERVER_ID,
  MOCK_LOCAL_PLAN_ID,
  MOCK_LOCAL_PLAN_SERVER_ID,
  MOCK_SERVER_PLAN_ID,
  MOCK_SERVER_PLAN_SERVER_ID,
} from './ids'
import {
  applyHiilikarttaMockScenarioState,
  buildHiilikarttaMockScenarioState,
  normalizeHiilikarttaMockScenarioState,
} from './scenarios'
import { MOCK_FEATURE_YEARS } from './seedData'

const resetAppletStoreForTests = () => {
  useAppletStore.setState({
    planConfs: {},
    placeholderPlanConfs: {},
    creationPlaceholderPlanConfs: {},
    externalPlanConfs: {},
    globalState: GlobalState.INITIALIZING,
  })
}

describe('Hiilikartta mock scenarios', () => {
  beforeEach(() => {
    resetAppletStoreForTests()
  })

  afterEach(() => {
    resetAppletStoreForTests()
  })

  it('normalizes scenario state names and aliases', () => {
    expect(normalizeHiilikarttaMockScenarioState(' Plan_Valid ')).toBe(
      'plan-valid'
    )
    expect(normalizeHiilikarttaMockScenarioState('cloud loading')).toBe(
      'cloud-placeholders'
    )
    expect(normalizeHiilikarttaMockScenarioState('plans empty')).toBe(
      'plans-empty'
    )
    expect(normalizeHiilikarttaMockScenarioState(' Report_External ')).toBe(
      'report-external'
    )
    expect(normalizeHiilikarttaMockScenarioState('empty')).toBeNull()
    expect(normalizeHiilikarttaMockScenarioState('unknown-state')).toBeNull()
    expect(normalizeHiilikarttaMockScenarioState(undefined)).toBeNull()
  })

  it.each([
    'home',
    'plans-empty',
    'plans-seeded',
    'cloud-placeholders',
    'import-placeholder',
    'draw-empty-plan',
    'plan-valid',
    'plan-invalid-zoning',
    'plan-invalid-land-use',
    'save-login',
    'save-ready',
    'save-disabled',
    'save-saved',
    'calc-not-started',
    'calc-initializing',
    'calc-calculating',
    'calc-errored',
    'calc-finished',
    'areas-valid',
    'areas-invalid-zoning',
    'areas-invalid-land-use',
    'report-single-local',
    'report-comparison',
    'report-external',
    'report-invalid-id',
    'report-no-data',
  ])('builds a full store patch for %s', (state) => {
    const builtState = buildHiilikarttaMockScenarioState(state)

    expect(builtState?.state).toBe(state)
    expect(builtState?.storeState).toEqual(
      expect.objectContaining({
        planConfs: expect.any(Object),
        placeholderPlanConfs: expect.any(Object),
        creationPlaceholderPlanConfs: expect.any(Object),
        externalPlanConfs: expect.any(Object),
        globalState: expect.any(String),
      })
    )
  })

  it('builds seeded plans with stable route-facing ids and server ids', () => {
    const builtState = buildHiilikarttaMockScenarioState('plans-seeded')
    const planConfs = builtState?.storeState.planConfs ?? {}

    expect(Object.keys(planConfs)).toEqual(
      expect.arrayContaining([
        MOCK_LOCAL_PLAN_ID,
        MOCK_SERVER_PLAN_ID,
        MOCK_INVALID_PLAN_ID,
        MOCK_COMPARISON_PLAN_ID,
      ])
    )
    expect(planConfs[MOCK_SERVER_PLAN_ID].serverId).toBe(
      MOCK_SERVER_PLAN_SERVER_ID
    )
    expect(planConfs[MOCK_INVALID_PLAN_ID].serverId).toBe(
      MOCK_INVALID_PLAN_SERVER_ID
    )
    expect(builtState?.storeState.globalState).toBe(GlobalState.IDLE)
  })

  it('keeps hyphenated route ids out of map layer id parser errors', () => {
    const layerGroupId = getPlanLayerGroupId(MOCK_LOCAL_PLAN_ID)

    expect(layerGroupId).not.toContain('-')

    for (const layerType of ['outline', 'fill', 'symbol']) {
      expect(`${layerGroupId}-${layerType}`.split('-')).toHaveLength(2)
    }
  })

  it('builds deterministic placeholders and creation placeholders', () => {
    const cloudState = buildHiilikarttaMockScenarioState('cloud-loading')
    const importState = buildHiilikarttaMockScenarioState('import-placeholder')

    expect(cloudState?.state).toBe('cloud-placeholders')
    expect(cloudState?.storeState.globalState).toBe(GlobalState.FETCHING)
    expect(cloudState?.storeState.placeholderPlanConfs[MOCK_SERVER_PLAN_ID]).toEqual(
      expect.objectContaining({
        id: MOCK_SERVER_PLAN_ID,
        serverId: MOCK_SERVER_PLAN_SERVER_ID,
      })
    )
    expect(
      importState?.storeState.creationPlaceholderPlanConfs[MOCK_LOCAL_PLAN_ID]
    ).toEqual(
      expect.objectContaining({
        id: MOCK_LOCAL_PLAN_ID,
        status: 'awaiting-file',
      })
    )
  })

  it('builds valid plan and area data that pass existing land-use validation', () => {
    const builtState = buildHiilikarttaMockScenarioState('areas-valid')
    const planConf = builtState?.storeState.planConfs[MOCK_LOCAL_PLAN_ID]

    expect(planConf?.data.features).toHaveLength(3)
    expect(
      planConf?.data.features.every(
        (feature) =>
          feature.properties.extras?.hasValidZoningCode === true &&
          checkIsValidLandUseDistribution(feature.properties)
      )
    ).toBe(true)
  })

  it('builds invalid zoning state with the stable invalid plan id', () => {
    const builtState = buildHiilikarttaMockScenarioState('plan-invalid-zoning')
    const planConf = builtState?.storeState.planConfs[MOCK_INVALID_PLAN_ID]
    const feature = planConf?.data.features[0]

    expect(planConf?.id).toBe(MOCK_INVALID_PLAN_ID)
    expect(feature?.properties.zoning_code).toBe('INVALID')
    expect(feature?.properties.extras?.hasValidZoningCode).toBe(false)
  })

  it('builds areas invalid zoning with import-style invalid area data', () => {
    const builtState = buildHiilikarttaMockScenarioState(
      'areas-invalid-zoning'
    )
    const planConf = builtState?.storeState.planConfs[MOCK_INVALID_PLAN_ID]
    const feature = planConf?.data.features[0]

    expect(planConf?.id).toBe(MOCK_INVALID_PLAN_ID)
    expect(feature?.properties.name).toBe(1)
    expect(feature?.properties.zoning_code).toBe('')
    expect(feature?.properties.extras?.hasValidZoningCode).toBe(false)
  })

  it('builds invalid land-use state that fails existing land-use validation', () => {
    const builtState = buildHiilikarttaMockScenarioState(
      'areas-invalid-land-use'
    )
    const planConf = builtState?.storeState.planConfs[MOCK_INVALID_PLAN_ID]
    const feature = planConf?.data.features[0]

    expect(planConf?.id).toBe(MOCK_INVALID_PLAN_ID)
    expect(feature?.properties.extras?.hasValidZoningCode).toBe(true)
    expect(
      feature ? checkIsValidLandUseDistribution(feature.properties) : true
    ).toBe(false)
  })

  it.each([
    ['calc-not-started', CalculationState.NOT_STARTED],
    ['calc-initializing', CalculationState.INITIALIZING],
    ['calc-calculating', CalculationState.CALCULATING],
    ['calc-errored', CalculationState.ERRORED],
  ])('builds %s without stale report data', (state, calculationState) => {
    const builtState = buildHiilikarttaMockScenarioState(state)
    const planConf = builtState?.storeState.planConfs[MOCK_SERVER_PLAN_ID]

    expect(planConf?.serverId).toBe(MOCK_SERVER_PLAN_SERVER_ID)
    expect(planConf?.calculationState).toBe(calculationState)
    expect(planConf?.reportData).toBeUndefined()
  })

  it('builds finished calculation state with structurally complete report data', () => {
    const builtState = buildHiilikarttaMockScenarioState('calc-finished')
    const planConf = builtState?.storeState.planConfs[MOCK_SERVER_PLAN_ID]
    const reportData = planConf?.reportData

    expect(planConf?.calculationState).toBe(CalculationState.FINISHED)
    expect(reportData?.metadata.featureYears).toEqual([...MOCK_FEATURE_YEARS])
    expect(reportData?.areas.features.length).toBeGreaterThan(0)
    expect(reportData?.totals.features[0]).toBeDefined()

    for (const featureCol of featureCols) {
      expect(reportData?.totals.features[0].properties[featureCol]).toEqual({
        nochange: expect.any(Object),
        planned: expect.any(Object),
      })
    }

    expect(reportData?.agg.totals.bio_carbon_total_diff['2050']).toEqual(
      expect.any(Number)
    )
  })

  it('builds a single local report state with route ids and report server ids kept separate', () => {
    const builtState = buildHiilikarttaMockScenarioState('report-single-local')
    const planConfs = builtState?.storeState.planConfs ?? {}
    const localPlanConf = planConfs[MOCK_LOCAL_PLAN_ID]
    const serverPlanConf = planConfs[MOCK_SERVER_PLAN_ID]

    expect(localPlanConf).toEqual(
      expect.objectContaining({
        id: MOCK_LOCAL_PLAN_ID,
        serverId: MOCK_LOCAL_PLAN_SERVER_ID,
        calculationState: CalculationState.FINISHED,
      })
    )
    expect(localPlanConf?.reportData?.metadata).toEqual(
      expect.objectContaining({
        reportName: 'Mock local carbon plan',
        featureYears: [...MOCK_FEATURE_YEARS],
      })
    )
    expect(serverPlanConf).toEqual(
      expect.objectContaining({
        id: MOCK_SERVER_PLAN_ID,
        serverId: MOCK_SERVER_PLAN_SERVER_ID,
        calculationState: CalculationState.FINISHED,
      })
    )
    expect(builtState?.storeState.externalPlanConfs).toEqual({})
    expect(builtState?.storeState.globalState).toBe(GlobalState.IDLE)
  })

  it('builds a comparison report state with two deterministic finished reports', () => {
    const builtState = buildHiilikarttaMockScenarioState('report-comparison')
    const planConfs = builtState?.storeState.planConfs ?? {}
    const localPlanConf = planConfs[MOCK_LOCAL_PLAN_ID]
    const comparisonPlanConf = planConfs[MOCK_COMPARISON_PLAN_ID]

    expect(Object.keys(planConfs)).toEqual([
      MOCK_LOCAL_PLAN_ID,
      MOCK_COMPARISON_PLAN_ID,
    ])
    expect(localPlanConf?.serverId).toBe(MOCK_LOCAL_PLAN_SERVER_ID)
    expect(comparisonPlanConf).toEqual(
      expect.objectContaining({
        id: MOCK_COMPARISON_PLAN_ID,
        serverId: MOCK_COMPARISON_PLAN_SERVER_ID,
        calculationState: CalculationState.FINISHED,
        forestryScenario: 2,
      })
    )
    expect(localPlanConf?.reportData?.metadata.featureYears).toEqual(
      comparisonPlanConf?.reportData?.metadata.featureYears
    )
    expect(comparisonPlanConf?.reportData?.metadata).toEqual(
      expect.objectContaining({
        forestry_scenario: 2,
        reportName: 'Mock comparison carbon plan',
      })
    )
  })

  it('builds an external report using the stable client-side alias instead of adding a server endpoint', () => {
    const builtState = buildHiilikarttaMockScenarioState('report-external')
    const externalPlanConf =
      builtState?.storeState.externalPlanConfs[MOCK_EXTERNAL_PLAN_ID]

    expect(MOCK_EXTERNAL_PLAN_ID).not.toBe(MOCK_EXTERNAL_REPORT_SERVER_ID)
    expect(MOCK_EXTERNAL_PLAN_ID).not.toBe(MOCK_EXTERNAL_REPORT_ERROR_SERVER_ID)
    expect(externalPlanConf).toEqual(
      expect.objectContaining({
        serverId: MOCK_EXTERNAL_PLAN_ID,
        status: FetchStatus.FETCHED,
        name: 'Mock external carbon report',
      })
    )
    expect(externalPlanConf?.reportData?.metadata.featureYears).toEqual([
      ...MOCK_FEATURE_YEARS,
    ])
  })

  it('builds invalid and no-data report states that settle without loading', () => {
    const invalidState = buildHiilikarttaMockScenarioState('report-invalid-id')
    const invalidExternalPlanConf =
      invalidState?.storeState.externalPlanConfs[MOCK_INVALID_PLAN_ID]
    const noDataState = buildHiilikarttaMockScenarioState('report-no-data')
    const noDataPlanConf =
      noDataState?.storeState.planConfs[MOCK_INVALID_PLAN_ID]

    expect(invalidExternalPlanConf).toEqual(
      expect.objectContaining({
        serverId: MOCK_INVALID_PLAN_ID,
        status: FetchStatus.ERRORED,
      })
    )
    expect(invalidState?.storeState.globalState).toBe(GlobalState.IDLE)
    expect(noDataPlanConf).toEqual(
      expect.objectContaining({
        id: MOCK_INVALID_PLAN_ID,
        serverId: MOCK_INVALID_PLAN_SERVER_ID,
        calculationState: CalculationState.FINISHED,
        reportData: undefined,
      })
    )
    expect(noDataState?.storeState.globalState).toBe(GlobalState.IDLE)
  })

  it('applies a built state to the applet store', () => {
    const appliedState = applyHiilikarttaMockScenarioState('plan valid')

    expect(appliedState?.state).toBe('plan-valid')
    expect(useAppletStore.getState().planConfs[MOCK_LOCAL_PLAN_ID]).toEqual(
      expect.objectContaining({
        id: MOCK_LOCAL_PLAN_ID,
        calculationState: CalculationState.NOT_STARTED,
      })
    )
  })

  it('applies report external state to the applet store', () => {
    const appliedState = applyHiilikarttaMockScenarioState('report external')

    expect(appliedState?.state).toBe('report-external')
    expect(
      useAppletStore.getState().externalPlanConfs[MOCK_EXTERNAL_PLAN_ID]
    ).toEqual(
      expect.objectContaining({
        serverId: MOCK_EXTERNAL_PLAN_ID,
        status: FetchStatus.FETCHED,
      })
    )
  })
})
