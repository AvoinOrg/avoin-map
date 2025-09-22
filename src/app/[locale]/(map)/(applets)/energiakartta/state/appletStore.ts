import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
  devtools,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { commonDevtools } from '#/common/store/shared-devtools'

type Vars = {}

type Actions = {}

export type State = Vars & Actions

export const useAppletStore = create<State>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => {
        const vars = {}

        const actions = {}

        return { ...vars, ...actions }
      })
    ),
    { ...commonDevtools, store: 'energiakarttaStore' }
  )
)
