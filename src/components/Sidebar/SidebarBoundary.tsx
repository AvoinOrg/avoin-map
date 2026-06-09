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
  SidebarBoundaryConfig,
  SidebarBoundaryId,
  SidebarMode,
  SidebarRuntimeOptions,
} from '#/common/types/sidebar'

import {
  SidebarBoundaryProvider,
  useNullableSidebarBoundaryContext,
  useSidebarBoundaryContext,
} from './sidebarBoundaryContext'

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export type SidebarBoundaryProps<M extends SidebarMode = SidebarMode> = {
  id?: SidebarBoundaryId
  mode: M
  config?: SidebarBoundaryConfig<M>
  initialRuntimeOptions?: SidebarRuntimeOptions
  runtimeOptions?: SidebarRuntimeOptions
  children?: React.ReactNode
}

export const normalizeSidebarBoundaryId = (id: string): SidebarBoundaryId => {
  const normalized = id
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'boundary'
}

export const SidebarBoundary = <M extends SidebarMode = SidebarMode,>({
  id,
  mode,
  config,
  initialRuntimeOptions,
  runtimeOptions,
  children,
}: SidebarBoundaryProps<M>) => {
  const generatedId = useId()
  const generatedBoundaryId = useMemo(
    () => `sidebar-boundary-${normalizeSidebarBoundaryId(generatedId)}`,
    [generatedId]
  )
  const boundaryId = id ?? generatedBoundaryId
  const parentBoundary = useNullableSidebarBoundaryContext()
  const depth = parentBoundary == null ? 0 : parentBoundary.depth + 1
  const registerSidebarBoundary = useUIStore(
    (state) => state.registerSidebarBoundary
  )
  const updateSidebarBoundary = useUIStore(
    (state) => state.updateSidebarBoundary
  )
  const setSidebarBoundaryRuntimeOptions = useUIStore(
    (state) => state.setSidebarBoundaryRuntimeOptions
  )
  const unregisterSidebarBoundary = useUIStore(
    (state) => state.unregisterSidebarBoundary
  )
  const latestRegistration = useRef({
    mode,
    depth,
    config,
    runtimeOptions: runtimeOptions ?? initialRuntimeOptions,
  })

  useIsomorphicLayoutEffect(() => {
    latestRegistration.current = {
      mode,
      depth,
      config,
      runtimeOptions: runtimeOptions ?? initialRuntimeOptions,
    }
  })

  useIsomorphicLayoutEffect(() => {
    registerSidebarBoundary({
      id: boundaryId,
      mode: latestRegistration.current.mode,
      depth: latestRegistration.current.depth,
      config: latestRegistration.current.config,
      runtimeOptions: latestRegistration.current.runtimeOptions,
    })

    return () => {
      unregisterSidebarBoundary(boundaryId)
    }
  }, [boundaryId, registerSidebarBoundary, unregisterSidebarBoundary])

  useIsomorphicLayoutEffect(() => {
    updateSidebarBoundary(boundaryId, {
      mode,
      depth,
      config,
    })

    if (runtimeOptions != null) {
      setSidebarBoundaryRuntimeOptions(boundaryId, runtimeOptions)
    }
  }, [
    boundaryId,
    config,
    depth,
    mode,
    runtimeOptions,
    setSidebarBoundaryRuntimeOptions,
    updateSidebarBoundary,
  ])

  const contextValue = useMemo(
    () => ({
      boundaryId,
      depth,
    }),
    [boundaryId, depth]
  )

  return (
    <SidebarBoundaryProvider value={contextValue}>
      {children}
    </SidebarBoundaryProvider>
  )
}

export const useSidebarBoundaryRuntimeOptions = (
  runtimeOptions: SidebarRuntimeOptions
) => {
  const { boundaryId } = useSidebarBoundaryContext()
  const isBoundaryRegistered = useUIStore(
    (state) => state.sidebarBoundaries[boundaryId] != null
  )
  const setSidebarBoundaryRuntimeOptions = useUIStore(
    (state) => state.setSidebarBoundaryRuntimeOptions
  )
  const resetSidebarBoundaryRuntimeOptions = useUIStore(
    (state) => state.resetSidebarBoundaryRuntimeOptions
  )

  useIsomorphicLayoutEffect(() => {
    if (!isBoundaryRegistered) {
      return
    }

    setSidebarBoundaryRuntimeOptions(boundaryId, runtimeOptions)

    return () => {
      resetSidebarBoundaryRuntimeOptions(boundaryId)
    }
  }, [
    boundaryId,
    isBoundaryRegistered,
    resetSidebarBoundaryRuntimeOptions,
    runtimeOptions,
    setSidebarBoundaryRuntimeOptions,
  ])
}

export default SidebarBoundary
