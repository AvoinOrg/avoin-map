import {
  HIILIKARTTA_MOCK_SCENARIOS_ENABLED_ENV,
  MOCK_CARBON_STATE_QUERY_PARAM,
  MOCK_RESET_QUERY_PARAM,
  assertHiilikarttaMockScenariosAllowed,
  isHiilikarttaMockScenariosEnabled,
} from './config'

describe('Hiilikartta mock scenario config', () => {
  it('exports the canonical public flag and query parameter names', () => {
    expect(HIILIKARTTA_MOCK_SCENARIOS_ENABLED_ENV).toBe(
      'NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED'
    )
    expect(MOCK_CARBON_STATE_QUERY_PARAM).toBe('mockCarbonState')
    expect(MOCK_RESET_QUERY_PARAM).toBe('mockReset')
  })

  it.each(['1', 'true', 'yes', 'on', ' TRUE '])(
    'enables scenarios for truthy flag value %s',
    (flagValue) => {
      expect(
        isHiilikarttaMockScenariosEnabled({
          NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED: flagValue,
          NODE_ENV: 'test',
        })
      ).toBe(true)
    }
  )

  it.each([undefined, '', '0', 'false', 'off', 'no'])(
    'keeps scenarios disabled for non-truthy flag value %s',
    (flagValue) => {
      expect(
        isHiilikarttaMockScenariosEnabled({
          NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED: flagValue,
          NODE_ENV: 'test',
        })
      ).toBe(false)
    }
  )

  it('refuses enabled mock scenarios in production', () => {
    expect(() =>
      assertHiilikarttaMockScenariosAllowed({
        NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED: 'yes',
        NODE_ENV: 'production',
      })
    ).toThrow(
      'Hiilikartta mock scenarios cannot be enabled when NODE_ENV=production. Unset NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED.'
    )
  })

  it('allows production when the scenario flag is disabled', () => {
    expect(() =>
      assertHiilikarttaMockScenariosAllowed({
        NEXT_PUBLIC_HIILIKARTTA_MOCK_SCENARIOS_ENABLED: '0',
        NODE_ENV: 'production',
      })
    ).not.toThrow()
  })
})
