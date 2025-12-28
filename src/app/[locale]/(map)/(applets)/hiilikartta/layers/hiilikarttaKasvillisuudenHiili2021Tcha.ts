// Layer config for the 2021 vegetation carbon WMTS tiles in the Hiilikartta applet.
import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

export const layerGroupId: string =
  'kasvillisuudenhiili_2021_tcha'

const GEOSERVER_URL = process.env.NEXT_PUBLIC_GEOSERVER_URL
const wmtsTileUrl = `${GEOSERVER_URL}/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=hiilikartta:${layerGroupId}&STYLE=&TILEMATRIXSET=EPSG:900913&TILEMATRIX=EPSG:900913:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: layerGroupId,
    sources: {
      [layerGroupId]: {
        type: 'raster',
        tiles: [wmtsTileUrl],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: `${layerGroupId}_raster`,
        source: layerGroupId,
        type: 'raster',
        paint: {
          'raster-opacity': 0.6,
        },
      },
    ],
  }
}

export const hiilikarttaKasvillisuudenHiili2021TchaLayerConf: LayerConf = {
  id: layerGroupId,
  style: getStyle,
}
