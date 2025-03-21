import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import {
  AdminVerificationStatus,
  AdminLayerConf,
  LayerConf,
  LayerAreaCollection,
} from 'applets/luonnonmetsakartat/common/types'

type AdminLayerConfMap = {
  [id: string]: AdminLayerConf
}

type LayerConfMap = {
  [id: string]: LayerConf
}

type LayerAreaCollectionMap = {
  [id: string]: LayerAreaCollection
}

type Vars = {
  layerConfs: LayerConfMap
  adminLayerConfs: AdminLayerConfMap 
  layerAreaCollections: LayerAreaCollectionMap
  adminVerificationStatus: AdminVerificationStatus
}

type Actions = {
  addLayerConf: (layerConf: LayerConf) => void
  setLayerConfs: (layerConfs: LayerConf[]) => void
  updateLayerConf: (layerId: string, updates: Partial<LayerConf>) => void
  deleteLayerConf: (layerId: string) => void

  addAdminLayerConf: (layerConf: AdminLayerConf) => void
  setAdminLayerConfs: (layerConfs: AdminLayerConf[]) => void
  updateAdminLayerConf: (
    layerId: string,
    updates: Partial<AdminLayerConf>
  ) => void
  deleteAdminLayerConf: (layerId: string) => void

  addLayerAreaCollection: (
    layerId: string,
    layerAreaCollection: LayerAreaCollection
  ) => void
  updateLayerAreaCollection: (
    layerId: string,
    updates: Partial<LayerAreaCollection>
  ) => void
  deleteLayerAreaCollection: (layerId: string) => void
  setAdminVerificationStatus: (status: AdminVerificationStatus) => void
}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(
    immer((set, get) => {
      const vars = {
        layerConfs: {} as LayerConfMap,
        adminLayerConfs: {} as AdminLayerConfMap,
        layerAreaCollections: {} as LayerAreaCollectionMap,
        adminVerificationStatus: AdminVerificationStatus.NoUser,
      }

      const actions = {
        // LayerConf actions
        addLayerConf: (layerConf: LayerConf) => {
          set((state) => {
            state.layerConfs[layerConf.id] = layerConf
          })
        },

        setLayerConfs: (layerConfs: LayerConf[]) => {
          set((state) => {
            const layerConfMap: LayerConfMap = {}
            layerConfs.forEach((conf) => {
              layerConfMap[conf.id] = conf
            })
            state.layerConfs = layerConfMap
          })
        },

        updateLayerConf: (layerId: string, updates: Partial<LayerConf>) => {
          set((state) => {
            const existingConf = state.layerConfs[layerId]
            if (existingConf) {
              state.layerConfs[layerId] = {
                ...existingConf,
                ...updates,
              }
            }
          })
        },

        deleteLayerConf: (layerId: string) => {
          set((state) => {
            const { [layerId]: _, ...rest } = state.layerConfs
            state.layerConfs = rest
          })
        },

        // AdminLayerConf actions
        addAdminLayerConf: (layerConf: AdminLayerConf) => {
          set((state) => {
            state.adminLayerConfs[layerConf.id] = layerConf
          })
        },

        setAdminLayerConfs: (layerConfs: AdminLayerConf[]) => {
          set((state) => {
            const layerConfMap: AdminLayerConfMap = {}
            layerConfs.forEach((conf) => {
              layerConfMap[conf.id] = conf
            })
            state.adminLayerConfs = layerConfMap
          })
        },

        updateAdminLayerConf: (
          layerId: string,
          updates: Partial<AdminLayerConf>
        ) => {
          set((state) => {
            const existingConf = state.adminLayerConfs[layerId]
            if (existingConf) {
              state.adminLayerConfs[layerId] = {
                ...existingConf,
                ...updates,
              }
            }
          })
        },

        deleteAdminLayerConf: (layerId: string) => {
          set((state) => {
            const { [layerId]: _, ...rest } = state.adminLayerConfs
            state.adminLayerConfs = rest
          })
        },

        // LayerAreaCollection actions
        addLayerAreaCollection: (
          layerId: string,
          layerAreaCollection: LayerAreaCollection
        ) => {
          set((state) => {
            state.layerAreaCollections[layerId] = layerAreaCollection
          })
        },

        updateLayerAreaCollection: (
          layerId: string,
          updates: Partial<LayerAreaCollection>
        ) => {
          set((state) => {
            const existingCollection = state.layerAreaCollections[layerId]
            if (existingCollection) {
              state.layerAreaCollections[layerId] = {
                ...existingCollection,
                ...updates,
              }
            }
          })
        },

        deleteLayerAreaCollection: (layerId: string) => {
          set((state) => {
            const { [layerId]: _, ...rest } = state.layerAreaCollections
            state.layerAreaCollections = rest
          })
        },

        // Admin verification status
        setAdminVerificationStatus: (status: AdminVerificationStatus) => {
          set((state) => {
            state.adminVerificationStatus = status
          })
        },
      }

      return { ...vars, ...actions }
    })
  )
)
