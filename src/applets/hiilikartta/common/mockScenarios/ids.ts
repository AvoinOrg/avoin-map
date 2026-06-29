export const MOCK_LOCAL_PLAN_ID = 'mock-local-plan'
export const MOCK_SERVER_PLAN_ID = 'mock-server-plan'
export const MOCK_INVALID_PLAN_ID = 'mock-invalid-plan'
export const MOCK_COMPARISON_PLAN_ID = 'mock-comparison-plan'

export const MOCK_LOCAL_PLAN_SERVER_ID = 'mock-plan-local'
export const MOCK_SERVER_PLAN_SERVER_ID = 'mock-plan-seeded'
export const MOCK_INVALID_PLAN_SERVER_ID = 'mock-plan-invalid'
export const MOCK_COMPARISON_PLAN_SERVER_ID = 'mock-plan-comparison'

const STATIC_MOCK_CALCULATION_SERVER_IDS = new Set([
  MOCK_LOCAL_PLAN_SERVER_ID,
  MOCK_SERVER_PLAN_SERVER_ID,
  MOCK_INVALID_PLAN_SERVER_ID,
  MOCK_COMPARISON_PLAN_SERVER_ID,
])

export const isStaticMockCalculationServerId = (
  serverId: string | null | undefined
) =>
  typeof serverId === 'string' &&
  STATIC_MOCK_CALCULATION_SERVER_IDS.has(serverId)
