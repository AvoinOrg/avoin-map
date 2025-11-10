import { useState, useEffect } from 'react'
import { useMapStore } from '#/common/store'
import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'

export const useSelectedDrawFeatures = () => {
  const map = useMapInstanceStore((state) => state._map)
  const draw = useMapStore((state) => state._drawOptions.draw)

  const [selectedDrawFeatures, setSelectedDrawFeatures] = useState<
    GeoJSON.Feature[]
  >([])

  const getFeatureId = (
    feature: GeoJSON.Feature
  ): string | number | undefined =>
    feature.id ??
    (feature.properties &&
      typeof feature.properties === 'object' &&
      'id' in feature.properties
      ? feature.properties.id
      : undefined)

  useEffect(() => {
    if (!map || !draw) return

    const handleSelectionChange = (e: any) => {
      if (e.features.length > 0) {
        setSelectedDrawFeatures(e.features)
      } else {
        setSelectedDrawFeatures([])
      }
    }

    const handleDrawDelete = (e: any) => {
      if (!Array.isArray(e.features) || e.features.length === 0) {
        return
      }

      const deletedIds = new Set<string | number>(
        e.features
          .map((feature: GeoJSON.Feature) => getFeatureId(feature))
          .filter((id: string | number | undefined): id is string | number => id != null)
      )

      if (deletedIds.size === 0) {
        setSelectedDrawFeatures([])
        return
      }

      setSelectedDrawFeatures((prev) =>
        prev.filter((feature) => {
          const id = getFeatureId(feature)
          return id == null || !deletedIds.has(id)
        })
      )
    }

    map.on('draw.selectionchange', handleSelectionChange)
    map.on('draw.delete', handleDrawDelete)

    return () => {
      map.off('draw.selectionchange', handleSelectionChange)
      map.off('draw.delete', handleDrawDelete)
    }
  }, [map, draw])

  return selectedDrawFeatures
}
