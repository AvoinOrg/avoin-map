'use client'

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'

import {
  ConfirmationDialogOptions,
  InternalConfirmationDialogOptions,
  InternalNotificationMessage,
  MapMenuState,
  NotificationMessage,
} from '#/common/types/state'
import type {
  RegisterSidebarBoundaryInput,
  RegisterSidebarPanelExtensionInput,
  SidebarBoundaryId,
  SidebarBoundaryRegistry,
  SidebarBoundaryUpdate,
  SidebarPanelExtensionId,
  SidebarPanelExtensionRegistry,
  SidebarPanelExtensionRuntimeOptionsPatch,
  SidebarPanelExtensionUpdate,
  SidebarRuntimeOptionsPatch,
} from '#/common/types/sidebar'
import { generateUUID } from '../utils/general'
import type { MapDims } from '../types/mapDims'
import { devtools } from 'zustand/middleware'
import { commonDevtools } from './shared-devtools'
import { waitFor } from '../utils/store'

type PopupModalViewMode = 'constrained' | 'fullscreen' | 'full-height'

type SidebarHeaderConfig = {
  title: string
  backgroundImage?: string
}

interface Vars {
  isSidebarOpen: boolean
  isSidebarDisabled: boolean
  isMapPopupOpen: boolean
  notifications: Record<string, InternalNotificationMessage>
  isNavbarHidden: boolean
  isLoginModalOpen: boolean
  isSidebarLoading: boolean
  sidebarWidth: number | undefined
  sidebarBoundaries: SidebarBoundaryRegistry
  _sidebarBoundaryRegistrationOrder: number
  sidebarPanelExtensions: SidebarPanelExtensionRegistry
  _sidebarPanelExtensionRegistrationOrder: number
  sidebarHeaderConfig: SidebarHeaderConfig
  confirmationDialogOptions: InternalConfirmationDialogOptions
  isBaseDomainForApplet: boolean
  windowSize:
    | {
        width: number
        height: number
      }
    | undefined
  mapDims: {
    visible: MapDims | undefined
    min: MapDims | undefined
  }
  _activeSidebarLoaders: Set<string>
  searchCountryCodes: string[]
  popupModalViewMode: PopupModalViewMode
  activeMapMenu: MapMenuState | undefined
}

interface Actions {
  setIsSidebarOpen: (value: boolean) => void
  setIsSidebarDisabled: (value: boolean) => void
  setIsMapPopupOpen: (value: boolean) => void
  startSidebarLoading: (loaderId: string) => void
  stopSidebarLoading: (loaderId: string) => void
  notify: (notification: NotificationMessage) => Promise<void>
  updateNotification: (
    notificationId: string,
    notification: Partial<InternalNotificationMessage>
  ) => Promise<void>
  setIsNavbarHidden: (value: boolean) => void
  setIsLoginModalOpen: (isOpen: boolean) => void
  setSidebarWidth: (pixels: number) => void
  registerSidebarBoundary: (input: RegisterSidebarBoundaryInput) => void
  updateSidebarBoundary: (
    id: SidebarBoundaryId,
    patch: SidebarBoundaryUpdate
  ) => void
  setSidebarBoundaryRuntimeOptions: (
    id: SidebarBoundaryId,
    patch: SidebarRuntimeOptionsPatch
  ) => void
  resetSidebarBoundaryRuntimeOptions: (id: SidebarBoundaryId) => void
  unregisterSidebarBoundary: (id: SidebarBoundaryId) => void
  registerSidebarPanelExtension: (
    input: RegisterSidebarPanelExtensionInput
  ) => void
  updateSidebarPanelExtension: (
    id: SidebarPanelExtensionId,
    patch: SidebarPanelExtensionUpdate
  ) => void
  setSidebarPanelExtensionRuntimeOptions: (
    id: SidebarPanelExtensionId,
    patch: SidebarPanelExtensionRuntimeOptionsPatch
  ) => void
  resetSidebarPanelExtensionRuntimeOptions: (
    id: SidebarPanelExtensionId
  ) => void
  unregisterSidebarPanelExtension: (id: SidebarPanelExtensionId) => void
  setSidebarHeaderConfig: (config: SidebarHeaderConfig) => void
  triggerConfirmationDialog: (
    options: ConfirmationDialogOptions
  ) => Promise<void>
  setIsBaseDomainForApplet: (value: boolean) => void
  setWindowSize: (size: Partial<{ width: number; height: number }>) => void
  setMapDims: (dims: {
    visible?: Partial<MapDims>
    min?: Partial<MapDims>
  }) => void
  setSearchCountryCodes: (codes: string[]) => void
  setPopupModalViewMode: (mode: PopupModalViewMode) => void
  setMapMenuState: (menu: MapMenuState, open: boolean) => void
}

