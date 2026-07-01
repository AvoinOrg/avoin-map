import { FetchStatus } from '#/common/types/general'

import { useAppletStore } from 'applets/hiilikartta/state/appletStore'

import { DEFAULT_FORESTRY_SCENARIO } from '../constants'
import {
  CalculationState,
  CreationPlaceholderPlanConf,
  ExternalPlanConf,
  GlobalState,
  PlaceholderPlanConf,
  PlanConf,
  PlanConfState,
} from '../types'
import {
  MOCK_COMPARISON_PLAN_ID,
  MOCK_COMPARISON_PLAN_SERVER_ID,
  MOCK_EXTERNAL_PLAN_ID,
  MOCK_INVALID_PLAN_ID,
  MOCK_INVALID_PLAN_SERVER_ID,
  MOCK_LOCAL_PLAN_ID,
  MOCK_LOCAL_PLAN_SERVER_ID,
  MOCK_SERVER_PLAN_ID,
  MOCK_SERVER_PLAN_SERVER_ID,
} from './ids'
import {
  MOCK_PLAN_CREATED_AT,
  MOCK_PLAN_SAVED_AT,
  MOCK_PLAN_USER_ID,
  createMockEmptyPlanData,
  createMockInvalidLandUsePlanData,
  createMockInvalidZoningPlanData,
  createMockReportData,
  createMockValidPlanData,
  getMockPlanAreaHa,
} from './seedData'

const SCENARIO_STATES = [
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
] as const

const SCENARIO_STATE_SET = new Set<string>(SCENARIO_STATES)

export type HiilikarttaMockScenarioState = (typeof SCENARIO_STATES)[number]

export type HiilikarttaMockScenarioStoreState = {
  planConfs: Record<string, PlanConf>
  placeholderPlanConfs: Record<string, PlaceholderPlanConf>
  creationPlaceholderPlanConfs: Record<string, CreationPlaceholderPlanConf>
  externalPlanConfs: Record<string, ExternalPlanConf>
  globalState: GlobalState
}

export type BuiltHiilikarttaMockScenarioState = {
  state: HiilikarttaMockScenarioState
  storeState: HiilikarttaMockScenarioStoreState
}

const STATE_ALIASES: Record<string, HiilikarttaMockScenarioState> = {
  'cloud-loading': 'cloud-placeholders',
}

const normalizeStateKey = (state: string | null | undefined) =>
  state?.trim().toLowerCase().replace(/[\s_]+/g, '-') ?? ''

export const normalizeHiilikarttaMockScenarioState = (
  state: string | null | undefined
): HiilikarttaMockScenarioState | null => {
  const normalizedState = normalizeStateKey(state)
  const aliasedState = STATE_ALIASES[normalizedState] ?? normalizedState

  return SCENARIO_STATE_SET.has(aliasedState)
    ? (aliasedState as HiilikarttaMockScenarioState)
    : null
}

const baseStoreState = ({
  externalPlanConfs = {},
  globalState = GlobalState.IDLE,
  planConfs = {},
  placeholderPlanConfs = {},
  creationPlaceholderPlanConfs = {},
}: Partial<HiilikarttaMockScenarioStoreState> = {}): HiilikarttaMockScenarioStoreState => ({
  planConfs,
  placeholderPlanConfs,
  creationPlaceholderPlanConfs,
  externalPlanConfs,
  globalState,
})

const createPlanConf = ({
  calculationState = CalculationState.NOT_STARTED,
  cloudLastSaved,
  created = MOCK_PLAN_CREATED_AT,
  data = createMockValidPlanData(),
  draftType,
  id = MOCK_LOCAL_PLAN_ID,
  importState = 'confirmed',
  localLastEdited = created,
  localLastSaved,
  name = 'Mock local carbon plan',
  reportData,
  serverId = MOCK_LOCAL_PLAN_SERVER_ID,
  state = PlanConfState.IDLE,
  userId,
  forestryScenario = DEFAULT_FORESTRY_SCENARIO,
}: Partial<PlanConf> & Pick<PlanConf, 'id' | 'serverId'>): PlanConf => ({
  id,
  serverId,
  created,
  name,
  areaHa: getMockPlanAreaHa(data),
  data,
  calculationState,
  reportData,
  forestryScenario,
  state,
  cloudLastSaved,
  localLastEdited,
  localLastSaved,
  userId,
  isHidden: false,
  draftType,
  importState,
})

