import { useMemo } from 'react'

import { useAppSearchParams } from '#/common/navigation/navigation'

import {
  MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM,
  isLuonnonmetsakartatMockScenariosEnabled,
} from './config'
import { normalizeLuonnonmetsakartatMockScenarioState } from './states'

export const useLuonnonmetsakartatMockScenarioQueryState = () => {
  const searchParams = useAppSearchParams()
  const mockStateQuery = searchParams.get(
    MOCK_LUONNONMETSAKARTAT_STATE_QUERY_PARAM
  )
  const isMockScenariosEnabled = isLuonnonmetsakartatMockScenariosEnabled()

  return useMemo(
    () =>
      isMockScenariosEnabled
        ? normalizeLuonnonmetsakartatMockScenarioState(mockStateQuery)
        : null,
    [isMockScenariosEnabled, mockStateQuery]
  )
}
