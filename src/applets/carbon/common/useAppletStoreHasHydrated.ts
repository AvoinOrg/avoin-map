import { useEffect, useState } from 'react'

import { useAppletStore } from '../state/appletStore'

const useAppletStoreHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(() =>
    useAppletStore.persist.hasHydrated()
  )

  useEffect(() => {
    setHasHydrated(useAppletStore.persist.hasHydrated())

    const unsubscribe = useAppletStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })

    return unsubscribe
  }, [])

  return hasHydrated
}

export default useAppletStoreHasHydrated
