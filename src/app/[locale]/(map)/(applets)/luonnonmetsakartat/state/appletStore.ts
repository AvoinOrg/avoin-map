import { create } from 'zustand'
import {
  persist,
  createJSONStorage,
  subscribeWithSelector,
} from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// import { checkIsValidZoningCode } from '../common/utils'

type Vars = {}

type Actions = {}

export const useAppletStore = create<Vars & Actions>()(
  subscribeWithSelector(immer((set, get) => {}))
)
