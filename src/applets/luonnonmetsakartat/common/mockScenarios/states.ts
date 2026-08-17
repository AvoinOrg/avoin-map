export const SCENARIO_STATES = [
  'public-empty',
  'public-layers',
  'admin-unauthenticated',
  'admin-rejected',
  'admin-errored',
  'admin-loading',
  'admin-empty',
  'admin-layers',
  'layer-detail',
  'settings-clean',
  'settings-unsynced',
  'settings-saving',
  'pictures-empty',
  'pictures-mapped',
  'pictures-unmatched',
] as const

const SCENARIO_STATE_SET = new Set<string>(SCENARIO_STATES)

export type LuonnonmetsakartatMockScenarioState =
  (typeof SCENARIO_STATES)[number]

const STATE_ALIASES: Record<string, LuonnonmetsakartatMockScenarioState> = {
  admin: 'admin-layers',
  layer: 'layer-detail',
  public: 'public-layers',
  settings: 'settings-clean',
  pictures: 'pictures-mapped',
}

const normalizeStateKey = (state: string | null | undefined) =>
  state?.trim().toLowerCase().replace(/[\s_]+/g, '-') ?? ''

export const normalizeLuonnonmetsakartatMockScenarioState = (
  state: string | null | undefined
): LuonnonmetsakartatMockScenarioState | null => {
  const normalizedState = normalizeStateKey(state)
  const aliasedState = STATE_ALIASES[normalizedState] ?? normalizedState

  return SCENARIO_STATE_SET.has(aliasedState)
    ? (aliasedState as LuonnonmetsakartatMockScenarioState)
    : null
}
