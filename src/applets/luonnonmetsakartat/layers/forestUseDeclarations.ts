import type { ExtendedStyleSpecification, LayerConf } from '#/common/types/map'

export const FOREST_USE_DECLARATIONS_LAYER_GROUP_ID =
  'luonnonmetsakartat_forest_use_declarations'
export const FOREST_USE_DECLARATIONS_SOURCE_ID =
  FOREST_USE_DECLARATIONS_LAYER_GROUP_ID
export const FOREST_USE_DECLARATIONS_RASTER_LAYER_ID =
  `${FOREST_USE_DECLARATIONS_LAYER_GROUP_ID}_raster`
export const FOREST_USE_DECLARATIONS_DEFAULT_OPACITY = 0.7

const FOREST_USE_DECLARATIONS_WMS_TILE_URL =
  'https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&transparent=true&width=256&height=256&layers=forestusedeclaration&styles='

const FOREST_USE_DECLARATIONS_BOUNDS: [number, number, number, number] = [
  18.99934791823128,
  59.762860619122534,
  32.845281463482415,
  69.25364503372386,
]

const getStyle = async (): Promise<ExtendedStyleSpecification> => {
  return {
    version: 8,
    name: FOREST_USE_DECLARATIONS_LAYER_GROUP_ID,
    sources: {
      [FOREST_USE_DECLARATIONS_SOURCE_ID]: {
        type: 'raster',
        tiles: [FOREST_USE_DECLARATIONS_WMS_TILE_URL],
        tileSize: 256,
        bounds: FOREST_USE_DECLARATIONS_BOUNDS,
        attribution:
          '<a href="https://www.metsakeskus.fi/fi/avoin-metsa-ja-luontotieto/aineistot-paikkatieto-ohjelmille/rajapinnat">© Suomen metsäkeskus</a>',
      },
    },
    layers: [
      {
        id: FOREST_USE_DECLARATIONS_RASTER_LAYER_ID,
        source: FOREST_USE_DECLARATIONS_SOURCE_ID,
        type: 'raster',
        paint: {
          'raster-opacity': FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
        },
      },
    ],
  }
}

export const forestUseDeclarationsLayerConf: LayerConf = {
  id: FOREST_USE_DECLARATIONS_LAYER_GROUP_ID,
  style: getStyle,
}
