import type { QueryClient, QueryKey } from '@tanstack/react-query'

import {
  MOCK_AUTH_MISSING_TOKEN_USER_ID,
  MOCK_AUTH_REJECTED_USER_ID,
  MOCK_AUTH_USER_ID,
} from '#/common/auth/mock'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'

import {
  AdminFolayerConf,
  AdminVerificationStatus,
  FolayerAreaConf,
  FolayerConf,
  FolayerConfState,
} from '../types'
import {
  MOCK_EMPTY_LAYER_ID,
  MOCK_VISIBLE_LAYER_ID,
} from './ids'
import {
  createLuonnonmetsakartatMockAdminFolayerConfs,
  createLuonnonmetsakartatMockFolayerAreaConfs,
  createLuonnonmetsakartatMockPicturesMappedFixtureState,
  createLuonnonmetsakartatMockPicturesUnmatchedFixtureState,
  createLuonnonmetsakartatMockPublicFolayerConfs,
} from './seedData'
import { getLuonnonmetsakartatMockQueryClients } from './reset'
import {
  normalizeLuonnonmetsakartatMockScenarioState,
  type LuonnonmetsakartatMockScenarioState,
} from './states'

export {
  SCENARIO_STATES,
  normalizeLuonnonmetsakartatMockScenarioState,
  type LuonnonmetsakartatMockScenarioState,
} from './states'

export type LuonnonmetsakartatMockScenarioStoreState = {
  folayerConfs: Record<string, FolayerConf>
  adminFolayerConfs: Record<string, AdminFolayerConf>
  folayerAreaConfs: Record<string, FolayerAreaConf>
  adminVerificationStatus: AdminVerificationStatus
}

export type LuonnonmetsakartatMockScenarioQueryDataEntry = {
  data: unknown
  queryKey: QueryKey
}

export type BuiltLuonnonmetsakartatMockScenarioState = {
  pictureFixtureState?: ReturnType<
    typeof createLuonnonmetsakartatMockPicturesMappedFixtureState
  >
  queryData: LuonnonmetsakartatMockScenarioQueryDataEntry[]
  state: LuonnonmetsakartatMockScenarioState
  storeState: LuonnonmetsakartatMockScenarioStoreState
}

type ApplyLuonnonmetsakartatMockScenarioStateOptions = {
  queryClients?: QueryClient | QueryClient[]
  state: string | null | undefined
}

const ADMIN_VERIFICATION_USER_IDS = [
  MOCK_AUTH_USER_ID,
  MOCK_AUTH_REJECTED_USER_ID,
  MOCK_AUTH_MISSING_TOKEN_USER_ID,
  undefined,
] as const

const mapById = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item])) as Record<string, T>

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const baseStoreState = ({
  adminFolayerConfs = {},
  adminVerificationStatus = AdminVerificationStatus.NoUser,
  folayerAreaConfs = {},
  folayerConfs = {},
}: Partial<LuonnonmetsakartatMockScenarioStoreState> = {}): LuonnonmetsakartatMockScenarioStoreState => ({
  folayerConfs,
  adminFolayerConfs,
  folayerAreaConfs,
  adminVerificationStatus,
})

const createVerificationQueryData = (
  adminVerificationStatus: AdminVerificationStatus
): LuonnonmetsakartatMockScenarioQueryDataEntry[] => {
  const data =
    adminVerificationStatus === AdminVerificationStatus.Verified
      ? true
      : adminVerificationStatus === AdminVerificationStatus.Rejected ||
          adminVerificationStatus === AdminVerificationStatus.NoUser
        ? false
        : null

  return ADMIN_VERIFICATION_USER_IDS.map((userId) => ({
    queryKey: ['adminVerificationQuery', userId],
    data,
  }))
}