const createValidLocalPlanConf = (overrides: Partial<PlanConf> = {}) =>
  createPlanConf({
    id: MOCK_LOCAL_PLAN_ID,
    serverId: MOCK_LOCAL_PLAN_SERVER_ID,
    name: 'Mock local carbon plan',
    ...overrides,
  })

const createServerPlanConf = (overrides: Partial<PlanConf> = {}) =>
  createPlanConf({
    id: MOCK_SERVER_PLAN_ID,
    serverId: MOCK_SERVER_PLAN_SERVER_ID,
    name: 'Mock seeded carbon plan',
    cloudLastSaved: MOCK_PLAN_SAVED_AT,
    localLastSaved: MOCK_PLAN_SAVED_AT,
    localLastEdited: MOCK_PLAN_SAVED_AT,
    userId: MOCK_PLAN_USER_ID,
    ...overrides,
  })

const createComparisonPlanConf = () =>
  createPlanConf({
    id: MOCK_COMPARISON_PLAN_ID,
    serverId: MOCK_COMPARISON_PLAN_SERVER_ID,
    created: MOCK_PLAN_CREATED_AT + 20_000,
    name: 'Mock comparison carbon plan',
    data: createMockValidPlanData(),
  })

const createFinishedLocalPlanConf = () => {
  const data = createMockValidPlanData()

  return createValidLocalPlanConf({
    data,
    calculationState: CalculationState.FINISHED,
    reportData: createMockReportData({
      forestryScenario: DEFAULT_FORESTRY_SCENARIO,
      planData: data,
      reportName: 'Mock local carbon plan',
    }),
  })
}

const createFinishedComparisonPlanConf = () => {
  const data = createMockValidPlanData()
  const forestryScenario = 2

  return createPlanConf({
    id: MOCK_COMPARISON_PLAN_ID,
    serverId: MOCK_COMPARISON_PLAN_SERVER_ID,
    created: MOCK_PLAN_CREATED_AT + 20_000,
    name: 'Mock comparison carbon plan',
    data,
    calculationState: CalculationState.FINISHED,
    forestryScenario,
    reportData: createMockReportData({
      forestryScenario,
      planData: data,
      reportName: 'Mock comparison carbon plan',
    }),
  })
}

const createInvalidZoningPlanConf = () =>
  createPlanConf({
    id: MOCK_INVALID_PLAN_ID,
    serverId: MOCK_INVALID_PLAN_SERVER_ID,
    name: 'Mock invalid zoning plan',
    data: createMockInvalidZoningPlanData(),
  })

const createInvalidLandUsePlanConf = () =>
  createPlanConf({
    id: MOCK_INVALID_PLAN_ID,
    serverId: MOCK_INVALID_PLAN_SERVER_ID,
    name: 'Mock invalid land use plan',
    data: createMockInvalidLandUsePlanData(),
  })

const createNoDataReportPlanConf = () =>
  createPlanConf({
    id: MOCK_INVALID_PLAN_ID,
    serverId: MOCK_INVALID_PLAN_SERVER_ID,
    name: 'Mock report without data',
    data: createMockValidPlanData(),
    calculationState: CalculationState.FINISHED,
    reportData: undefined,
  })

const createFinishedServerPlanConf = () => {
  const data = createMockValidPlanData()

  return createServerPlanConf({
    data,
    calculationState: CalculationState.FINISHED,
    reportData: createMockReportData({
      forestryScenario: DEFAULT_FORESTRY_SCENARIO,
      planData: data,
      reportName: 'Mock seeded carbon plan',
    }),
  })
}

