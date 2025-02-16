import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// import { checkIsValidZoningCode } from '../common/utils'

type Vars = {
  isAdminVerified: boolean
}

type Actions = {
  setIsAdminVerified: (isAdminVerified: boolean) => void
}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(
    immer((set, get) => {
      const vars = {
        isAdminVerified: false,
      }

      const actions = {
        setIsAdminVerified: (isAdminVerified: boolean) => {
          set((state) => {
            state.isAdminVerified = isAdminVerified
          })
        },
      }

      return { ...vars, ...actions }
    })
  )
)