const createPublicQueryData = (
  publicFolayerConfs: FolayerConf[],
  areaConfs: FolayerAreaConf[]
): LuonnonmetsakartatMockScenarioQueryDataEntry[] => [
  {
    queryKey: ['folayers'],
    data: publicFolayerConfs,
  },
  ...publicFolayerConfs
    .map((conf) => areaConfs.find((areaConf) => areaConf.id === conf.id))
    .filter((areaConf): areaConf is FolayerAreaConf => areaConf != null)
    .map((areaConf) => ({
      queryKey: ['folayerAreas', areaConf.id],
      data: areaConf,
    })),
]

const createAdminQueryData = ({
  adminFolayerConfs,
  adminVerificationStatus,
  areaConfs = [],
  includeList = true,
}: {
  adminFolayerConfs: AdminFolayerConf[]
  adminVerificationStatus: AdminVerificationStatus
  areaConfs?: FolayerAreaConf[]
  includeList?: boolean
}): LuonnonmetsakartatMockScenarioQueryDataEntry[] => [
  ...createVerificationQueryData(adminVerificationStatus),
  ...(includeList
    ? [
        {
          queryKey: ['adminFolayers'],
          data: adminFolayerConfs,
        },
      ]
    : []),
  ...adminFolayerConfs.map((conf) => ({
    queryKey: ['adminFolayer', conf.id],
    data: conf,
  })),
  ...areaConfs.map((areaConf) => ({
    queryKey: ['adminFolayerAreas', areaConf.id],
    data: areaConf,
  })),
  ...areaConfs.map((areaConf) => ({
    queryKey: ['folayerAreas', areaConf.id],
    data: areaConf,
  })),
]

const buildPublicLayersState = () => {
  const publicFolayerConfs = createLuonnonmetsakartatMockPublicFolayerConfs()
  const areaConfs = createLuonnonmetsakartatMockFolayerAreaConfs()
  const publicFolayerConfIds = new Set(
    publicFolayerConfs.map((conf) => conf.id)
  )

  return {
    queryData: createPublicQueryData(publicFolayerConfs, areaConfs),
    storeState: baseStoreState({
      folayerConfs: mapById(publicFolayerConfs),
      folayerAreaConfs: mapById(
        areaConfs.filter((areaConf) => publicFolayerConfIds.has(areaConf.id))
      ),
    }),
  }
}

const buildAdminStatusState = ({
  adminVerificationStatus,
}: {
  adminVerificationStatus: AdminVerificationStatus
}) => ({
  queryData: createVerificationQueryData(adminVerificationStatus),
  storeState: baseStoreState({ adminVerificationStatus }),
})

const buildAdminListState = ({
  adminFolayerConfs,
}: {
  adminFolayerConfs: AdminFolayerConf[]
}) => {
  const areaConfs = createLuonnonmetsakartatMockFolayerAreaConfs().filter(
    (areaConf) => adminFolayerConfs.some((conf) => conf.id === areaConf.id)
  )

  return {
    queryData: createAdminQueryData({
      adminFolayerConfs,
      adminVerificationStatus: AdminVerificationStatus.Verified,
      areaConfs,
    }),
    storeState: baseStoreState({
      adminVerificationStatus: AdminVerificationStatus.Verified,
      adminFolayerConfs: mapById(adminFolayerConfs),
      folayerAreaConfs: mapById(areaConfs),
    }),
  }
}

const createDetailSeed = ({
  updateSelectedLayer,
}: {
  updateSelectedLayer?: (layer: AdminFolayerConf) => AdminFolayerConf
} = {}) => {
  const publicFolayerConfs = createLuonnonmetsakartatMockPublicFolayerConfs()
  const adminFolayerConfs = createLuonnonmetsakartatMockAdminFolayerConfs()
  const selectedLayerIndex = adminFolayerConfs.findIndex(
    (layer) => layer.id === MOCK_VISIBLE_LAYER_ID
  )

  if (selectedLayerIndex >= 0 && updateSelectedLayer) {
    adminFolayerConfs[selectedLayerIndex] = updateSelectedLayer(
      adminFolayerConfs[selectedLayerIndex]
    )
  }

  const areaConfs = createLuonnonmetsakartatMockFolayerAreaConfs()
  const selectedAreaConf = areaConfs.find(
    (areaConf) => areaConf.id === MOCK_VISIBLE_LAYER_ID
  )
  const publicAreaConfs = areaConfs.filter((areaConf) =>
    publicFolayerConfs.some((conf) => conf.id === areaConf.id)
  )

  return {
    queryData: [
      ...createPublicQueryData(publicFolayerConfs, publicAreaConfs),
      ...createAdminQueryData({
        adminFolayerConfs,
        adminVerificationStatus: AdminVerificationStatus.Verified,
        areaConfs: selectedAreaConf ? [selectedAreaConf] : [],
      }),
    ],
    storeState: baseStoreState({
      adminVerificationStatus: AdminVerificationStatus.Verified,
      folayerConfs: mapById(publicFolayerConfs),
      adminFolayerConfs: mapById(adminFolayerConfs),
      folayerAreaConfs: selectedAreaConf ? mapById([selectedAreaConf]) : {},
    }),
  }
}

