import { useState, useEffect } from 'react'
import { useMapStore } from '#/common/store/mapStore'
import { FeatureCollection } from 'geojson'

/**
 * A hook that returns the GeoJSON data for a given map source.
 *
 * @param sourceId The ID of the map source.
 * @returns The FeatureCollection of the source, or null if not available.
 */
export const useSourceData = (
  sourceId: string | null | undefined
): FeatureCollection | null => {
  const [data, setData] = useState<FeatureCollection | null>(null)
  const getSourceJson = useMapStore((s) => s.getSourceJsonAsyncQueue)
  const isMapLoaded = useMapStore((s) => s.isLoaded)

  useEffect(() => {
    if (!sourceId || !isMapLoaded) {
      setData(null)
      return
    }

    let isMounted = true

    const fetchData = async () => {
      try {
        const sourceData = await getSourceJson(sourceId)
        if (isMounted) {
          setData(sourceData)
        }
      } catch (error) {
        console.error(`Failed to fetch source data for ${sourceId}:`, error)
        if (isMounted) {
          setData(null)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [sourceId, getSourceJson, isMapLoaded])

  return data
}
