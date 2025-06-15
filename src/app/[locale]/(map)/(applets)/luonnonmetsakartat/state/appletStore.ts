import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import {
  AdminVerificationStatus,
  AdminFolayerConf,
  FolayerConf,
  FolayerAreaCollection,
  FolayerFeature,
  PartialFolayerFeature,
} from 'applets/luonnonmetsakartat/common/types'

type AdminFolayerConfMap = {
  [id: string]: AdminFolayerConf
}

type FolayerConfMap = {
  [id: string]: FolayerConf
}

type FolayerAreaCollectionMap = {
  [id: string]: FolayerAreaCollection
}

type Vars = {
  folayerConfs: FolayerConfMap
  adminFolayerConfs: AdminFolayerConfMap
  folayerAreaCollections: FolayerAreaCollectionMap
  adminVerificationStatus: AdminVerificationStatus
}

type Actions = {
  addFolayerConf: (folayerConf: FolayerConf) => void
  setFolayerConfs: (folayerConfs: FolayerConf[]) => void
  updateFolayerConf: (folayerId: string, updates: Partial<FolayerConf>) => void
  deleteFolayerConf: (folayerId: string) => void

  addAdminFolayerConf: (folayerConf: AdminFolayerConf) => void
  setAdminFolayerConfs: (folayerConfs: AdminFolayerConf[]) => void
  updateAdminFolayerConf: (
    folayerId: string,
    updates: Partial<AdminFolayerConf>
  ) => void
  deleteAdminFolayerConf: (folayerId: string) => void

  addFolayerAreaCollection: (
    folayerId: string,
    folayerAreaCollection: FolayerAreaCollection
  ) => void
  updateFolayerAreaCollection: (
    folayerId: string,
    updates: Partial<FolayerAreaCollection>
  ) => void
  deleteFolayerAreaCollection: (folayerId: string) => void
  setAdminVerificationStatus: (status: AdminVerificationStatus) => void
  getFolayerAreaById: (
    folayerId: string,
    areaId: string
  ) => FolayerFeature | undefined
  updateFolayerArea: (
    folayerId: string,
    areaId: string,
    updates: PartialFolayerFeature
  ) => void
}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(
    immer((set, get) => {
      const vars = {
        folayerConfs: {} as FolayerConfMap,
        adminFolayerConfs: {} as AdminFolayerConfMap,
        folayerAreaCollections: {} as FolayerAreaCollectionMap,
        adminVerificationStatus: AdminVerificationStatus.NoUser,
      }

      const actions = {
        // FolayerConf actions
        addFolayerConf: (folayerConf: FolayerConf) => {
          set((state) => {
            state.folayerConfs[folayerConf.id] = folayerConf
          })
        },

        setFolayerConfs: (folayerConfs: FolayerConf[]) => {
          set((state) => {
            const folayerConfMap: FolayerConfMap = {}
            folayerConfs.forEach((conf) => {
              folayerConfMap[conf.id] = conf
            })
            state.folayerConfs = folayerConfMap
          })
        },

        updateFolayerConf: (
          folayerId: string,
          updates: Partial<FolayerConf>
        ) => {
          set((state) => {
            const existingConf = state.folayerConfs[folayerId]
            if (existingConf) {
              state.folayerConfs[folayerId] = {
                ...existingConf,
                ...updates,
              }
            }
          })
        },

        deleteFolayerConf: (folayerId: string) => {
          set((state) => {
            const { [folayerId]: _, ...rest } = state.folayerConfs
            state.folayerConfs = rest
          })
        },

        // AdminFolayerConf actions
        addAdminFolayerConf: (folayerConf: AdminFolayerConf) => {
          set((state) => {
            state.adminFolayerConfs[folayerConf.id] = folayerConf
          })
        },

        setAdminFolayerConfs: (folayerConfs: AdminFolayerConf[]) => {
          set((state) => {
            const folayerConfMap: AdminFolayerConfMap = {}
            folayerConfs.forEach((conf) => {
              folayerConfMap[conf.id] = conf
            })
            state.adminFolayerConfs = folayerConfMap
          })
        },

        updateAdminFolayerConf: (
          folayerId: string,
          updates: Partial<AdminFolayerConf>
        ) => {
          set((state) => {
            const existingConf = state.adminFolayerConfs[folayerId]
            if (existingConf) {
              state.adminFolayerConfs[folayerId] = {
                ...existingConf,
                ...updates,
              }
            }
          })
        },

        deleteAdminFolayerConf: (folayerId: string) => {
          set((state) => {
            const { [folayerId]: _, ...rest } = state.adminFolayerConfs
            state.adminFolayerConfs = rest
          })
        },

        // FolayerAreaCollection actions
        addFolayerAreaCollection: (
          folayerId: string,
          folayerAreaCollection: FolayerAreaCollection
        ) => {
          set((state) => {
            state.folayerAreaCollections[folayerId] = folayerAreaCollection
          })
        },

        updateFolayerAreaCollection: (
          folayerId: string,
          updates: Partial<FolayerAreaCollection>
        ) => {
          set((state) => {
            const existingCollection = state.folayerAreaCollections[folayerId]
            if (existingCollection) {
              state.folayerAreaCollections[folayerId] = {
                ...existingCollection,
                ...updates,
              }
            }
          })
        },

        deleteFolayerAreaCollection: (folayerId: string) => {
          set((state) => {
            const { [folayerId]: _, ...rest } = state.folayerAreaCollections
            state.folayerAreaCollections = rest
          })
        },

        // Admin verification status
        setAdminVerificationStatus: (status: AdminVerificationStatus) => {
          set((state) => {
            state.adminVerificationStatus = status
          })
        },
        getFolayerAreaById: (folayerId: string, areaId: string) => {
          const collection = get().folayerAreaCollections[folayerId]
          if (collection) {
            return collection.features.find((feature) => feature.id === areaId)
          }
          return undefined
        },
        updateFolayerArea: (
          folayerId: string,
          areaId: string,
          updates: PartialFolayerFeature
        ) => {
          set((state) => {
            const collection = state.folayerAreaCollections[folayerId]
            if (collection) {
              const featureIndex = collection.features.findIndex(
                (feature) => feature.id === areaId
              )
              if (featureIndex !== -1) {
                const updatedFeature = {
                  ...collection.features[featureIndex],
                }
                if (updates.properties) {
                  updatedFeature.properties = {
                    ...updatedFeature.properties,
                    ...updates.properties,
                  }
                }

                collection.features[featureIndex] = updatedFeature
              }
            }
          })
        },
      }

      return { ...vars, ...actions }
    })
  )
)