const createFetchedExternalReportPlanConf = (): ExternalPlanConf => {
  const data = createMockValidPlanData()

  return {
    serverId: MOCK_EXTERNAL_PLAN_ID,
    status: FetchStatus.FETCHED,
    name: 'Mock external carbon report',
    reportData: createMockReportData({
      forestryScenario: DEFAULT_FORESTRY_SCENARIO,
      planData: data,
      reportName: 'Mock external carbon report',
    }),
  }
}

const createErroredInvalidReportPlanConf = (): ExternalPlanConf => ({
  serverId: MOCK_INVALID_PLAN_ID,
  status: FetchStatus.ERRORED,
  name: 'Mock invalid carbon report',
})

const buildSeededPlansState = () => {
  const localPlanConf = createValidLocalPlanConf()
  const serverPlanConf = createFinishedServerPlanConf()
  const invalidPlanConf = createInvalidZoningPlanConf()
  const comparisonPlanConf = createComparisonPlanConf()

  return baseStoreState({
    planConfs: {
      [localPlanConf.id]: localPlanConf,
      [serverPlanConf.id]: serverPlanConf,
      [invalidPlanConf.id]: invalidPlanConf,
      [comparisonPlanConf.id]: comparisonPlanConf,
    },
  })
}

const buildCloudPlaceholderState = () => {
  const placeholderPlanConf: PlaceholderPlanConf = {
    id: MOCK_SERVER_PLAN_ID,
    serverId: MOCK_SERVER_PLAN_SERVER_ID,
    name: 'Mock seeded carbon plan',
    cloudLastSaved: MOCK_PLAN_SAVED_AT,
    userId: MOCK_PLAN_USER_ID,
    status: FetchStatus.FETCHING,
  }

  return baseStoreState({
    globalState: GlobalState.FETCHING,
    placeholderPlanConfs: {
      [placeholderPlanConf.id]: placeholderPlanConf,
    },
  })
}

const buildImportPlaceholderState = () => {
  const creationPlaceholderPlanConf: CreationPlaceholderPlanConf = {
    id: MOCK_LOCAL_PLAN_ID,
    created: MOCK_PLAN_CREATED_AT,
    status: 'awaiting-file',
  }

  return baseStoreState({
    creationPlaceholderPlanConfs: {
      [creationPlaceholderPlanConf.id]: creationPlaceholderPlanConf,
    },
  })
}