export const buildLuonnonmetsakartatMockScenarioState = (
  state: string | null | undefined
): BuiltLuonnonmetsakartatMockScenarioState | null => {
  const normalizedState = normalizeLuonnonmetsakartatMockScenarioState(state)

  if (normalizedState == null) {
    return null
  }

  switch (normalizedState) {
    case 'public-empty':
      return {
        state: normalizedState,
        storeState: baseStoreState(),
        queryData: [{ queryKey: ['folayers'], data: [] }],
      }
    case 'public-layers': {
      const builtState = buildPublicLayersState()

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'admin-unauthenticated': {
      const builtState = buildAdminStatusState({
        adminVerificationStatus: AdminVerificationStatus.NoUser,
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'admin-rejected': {
      const builtState = buildAdminStatusState({
        adminVerificationStatus: AdminVerificationStatus.Rejected,
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'admin-errored': {
      const builtState = buildAdminStatusState({
        adminVerificationStatus: AdminVerificationStatus.Errored,
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'admin-loading': {
      const builtState = buildAdminStatusState({
        adminVerificationStatus: AdminVerificationStatus.Pending,
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'admin-empty': {
      const builtState = buildAdminListState({ adminFolayerConfs: [] })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'admin-layers': {
      const builtState = buildAdminListState({
        adminFolayerConfs: createLuonnonmetsakartatMockAdminFolayerConfs(),
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'layer-detail':
    case 'settings-clean':
    case 'pictures-empty': {
      const builtState = createDetailSeed()

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'settings-unsynced': {
      const builtState = createDetailSeed({
        updateSelectedLayer: (layer) => ({
          ...layer,
          name: 'Mock visible forest layer edited',
          colorCode: '#1f9d55',
          unsyncedChanges: true,
        }),
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'settings-saving': {
      const builtState = createDetailSeed({
        updateSelectedLayer: (layer) => ({
          ...layer,
          state: FolayerConfState.Saving,
          unsyncedChanges: true,
        }),
      })

      return {
        state: normalizedState,
        ...builtState,
      }
    }
    case 'pictures-mapped': {
      const builtState = createDetailSeed()

      return {
        state: normalizedState,
        pictureFixtureState:
          createLuonnonmetsakartatMockPicturesMappedFixtureState(),
        ...builtState,
      }
    }
    case 'pictures-unmatched': {
      const builtState = createDetailSeed()

      return {
        state: normalizedState,
        pictureFixtureState:
          createLuonnonmetsakartatMockPicturesUnmatchedFixtureState(),
        ...builtState,
      }
    }
  }
}

export const applyLuonnonmetsakartatMockScenarioState = ({
  queryClients,
  state,
}: ApplyLuonnonmetsakartatMockScenarioStateOptions) => {
  const builtState = buildLuonnonmetsakartatMockScenarioState(state)

  if (builtState == null) {
    return null
  }

  useAppletStore.setState(clone(builtState.storeState))

  getLuonnonmetsakartatMockQueryClients(queryClients).forEach((client) => {
    builtState.queryData.forEach((entry) => {
      client.setQueryData(entry.queryKey, clone(entry.data))
    })
  })

  return builtState
}
