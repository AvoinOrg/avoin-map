'use client'

import React from 'react'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

import {
  ConfirmationDialogOptions,
  InternalConfirmationDialogOptions,
  InternalNotificationMessage,
  NotificationMessage,
} from '#/common/types/state'
import { generateUUID } from '../utils/general'

interface Vars {
  isSidebarOpen: boolean
  isSidebarDisabled: boolean
  isMapPopupOpen: boolean
  notifications: Record<string, InternalNotificationMessage>
  isNavbarHidden: boolean
  isLoginModalOpen: boolean
  sidebarWidth: number | undefined
  confirmationDialogOptions: InternalConfirmationDialogOptions
  isBaseDomainForApplet: boolean
  windowSize: {
    width: number
    height: number
  }
  visibleMapSize: {
    width: number
    height: number
  }
}

interface Actions {
  setIsSidebarOpen: (value: boolean) => void
  setIsSidebarDisabled: (value: boolean) => void
  setIsMapPopupOpen: (value: boolean) => void
  notify: (notification: NotificationMessage) => Promise<void>
  updateNotification: (
    notificationId: string,
    notification: Partial<InternalNotificationMessage>
  ) => Promise<void>
  setIsNavbarHidden: (value: boolean) => void
  setSidebarHeaderElement: undefined | ((value: React.JSX.Element) => void)
  setSidebarHeaderElementSetter: (
    setter: (value: React.JSX.Element) => void
  ) => void
  setIsLoginModalOpen: (isOpen: boolean) => void
  setSidebarWidth: (pixels: number) => void
  triggerConfirmationDialog: (
    options: ConfirmationDialogOptions
  ) => Promise<void>
  setIsBaseDomainForApplet: (value: boolean) => void
  setWindowSize: (size: Partial<{ width: number; height: number }>) => void
  setVisibleMapSize: (size: Partial<{ width: number; height: number }>) => void
}

type State = Vars & Actions

export const useUIStore = create<State>()(
  immer((set, get) => {
    const vars: Vars = {
      isSidebarDisabled: false,
      isSidebarOpen: true,
      isMapPopupOpen: false,
      isLoginModalOpen: false,
      isNavbarHidden: false,
      notifications: {},
      sidebarWidth: undefined,
      confirmationDialogOptions: { id: null },
      isBaseDomainForApplet: false,
      windowSize: { width: 0, height: 0 },
      visibleMapSize: { width: 0, height: 0 },
    }
    const actions: Actions = {
      setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
      setIsSidebarDisabled: (value) => set({ isSidebarDisabled: value }),
      setIsMapPopupOpen: (value) => set({ isMapPopupOpen: value }),
      setIsLoginModalOpen: (isOpen: boolean) => {
        set({ isLoginModalOpen: isOpen })
      },
      setIsNavbarHidden: (value) => set({ isNavbarHidden: value }),
      setSidebarHeaderElement: undefined,
      setSidebarHeaderElementSetter: (setter) =>
        set({ setSidebarHeaderElement: setter }),
      setSidebarWidth(pixels: number) {
        set({ sidebarWidth: pixels })
      },
      notify: async (notification: NotificationMessage) => {
        const newNotification: InternalNotificationMessage = {
          id: generateUUID(),
          message: notification.message,
          variant: notification.variant,
          duration: notification.duration || 6000,
          triggeredTs: new Date().getTime(),
          shown: false,
        }

        await set((state) => {
          state.notifications[newNotification.id] = newNotification
        })
      },
      updateNotification: async (
        notificationId: string,
        notification: Partial<InternalNotificationMessage>
      ) => {
        const { notifications } = get()

        const oldNotification = notifications[notificationId]

        if (oldNotification == null) {
          console.error("Can't update a notification that does not exist")
          return
        }
        const updatedNotification = { ...oldNotification, ...notification }
        await set((state) => {
          state.notifications[notificationId] = updatedNotification
        })
      },
      triggerConfirmationDialog: async (options: ConfirmationDialogOptions) => {
        const newOptions = { ...options, id: generateUUID() }
        await set((state) => {
          state.confirmationDialogOptions = newOptions
        })
      },
      setVisibleMapSize: (size: { width?: number; height?: number }) => {
        set((state) => {
          state.visibleMapSize = { ...state.visibleMapSize, ...size }
        })
      },
      setWindowSize: (size: { width?: number; height?: number }) => {
        set((state) => {
          state.windowSize = { ...state.windowSize, ...size }
        })
      },
      setIsBaseDomainForApplet: (value) =>
        set({ isBaseDomainForApplet: value }),
    }

    return { ...vars, ...actions }
  })
)
