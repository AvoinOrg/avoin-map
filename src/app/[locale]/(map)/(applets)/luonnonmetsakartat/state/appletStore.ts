import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { AdminVerificationStatus } from 'applets/luonnonmetsakartat/common/types'

type Vars = {
  adminVerificationStatus: AdminVerificationStatus
}

type Actions = {
  setAdminVerificationStatus: (status: AdminVerificationStatus) => void
}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(
    immer((set, get) => {
      const vars = {
        adminVerificationStatus: AdminVerificationStatus.NoUser,
      }

      const actions = {
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
