import { useEffect, useId, useState } from 'react'
import { useUIStore } from '#/common/store/uiStore' // Adjust path as needed

/**
 * Custom hook to manage a component's contribution to the global sidebar loading state.
 * It handles registering and unregistering a unique loader ID with the UI store.
 *
 * @returns A tuple:
 *   - `isOperationLoading`: A boolean indicating the local loading state for this hook instance.
 *   - `setIsSidebarActivityLoading`: A function to set the local loading state.
 */
export const useSidebarActivityLoader = (): [
  boolean,
  (loading: boolean) => void
] => {
  const startSidebarLoading = useUIStore((state) => state.startSidebarLoading)
  const stopSidebarLoading = useUIStore((state) => state.stopSidebarLoading)
  const uniqueLoaderId = useId() // React 18+ for unique ID

  const [isSidebarActivityLoading, setIsSidebarActivityLoading] =
    useState(false)

  useEffect(() => {
    if (isSidebarActivityLoading) {
      startSidebarLoading(uniqueLoaderId)
    } else {
      // This will effectively "unregister" if it was previously registered,
      // or do nothing if it wasn't (e.g., on initial render with isSidebarActivityLoading = false).
      stopSidebarLoading(uniqueLoaderId)
    }

    // Cleanup function: called when component unmounts or before effect re-runs
    // if dependencies change. This ensures the loader is stopped if the component
    // unmounts while its operation was considered "loading".
    return () => {
      stopSidebarLoading(uniqueLoaderId)
    }
  }, [
    isSidebarActivityLoading,
    startSidebarLoading,
    stopSidebarLoading,
    uniqueLoaderId,
  ])

  return [isSidebarActivityLoading, setIsSidebarActivityLoading]
}