type State = Vars & Actions

enableMapSet()

export const useUIStore = create<State>()(
  devtools(
    immer((set, get) => {
      const vars: Vars = {
        isSidebarDisabled: false,
        isSidebarOpen: true,
        isMapPopupOpen: false,
        isLoginModalOpen: false,
        isNavbarHidden: false,
        notifications: {},
        isSidebarLoading: false,
        sidebarWidth: undefined,
        sidebarBoundaries: {},
        _sidebarBoundaryRegistrationOrder: 0,
        sidebarPanelExtensions: {},
        _sidebarPanelExtensionRegistrationOrder: 0,
        sidebarHeaderConfig: { title: '' },
        confirmationDialogOptions: { id: null },
        isBaseDomainForApplet: false,
        windowSize: undefined,
        mapDims: { visible: undefined, min: undefined },
        _activeSidebarLoaders: new Set<string>(),
        searchCountryCodes: [],
        popupModalViewMode: 'constrained',
        activeMapMenu: undefined,
      }
      const actions: Actions = {
        setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
        setIsSidebarDisabled: (value) => set({ isSidebarDisabled: value }),
        setIsMapPopupOpen: (value) => set({ isMapPopupOpen: value }),
        setIsLoginModalOpen: (isOpen: boolean) => {
          set({ isLoginModalOpen: isOpen })
        },
        setIsNavbarHidden: (value) => set({ isNavbarHidden: value }),
        setSidebarWidth(pixels: number) {
          set({ sidebarWidth: pixels })
        },
        registerSidebarBoundary: (input: RegisterSidebarBoundaryInput) => {
          set((state) => {
            const existingBoundary = state.sidebarBoundaries[input.id]

            if (existingBoundary != null) {
              existingBoundary.mode = input.mode
              existingBoundary.depth = input.depth
              existingBoundary.config = input.config
              if (input.runtimeOptions != null) {
                existingBoundary.runtimeOptions = input.runtimeOptions
              }
              return
            }

            state._sidebarBoundaryRegistrationOrder += 1
            state.sidebarBoundaries[input.id] = {
              id: input.id,
              mode: input.mode,
              depth: input.depth,
              config: input.config,
              runtimeOptions: input.runtimeOptions ?? {},
              registrationOrder: state._sidebarBoundaryRegistrationOrder,
            }
          })
        },
        updateSidebarBoundary: (
          id: SidebarBoundaryId,
          patch: SidebarBoundaryUpdate
        ) => {
          set((state) => {
            const boundary = state.sidebarBoundaries[id]

            if (boundary == null) {
              return
            }

            if (patch.mode != null) {
              boundary.mode = patch.mode
            }
            if (patch.depth != null) {
              boundary.depth = patch.depth
            }
            if ('config' in patch) {
              boundary.config = patch.config
            }
          })
        },
        setSidebarBoundaryRuntimeOptions: (
          id: SidebarBoundaryId,
          patch: SidebarRuntimeOptionsPatch
        ) => {
          set((state) => {
            const boundary = state.sidebarBoundaries[id]

            if (boundary == null) {
              return
            }

            boundary.runtimeOptions = {
              ...boundary.runtimeOptions,
              ...patch,
            }
          })
        },
        resetSidebarBoundaryRuntimeOptions: (id: SidebarBoundaryId) => {
          set((state) => {
            const boundary = state.sidebarBoundaries[id]

            if (boundary == null) {
              return
            }

            boundary.runtimeOptions = {}
          })
        },
        unregisterSidebarBoundary: (id: SidebarBoundaryId) => {
          set((state) => {
            delete state.sidebarBoundaries[id]
          })
        },
        registerSidebarPanelExtension: (
          input: RegisterSidebarPanelExtensionInput
        ) => {
          set((state) => {
            const existingExtension = state.sidebarPanelExtensions[input.id]

            if (existingExtension != null) {
              existingExtension.depth = input.depth
              existingExtension.config = input.config
              if (input.runtimeOptions != null) {
                existingExtension.runtimeOptions = input.runtimeOptions
              }
              return
            }

            state._sidebarPanelExtensionRegistrationOrder += 1
            state.sidebarPanelExtensions[input.id] = {
              id: input.id,
              depth: input.depth,
              config: input.config,
              runtimeOptions: input.runtimeOptions ?? {},
              registrationOrder: state._sidebarPanelExtensionRegistrationOrder,
            }
          })
        },
        updateSidebarPanelExtension: (
          id: SidebarPanelExtensionId,
          patch: SidebarPanelExtensionUpdate
        ) => {
          set((state) => {
            const extension = state.sidebarPanelExtensions[id]

            if (extension == null) {
              return
            }

            if (patch.depth != null) {
              extension.depth = patch.depth
            }
            if ('config' in patch) {
              extension.config = patch.config
            }
          })
        },
        setSidebarPanelExtensionRuntimeOptions: (
          id: SidebarPanelExtensionId,
          patch: SidebarPanelExtensionRuntimeOptionsPatch
        ) => {
          set((state) => {
            const extension = state.sidebarPanelExtensions[id]

            if (extension == null) {
              return
            }

            extension.runtimeOptions = {
              ...extension.runtimeOptions,
              ...patch,
            }
          })
        },
        resetSidebarPanelExtensionRuntimeOptions: (
          id: SidebarPanelExtensionId
        ) => {
          set((state) => {
            const extension = state.sidebarPanelExtensions[id]

            if (extension == null) {
              return
            }

            extension.runtimeOptions = {}
          })
        },
        unregisterSidebarPanelExtension: (id: SidebarPanelExtensionId) => {
          set((state) => {
            delete state.sidebarPanelExtensions[id]
          })
        },
        setSidebarHeaderConfig: (config: SidebarHeaderConfig) =>
          set({ sidebarHeaderConfig: config }),
        startSidebarLoading: (loaderId: string) => {
          set((state) => {
            state._activeSidebarLoaders.add(loaderId)
            state.isSidebarLoading = state._activeSidebarLoaders.size > 0
          })
        },
        stopSidebarLoading: (loaderId: string) => {
          set((state) => {
            state._activeSidebarLoaders.delete(loaderId)
            state.isSidebarLoading = state._activeSidebarLoaders.size > 0
          })
        },
        notify: async (notification: NotificationMessage) => {
          const newNotification: InternalNotificationMessage = {
            ...notification,
            id: generateUUID(),
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
        triggerConfirmationDialog: async (
          options: ConfirmationDialogOptions
        ) => {
          const newOptions = { ...options, id: generateUUID() }
          await set((state) => {
            state.confirmationDialogOptions = newOptions
          })
        },

        setMapDims: (dims: {
          visible?: Partial<MapDims>
          min?: Partial<MapDims>
        }) => {
          set((state) => {
            if (dims.visible != null) {
              if (state.mapDims.visible == null) {
                state.mapDims.visible = {
                  ...{ width: 0, height: 0, centerX: 0, centerY: 0 },
                  ...dims.visible,
                }
              } else {
                state.mapDims.visible = {
                  ...state.mapDims.visible,
                  ...dims.visible,
                }
              }
            }

            if (dims.min != null) {
              if (state.mapDims.min == null) {
                state.mapDims.min = {
                  ...{ width: 0, height: 0, centerX: 0, centerY: 0 },
                  ...dims.min,
                }
              } else {
                state.mapDims.min = { ...state.mapDims.min, ...dims.min }
              }
            }
          })
        },

        setSearchCountryCodes: (codes: string[]) =>
          set({ searchCountryCodes: codes }),

        setPopupModalViewMode: (mode: PopupModalViewMode) =>
          set({ popupModalViewMode: mode }),

        setWindowSize: (size: { width?: number; height?: number }) => {
          set((state) => {
            if (state.windowSize == null) {
              state.windowSize = {
                width: 0,
                height: 0,
              }
            }
            state.windowSize = { ...state.windowSize, ...size }
          })
        },
        setMapMenuState: (menu: MapMenuState, open: boolean) => {
          // ignore toggling open if the menu is already open
          if (open && get().activeMapMenu === menu) {
            return
          }

          if (!open) {
            // only allow toggling off if the calling menu is active
            if (get().activeMapMenu === menu) {
              set((state) => {
                state.activeMapMenu = undefined
              })
            }
            return
          }

          set((state) => {
            state.activeMapMenu = menu
          })
        },
        setIsBaseDomainForApplet: (value) =>
          set({ isBaseDomainForApplet: value }),
      }

      return { ...vars, ...actions }
    }),
    { ...commonDevtools, store: 'uiStore' }
  )
)

export const waitForMapDims = (timeoutMs?: number) =>
  waitFor(
    useUIStore,
    (state) => state.mapDims,
    (mapDims) =>
      mapDims != null && mapDims.visible != null && mapDims.min != null,
    timeoutMs
  )