const buildDrawEmptyPlanState = () => {
  const planConf = createValidLocalPlanConf({
    data: createMockEmptyPlanData(),
    draftType: 'draw',
    importState: undefined,
    name: 'Mock drawn carbon plan',
  })

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildPlanValidState = () => {
  const planConf = createValidLocalPlanConf()

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildSaveSavedState = () => {
  const planConf = createValidLocalPlanConf({
    cloudLastSaved: MOCK_PLAN_SAVED_AT,
    localLastSaved: MOCK_PLAN_SAVED_AT,
    localLastEdited: MOCK_PLAN_SAVED_AT,
    userId: MOCK_PLAN_USER_ID,
  })

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildSaveDisabledState = () => {
  const planConf = createValidLocalPlanConf({
    data: createMockEmptyPlanData(),
    name: 'Mock empty carbon plan',
  })

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildInvalidZoningState = () => {
  const planConf = createInvalidZoningPlanConf()

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildInvalidLandUseState = () => {
  const planConf = createInvalidLandUsePlanConf()

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildCalculationState = (calculationState: CalculationState) => {
  if (calculationState === CalculationState.FINISHED) {
    const planConf = createFinishedServerPlanConf()

    return baseStoreState({
      planConfs: {
        [planConf.id]: planConf,
      },
    })
  }

  const planConf = createServerPlanConf({
    calculationState,
    reportData: undefined,
  })

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

const buildReportSingleLocalState = () => {
  const localPlanConf = createFinishedLocalPlanConf()
  const serverPlanConf = createFinishedServerPlanConf()

  return baseStoreState({
    planConfs: {
      [localPlanConf.id]: localPlanConf,
      [serverPlanConf.id]: serverPlanConf,
    },
  })
}

const buildReportComparisonState = () => {
  const localPlanConf = createFinishedLocalPlanConf()
  const comparisonPlanConf = createFinishedComparisonPlanConf()

  return baseStoreState({
    planConfs: {
      [localPlanConf.id]: localPlanConf,
      [comparisonPlanConf.id]: comparisonPlanConf,
    },
  })
}

const buildReportExternalState = () => {
  const externalPlanConf = createFetchedExternalReportPlanConf()

  return baseStoreState({
    externalPlanConfs: {
      [MOCK_EXTERNAL_PLAN_ID]: externalPlanConf,
    },
  })
}

const buildReportInvalidIdState = () => {
  const externalPlanConf = createErroredInvalidReportPlanConf()

  return baseStoreState({
    externalPlanConfs: {
      [MOCK_INVALID_PLAN_ID]: externalPlanConf,
    },
  })
}

const buildReportNoDataState = () => {
  const planConf = createNoDataReportPlanConf()

  return baseStoreState({
    planConfs: {
      [planConf.id]: planConf,
    },
  })
}

export const buildHiilikarttaMockScenarioState = (
  state: string | null | undefined
): BuiltHiilikarttaMockScenarioState | null => {
  const normalizedState = normalizeHiilikarttaMockScenarioState(state)

  if (normalizedState == null) {
    return null
  }

  switch (normalizedState) {
    case 'home':
    case 'plans-empty':
      return {
        state: normalizedState,
        storeState: baseStoreState(),
      }
    case 'plans-seeded':
      return {
        state: normalizedState,
        storeState: buildSeededPlansState(),
      }
    case 'cloud-placeholders':
      return {
        state: normalizedState,
        storeState: buildCloudPlaceholderState(),
      }
    case 'import-placeholder':
      return {
        state: normalizedState,
        storeState: buildImportPlaceholderState(),
      }
    case 'draw-empty-plan':
      return {
        state: normalizedState,
        storeState: buildDrawEmptyPlanState(),
      }
    case 'plan-valid':
    case 'areas-valid':
    case 'save-login':
    case 'save-ready':
      return {
        state: normalizedState,
        storeState: buildPlanValidState(),
      }
    case 'save-saved':
      return {
        state: normalizedState,
        storeState: buildSaveSavedState(),
      }
    case 'save-disabled':
      return {
        state: normalizedState,
        storeState: buildSaveDisabledState(),
      }
    case 'plan-invalid-zoning':
    case 'areas-invalid-zoning':
      return {
        state: normalizedState,
        storeState: buildInvalidZoningState(),
      }
    case 'plan-invalid-land-use':
    case 'areas-invalid-land-use':
      return {
        state: normalizedState,
        storeState: buildInvalidLandUseState(),
      }
    case 'calc-not-started':
      return {
        state: normalizedState,
        storeState: buildCalculationState(CalculationState.NOT_STARTED),
      }
    case 'calc-initializing':
      return {
        state: normalizedState,
        storeState: buildCalculationState(CalculationState.INITIALIZING),
      }
    case 'calc-calculating':
      return {
        state: normalizedState,
        storeState: buildCalculationState(CalculationState.CALCULATING),
      }
    case 'calc-errored':
      return {
        state: normalizedState,
        storeState: buildCalculationState(CalculationState.ERRORED),
      }
    case 'calc-finished':
      return {
        state: normalizedState,
        storeState: buildCalculationState(CalculationState.FINISHED),
      }
    case 'report-single-local':
      return {
        state: normalizedState,
        storeState: buildReportSingleLocalState(),
      }
    case 'report-comparison':
      return {
        state: normalizedState,
        storeState: buildReportComparisonState(),
      }
    case 'report-external':
      return {
        state: normalizedState,
        storeState: buildReportExternalState(),
      }
    case 'report-invalid-id':
      return {
        state: normalizedState,
        storeState: buildReportInvalidIdState(),
      }
    case 'report-no-data':
      return {
        state: normalizedState,
        storeState: buildReportNoDataState(),
      }
  }
}

export const applyHiilikarttaMockScenarioState = (
  state: string | null | undefined
) => {
  const builtState = buildHiilikarttaMockScenarioState(state)

  if (builtState == null) {
    return null
  }

  useAppletStore.setState(builtState.storeState)

  return builtState
}
