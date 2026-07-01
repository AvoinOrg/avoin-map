export type LuonnonmetsakartatMockScenariosEnv = Record<
  string,
  string | undefined
> & {
  NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED?: string
  NODE_ENV?: string
}

export const LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED_ENV =
  'NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED'
export const MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM =
  'mockLuonnonmetsakartatState'
export const MOCK_RESET_QUERY_PARAM = 'mockReset'

const LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED_VALUES = new Set([
  '1',
  'true',
  'yes',
  'on',
])

const getDefaultLuonnonmetsakartatMockScenariosEnv =
  (): LuonnonmetsakartatMockScenariosEnv => ({
    NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED:
      process.env.NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED,
    NODE_ENV: process.env.NODE_ENV,
  })

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const isTruthyLuonnonmetsakartatMockScenariosFlag = (
  value: string | undefined
) => LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED_VALUES.has(normalizeFlag(value))

export const assertLuonnonmetsakartatMockScenariosAllowed = (
  env: LuonnonmetsakartatMockScenariosEnv = getDefaultLuonnonmetsakartatMockScenariosEnv()
) => {
  if (
    isTruthyLuonnonmetsakartatMockScenariosFlag(
      env.NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED
    ) &&
    env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Luonnonmetsakartat mock scenarios cannot be enabled when NODE_ENV=production. Unset NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED.'
    )
  }
}

export const isLuonnonmetsakartatMockScenariosEnabled = (
  env: LuonnonmetsakartatMockScenariosEnv = getDefaultLuonnonmetsakartatMockScenariosEnv()
) => {
  assertLuonnonmetsakartatMockScenariosAllowed(env)

  return isTruthyLuonnonmetsakartatMockScenariosFlag(
    env.NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED
  )
}
