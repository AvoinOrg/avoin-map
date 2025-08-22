import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

export const layerGroupId = 'osm'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: layerGroupId,
    sources: {
      [layerGroupId]: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution:
          '© <a target="_top" rel="noopener" href="https://openstreetmap.org/">OpenStreetMap</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>.',
      },
    },
    layers: [
      {
        id: layerGroupId,
        type: 'raster',
        source: 'osm',
      },
    ],
  }
}

export const osmBackgroundLayerConf: LayerConf = {
  id: layerGroupId,
  style: getStyle,
}
