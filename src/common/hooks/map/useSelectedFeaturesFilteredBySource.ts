import { MapGeoJSONFeature } from 'maplibre-gl'
import { useEffect, useState } from 'react'

import { useMapStore } from '#/common/store'
import { SelectionSource } from '#/common/types/map'
import { isMatchingSource } from '#/common/utils/map'

const useSelectedFeaturesFilteredBySource = (sources: SelectionSource[]) => {
  const selectedFeatures = useMapStore((state) => state.selectedFeatures)
  const [filteredFeatures, setFilteredFeatures] = useState<MapGeoJSONFeature[]>(
    []
  )

  useEffect(() => {
    const newFilteredFeatures = selectedFeatures.filter(
      (f: MapGeoJSONFeature) =>
        sources.some((source) => isMatchingSource(f, source))
    )

    setFilteredFeatures(newFilteredFeatures)
  }, [selectedFeatures])

  return filteredFeatures
}

export default useSelectedFeaturesFilteredBySource
