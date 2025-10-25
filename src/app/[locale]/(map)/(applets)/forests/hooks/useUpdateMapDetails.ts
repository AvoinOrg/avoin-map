import { cloneDeep } from 'lodash-es'
import { ExpressionSpecification } from 'maplibre-gl'

import { useMapStore } from '#/common/store'

import { layerOptions } from '../constants'
import {
  fiForestsSumMethodAttrs,
  fiForestsBestMethodVsOther,
  fiForestsAreaCO2FillColor,
  fiForestsTextfieldExpression,
  perHa,
} from '../utils'
import { ForestryMethod, LayerLevel } from '../types'

export const useUpdateMapDetails = () => {
  const setLayoutProperty = useMapStore((s) => s.setLayoutProperty)
  const setPaintProperty = useMapStore((s) => s.setPaintProperty)

  const updateMapDetails = (
    forestryMethod: ForestryMethod,
    carbonBalanceDifferenceFlag: boolean
  ) => {
    // ABSOLUTE (method’s own value) — per-ha
    const absolutePerHa: ExpressionSpecification = perHa(
      fiForestsSumMethodAttrs(forestryMethod, 'cbt')
    )

    // RELATIVE (method minus traditional) — per-ha
    const relativePerHa: ExpressionSpecification = perHa(
      fiForestsBestMethodVsOther(forestryMethod, 'cbt')
    )

    const fillColor = carbonBalanceDifferenceFlag
      ? fiForestsAreaCO2FillColor(relativePerHa) // per-ha relative
      : fiForestsAreaCO2FillColor(absolutePerHa) // per-ha absolute

    for (const type of Object.keys(layerOptions)) {
      setPaintProperty(`${type}-fill`, 'fill-color', cloneDeep(fillColor))
    }

    // Label: make it match what you consider “default per-ha absolute”
    setLayoutProperty(
      LayerLevel.Parcel + '-symbol',
      'text-field',
      cloneDeep(fiForestsTextfieldExpression(absolutePerHa))
    )
  }

  return updateMapDetails
}
