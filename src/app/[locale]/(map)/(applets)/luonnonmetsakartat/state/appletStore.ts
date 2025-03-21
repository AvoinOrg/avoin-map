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
} from 'applets/luonnonmetsakartat/common/types'

type AdminLayerConfMap = {
  [id: string]: AdminLayerConf
}

type LayerConfMap = {
  [id: string]: LayerConf
}

type Vars = {
  layerConfs: LayerConfMap
  adminLayerConfs: AdminLayerConfMap
  adminVerificationStatus: AdminVerificationStatus
}

type Actions = {
  addLayerConf: (layerConf: LayerConf) => void
  setLayerConfs: (layerConfs: LayerConf[]) => void
  updateLayerConf: (layerConf: LayerConf) => void
  deleteLayerConf: (layerId: string) => void
  getLayerConfsAsArray: () => LayerConf[]

  addAdminLayerConf: (layerConf: AdminLayerConf) => void
  setAdminLayerConfs: (layerConfs: AdminLayerConf[]) => void
  updateAdminLayerConf: (layerConf: AdminLayerConf) => void
  deleteAdminLayerConf: (layerId: string) => void
  getAdminLayerConfsAsArray: () => AdminLayerConf[]

  setAdminVerificationStatus: (status: AdminVerificationStatus) => void
}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(
    immer((set, get) => {
      const vars = {
        layerConfs: {} as LayerConfMap,
        adminLayerConfs: {} as AdminLayerConfMap,
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

        updateLayerConf: (layerConf: LayerConf) => {
          set((state) => {
            state.layerConfs[layerConf.id] = layerConf
          })
        },

        deleteLayerConf: (layerId: string) => {
          set((state) => {
            const { [layerId]: _, ...rest } = state.layerConfs
            state.layerConfs = rest
          })
        },

        getLayerConfsAsArray: () => {
          return Object.values(get().layerConfs)
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

        updateAdminLayerConf: (layerConf: AdminLayerConf) => {
          set((state) => {
            state.adminLayerConfs[layerConf.id] = layerConf
          })
        },

        deleteAdminLayerConf: (layerId: string) => {
          set((state) => {
            const { [layerId]: _, ...rest } = state.adminLayerConfs
            state.adminLayerConfs = rest
          })
        },

        getAdminLayerConfsAsArray: () => {
          return Object.values(get().adminLayerConfs)
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
