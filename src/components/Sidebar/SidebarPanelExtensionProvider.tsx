'use client'

import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'

import { useUIStore } from '#/common/store/uiStore'
import type {
  SidebarPanelExtensionConfig,
  SidebarPanelExtensionId,
  SidebarPanelExtensionRuntimeOptions,
} from '#/common/types/sidebar'

import {
  SidebarPanelExtensionContextProvider,
  useNullableSidebarPanelExtensionContext,
  useSidebarPanelExtensionContext,
} from './sidebarPanelExtensionContext'

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export type SidebarPanelExtensionProviderProps = {
  id?: SidebarPanelExtensionId
  config?: SidebarPanelExtensionConfig
  initialRuntimeOptions?: SidebarPanelExtensionRuntimeOptions
  runtimeOptions?: SidebarPanelExtensionRuntimeOptions
  enabled?: boolean
  children?: React.ReactNode
}

export const normalizeSidebarPanelExtensionId = (
  id: string
): SidebarPanelExtensionId => {
  const normalized = id
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'extension'
}

export const SidebarPanelExtensionProvider = ({
  id,
  config,
  initialRuntimeOptions,
  runtimeOptions,
  enabled = true,
  children,
}: SidebarPanelExtensionProviderProps) => {
  const generatedId = useId()
  const generatedExtensionId = useMemo(
    () =>
      `sidebar-panel-extension-${normalizeSidebarPanelExtensionId(generatedId)}`,
    [generatedId]
  )
  const extensionId = id ?? generatedExtensionId
  const parentExtension = useNullableSidebarPanelExtensionContext()
  const depth = parentExtension == null ? 0 : parentExtension.depth + 1
  const registerSidebarPanelExtension = useUIStore(
    (state) => state.registerSidebarPanelExtension
  )
  const updateSidebarPanelExtension = useUIStore(
    (state) => state.updateSidebarPanelExtension
  )
  const setSidebarPanelExtensionRuntimeOptions = useUIStore(
    (state) => state.setSidebarPanelExtensionRuntimeOptions
  )
  const unregisterSidebarPanelExtension = useUIStore(
    (state) => state.unregisterSidebarPanelExtension
  )
  const latestRegistration = useRef({
    depth,
    config,
    runtimeOptions: runtimeOptions ?? initialRuntimeOptions,
  })

  useIsomorphicLayoutEffect(() => {
    latestRegistration.current = {
      depth,
      config,
      runtimeOptions: runtimeOptions ?? initialRuntimeOptions,
    }
  })

  useIsomorphicLayoutEffect(() => {
    if (!enabled) {
      return
    }

    registerSidebarPanelExtension({
      id: extensionId,
      depth: latestRegistration.current.depth,
      config: latestRegistration.current.config,
      runtimeOptions: latestRegistration.current.runtimeOptions,
    })

    return () => {
      unregisterSidebarPanelExtension(extensionId)
    }
  }, [
    enabled,
    extensionId,
    registerSidebarPanelExtension,
    unregisterSidebarPanelExtension,
  ])

  useIsomorphicLayoutEffect(() => {
    if (!enabled) {
      return
    }

    updateSidebarPanelExtension(extensionId, {
      depth,
      config,
    })

    if (runtimeOptions != null) {
      setSidebarPanelExtensionRuntimeOptions(extensionId, runtimeOptions)
    }
  }, [
    config,
    depth,
    enabled,
    extensionId,
    runtimeOptions,
    setSidebarPanelExtensionRuntimeOptions,
    updateSidebarPanelExtension,
  ])

  const contextValue = useMemo(
    () => ({
      extensionId,
      depth,
    }),
    [depth, extensionId]
  )

  return (
    <SidebarPanelExtensionContextProvider value={contextValue}>
      {children}
    </SidebarPanelExtensionContextProvider>
  )
}

export const useSidebarPanelExtensionRuntimeOptions = (
  runtimeOptions: SidebarPanelExtensionRuntimeOptions
) => {
  const { extensionId } = useSidebarPanelExtensionContext()
  const isExtensionRegistered = useUIStore(
    (state) => state.sidebarPanelExtensions[extensionId] != null
  )
  const setSidebarPanelExtensionRuntimeOptions = useUIStore(
    (state) => state.setSidebarPanelExtensionRuntimeOptions
  )
  const resetSidebarPanelExtensionRuntimeOptions = useUIStore(
    (state) => state.resetSidebarPanelExtensionRuntimeOptions
  )

  useIsomorphicLayoutEffect(() => {
    if (!isExtensionRegistered) {
      return
    }

    setSidebarPanelExtensionRuntimeOptions(extensionId, runtimeOptions)

    return () => {
      resetSidebarPanelExtensionRuntimeOptions(extensionId)
    }
  }, [
    extensionId,
    isExtensionRegistered,
    resetSidebarPanelExtensionRuntimeOptions,
    runtimeOptions,
    setSidebarPanelExtensionRuntimeOptions,
  ])
}

export default SidebarPanelExtensionProvider
