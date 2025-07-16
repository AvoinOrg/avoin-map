import { ExpressionSpecification } from 'maplibre-gl'

import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

export const layerGroupId: string = 'mml_ortokuva'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: layerGroupId,
    sources: {
      [layerGroupId]: {
        type: 'raster',
        tiles: [`/api/map/core/mml/tms/{z}/{x}/{y}?layer=ortokuva`],
        tileSize: 256,
        attribution:
          '<a href="https://www.maanmittauslaitos.fi/avoindata">© Maanmittauslaitos</a>',
      },
    },
    layers: [
      {
        id: 'mml_ortokuva_layer',
        source: layerGroupId,
        type: 'raster',
        paint: {},
      },
    ],
  }
}

export const mmlOrtokuvaLayerConf: LayerConf = {
  id: layerGroupId,
  style: getStyle,
}
