export type HiilikarttaMockScenariosEnv = Record<string, string | undefined> & {
  PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED?: string
  NODE_ENV?: string
}

export const HIILIKARTTA_MOCK_SCENARIOS_ENABLED_ENV =
  'PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED'
export const MOCK_CARBON_STATE_QUERY_PARAM = 'mockCarbonState'
export const MOCK_RESET_QUERY_PARAM = 'mockReset'

const HIILIKARTTA_MOCK_SCENARIOS_ENABLED_VALUES = new Set([
  '1',
  'true',
  'yes',
  'on',
])

const getDefaultHiilikarttaMockScenariosEnv =
  (): HiilikarttaMockScenariosEnv => ({
    PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED:
      process.env.PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED,
    NODE_ENV: process.env.NODE_ENV,
  })

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const isTruthyHiilikarttaMockScenariosFlag = (value: string | undefined) =>
  HIILIKARTTA_MOCK_SCENARIOS_ENABLED_VALUES.has(normalizeFlag(value))

export const assertHiilikarttaMockScenariosAllowed = (
  env: HiilikarttaMockScenariosEnv = getDefaultHiilikarttaMockScenariosEnv()
) => {
  if (
    isTruthyHiilikarttaMockScenariosFlag(
      env.PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED
    ) &&
    env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Hiilikartta mock scenarios cannot be enabled when NODE_ENV=production. Unset PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED.'
    )
  }
}

export const isHiilikarttaMockScenariosEnabled = (
  env: HiilikarttaMockScenariosEnv = getDefaultHiilikarttaMockScenariosEnv()
) => {
  assertHiilikarttaMockScenariosAllowed(env)

  return isTruthyHiilikarttaMockScenariosFlag(
    env.PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED
  )
}
