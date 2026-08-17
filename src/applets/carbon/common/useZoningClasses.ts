import { useEffect, useState } from 'react'
import type { ZoningClass } from './types'
import { getZoningClasses } from './zoningClasses'

export const useZoningClasses = () => {
  const [zoningClasses, setZoningClasses] = useState<ZoningClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isActive = true

    getZoningClasses()
      .then((classes) => {
        if (!isActive) {
          return
        }
        setZoningClasses(classes)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (!isActive) {
          return
        }
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [])

  return { zoningClasses, isLoading, error }
}
