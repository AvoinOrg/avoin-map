'use client'

import { User } from 'next-auth'
import { signOut as nextSignOut } from 'next-auth/react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import { UserAuth, UserAuthState, UserDataState } from '#/common/types/state'

interface Vars {
  userAuth: UserAuth | null
  userData: User | null
  userAuthState: UserAuthState
  userDataState: UserDataState
  signOutActions: Record<string, () => void>
}

interface Actions {
  setUserData: (userData: User | null) => void
  setUserAuth: (userAuth: UserAuth | null) => void
  setUserAuthState: (userAuthState: UserAuthState) => void
  setUserDataState: (userDataState: UserDataState) => void
  addSignOutAction: (key: string, action: () => void) => void
  removeSignOutAction: (key: string) => void
  signOut: () => void
}

type State = Vars & Actions

export const useUserStore = create<State>()(
  immer((set, get) => {
    const vars: Vars = {
      userAuth: null,
      userData: null,
      userAuthState: UserAuthState.Unauthenticated,
      userDataState: UserDataState.Unfetched,
      signOutActions: {},
    }

    const actions: Actions = {
      setUserData: (userData: User | null) => {
        set((state) => {
          state.userData = userData
        })
      },
      setUserAuth: (userAuth: UserAuth | null) => {
        set((state) => {
          state.userAuth = userAuth
        })
      },
      setUserAuthState: (userAuthState: UserAuthState) => {
        set((state) => {
          state.userAuthState = userAuthState
        })
      },
      setUserDataState: (userDataState: UserDataState) => {
        set((state) => {
          state.userDataState = userDataState
        })
      },
      addSignOutAction: (key: string, action: () => void) => {
        set((state) => {
          state.signOutActions[key] = action
        })
      },
      removeSignOutAction: (key: string) => {
        if (get().signOutActions[key]) {
          set((state) => {
            delete state.signOutActions[key]
          })
        }
      },
      signOut: () => {
        for (const key in get().signOutActions) {
          get().signOutActions[key]()
        }
        nextSignOut()
        set({
          userAuth: null,
          userData: null,
          userAuthState: UserAuthState.Unauthenticated,
          userDataState: UserDataState.Unfetched,
        })
      },
    }

    return { ...vars, ...actions }
  })
)
