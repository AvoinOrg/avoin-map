import {
  LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED_ENV,
  MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
  assertLuonnonmetsakartatMockScenariosAllowed,
  isLuonnonmetsakartatMockScenariosEnabled,
} from './config'

describe('Luonnonmetsakartat mock scenario config', () => {
  it('exports the canonical public flag and query parameter names', () => {
    expect(LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED_ENV).toBe(
      'NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED'
    )
    expect(MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM).toBe(
      'mockLuonnonmetsakartatState'
    )
    expect(MOCK_RESET_QUERY_PARAM).toBe('mockReset')
  })

  it.each(['1', 'true', 'yes', 'on', ' TRUE '])(
    'enables scenarios for truthy flag value %s',
    (flagValue) => {
      expect(
        isLuonnonmetsakartatMockScenariosEnabled({
          NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED: flagValue,
          NODE_ENV: 'test',
        })
      ).toBe(true)
    }
  )

  it.each([undefined, '', '0', 'false', 'off', 'no'])(
    'keeps scenarios disabled for non-truthy flag value %s',
    (flagValue) => {
      expect(
        isLuonnonmetsakartatMockScenariosEnabled({
          NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED: flagValue,
          NODE_ENV: 'test',
        })
      ).toBe(false)
    }
  )

  it('refuses enabled mock scenarios in production', () => {
    expect(() =>
      assertLuonnonmetsakartatMockScenariosAllowed({
        NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED: 'yes',
        NODE_ENV: 'production',
      })
    ).toThrow(
      'Luonnonmetsakartat mock scenarios cannot be enabled when NODE_ENV=production. Unset NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED.'
    )
  })

  it('allows production when the scenario flag is disabled', () => {
    expect(() =>
      assertLuonnonmetsakartatMockScenariosAllowed({
        NEXT_PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED: '0',
        NODE_ENV: 'production',
      })
    ).not.toThrow()
  })
})
