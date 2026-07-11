// Layer config for the 2021 vegetation carbon WMTS tiles in the Hiilikartta applet.
import { LayerConf, ExtendedStyleSpecification } from '#/common/types/map'

export const layerGroupId: string =
  'kasvillisuudenhiili_2021_tcha'

const GEOSERVER_URL = process.env.PUBLIC_GEOSERVER_URL
const wmtsTileUrl = `${GEOSERVER_URL}/gwc/service/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=hiilikartta:${layerGroupId}&STYLE=&TILEMATRIXSET=EPSG:900913&TILEMATRIX=EPSG:900913:{z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`
// WGS84BoundingBox and zoom range from WMTS GetCapabilities.
const wmtsBounds: [number, number, number, number] = [
  15.49653323229236,
  59.39755333188974,
  33.127189374041905,
  70.11133942210401,
]
const wmtsMaxZoom = 18

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: layerGroupId,
    sources: {
      [layerGroupId]: {
        type: 'raster',
        tiles: [wmtsTileUrl],
        tileSize: 256,
        bounds: wmtsBounds,
        maxzoom: wmtsMaxZoom,
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

export const vegetationCO2LayerConf: LayerConf = {
  id: layerGroupId,
  style: getStyle,
}
