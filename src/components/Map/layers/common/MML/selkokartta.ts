import { ExpressionSpecification } from 'maplibre-gl'

import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

export const layerGroupId: string = 'mml_selkokartta'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: layerGroupId,
    sources: {
      [layerGroupId]: {
        type: 'raster',
        tiles: [`/api/map/mml/tms/{z}/{x}/{y}?layer=selkokartta`],
        tileSize: 256,
        attribution:
          '<a href="https://www.maanmittauslaitos.fi/avoindata">© Maanmittauslaitos</a>',
      },
    },
    layers: [
      {
        id: 'mml_selkokartta_layer',
        source: layerGroupId,
        type: 'raster',
        paint: {},
      },
    ],
  }
}

export const mmlSelkokarttaLayerConf: LayerConf = {
  id: layerGroupId,
  style: getStyle,
}
