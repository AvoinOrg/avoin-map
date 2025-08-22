import { useMapStore } from '#/common/store'
import { MapGeoJSONFeature } from 'maplibre-gl'
import { useEffect, useState } from 'react'

const useSelectedFeaturesFilteredByLayer = (filterLayers: string[]) => {
  const selectedFeatures = useMapStore((state) => state.selectedFeatures)
  const [filteredFeatures, setFilteredFeatures] = useState<MapGeoJSONFeature[]>(
    []
  )

  useEffect(() => {
    const newFilteredFeatures = selectedFeatures.filter(
      (f: MapGeoJSONFeature) => {
        if (filterLayers.includes(f.layer.id)) {
          return true
        }
        return false
      }
    )

    setFilteredFeatures(newFilteredFeatures)
  }, [selectedFeatures])

  return filteredFeatures
}

export default useSelectedFeaturesFilteredByLayer
