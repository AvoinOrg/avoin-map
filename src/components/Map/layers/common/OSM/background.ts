import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

export const osmBackgroundLayerGroupId = 'osm'

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: osmBackgroundLayerGroupId,
    sources: {
      [osmBackgroundLayerGroupId]: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution:
          '© <a target="_top" rel="noopener" href="https://openstreetmap.org/">OpenStreetMap</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>.',
      },
    },
    layers: [
      {
        id: osmBackgroundLayerGroupId,
        type: 'raster',
        source: 'osm',
      },
    ],
  }
}

export const osmBackgroundLayerConf: LayerConf = {
  id: osmBackgroundLayerGroupId,
  style: getStyle,
}
