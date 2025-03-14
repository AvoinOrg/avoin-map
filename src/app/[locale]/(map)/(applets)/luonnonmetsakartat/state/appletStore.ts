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

type Vars = {
  layerConfs: LayerConf[]
  adminLayerConfs: AdminLayerConf[]
  adminVerificationStatus: AdminVerificationStatus
}

type Actions = {
  setLayerConfs: (layerConfs: LayerConf[]) => void
  addAdminLayerConf: (layerConf: AdminLayerConf) => void

  setAdminLayerConfs: (layerConfs: AdminLayerConf[]) => void
  updateAdminLayerConf: (layerConf: AdminLayerConf) => void
  deleteAdminLayerConf: (layerId: string) => void
  setAdminVerificationStatus: (status: AdminVerificationStatus) => void
}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(
    immer((set, get) => {
      const vars = {
        layerConfs: [],
        adminLayerConfs: [],
        adminVerificationStatus: AdminVerificationStatus.NoUser,
      }

      const actions = {
        setLayerConfs: (layerConfs: LayerConf[]) => {
          set((state) => {
            state.layerConfs = layerConfs
          })
        },

        addAdminLayerConf: (layerConf: AdminLayerConf) => {
          set((state) => {
            // Check if a layer with this ID already exists
            const existingIndex = state.adminLayerConfs.findIndex(
              (conf) => conf.id === layerConf.id
            )

            // Only add if it doesn't already exist
            if (existingIndex === -1) {
              state.adminLayerConfs.push(layerConf)
            }
          })
        },

        setAdminLayerConfs: (layerConfs: AdminLayerConf[]) => {
          set((state) => {
            state.adminLayerConfs = layerConfs
          })
        },

        updateAdminLayerConf: (layerConf: AdminLayerConf) => {
          set((state) => {
            const index = state.adminLayerConfs.findIndex(
              (conf) => conf.id === layerConf.id
            )

            if (index !== -1) {
              state.adminLayerConfs[index] = layerConf
            } else {
              state.adminLayerConfs.push(layerConf)
            }
          })
        },

        deleteAdminLayerConf: (layerId: string) => {
          set((state) => {
            state.adminLayerConfs = state.adminLayerConfs.filter(
              (conf) => conf.id !== layerId
            )
          })
        },

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
