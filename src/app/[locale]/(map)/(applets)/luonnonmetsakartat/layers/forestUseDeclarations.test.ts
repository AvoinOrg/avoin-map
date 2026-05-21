import type { ExtendedStyleSpecification } from '#/common/types/map'

import {
  FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
  FOREST_USE_DECLARATIONS_LAYER_GROUP_ID,
  FOREST_USE_DECLARATIONS_RASTER_LAYER_ID,
  FOREST_USE_DECLARATIONS_SOURCE_ID,
  forestUseDeclarationsLayerConf,
} from './forestUseDeclarations'

type GetStyle = () => Promise<ExtendedStyleSpecification>

describe('forestUseDeclarationsLayerConf', () => {
  const getStyle = forestUseDeclarationsLayerConf.style as GetStyle

  it('uses the public Metsakeskus WMS raster endpoint without credentials', async () => {
    const style = await getStyle()
    const source = style.sources[FOREST_USE_DECLARATIONS_SOURCE_ID]

    expect(forestUseDeclarationsLayerConf.id).toBe(
      FOREST_USE_DECLARATIONS_LAYER_GROUP_ID
    )
    expect(source).toMatchObject({
      type: 'raster',
      tileSize: 256,
      bounds: [
        18.99934791823128,
        59.762860619122534,
        32.845281463482415,
        69.25364503372386,
      ],
      attribution:
        '<a href="https://www.metsakeskus.fi/fi/avoin-metsa-ja-luontotieto/aineistot-paikkatieto-ohjelmille/rajapinnat">© Suomen metsäkeskus</a>',
    })

    if (source.type !== 'raster') {
      throw new Error('Expected forest use declarations source to be raster')
    }

    const tileUrl = source.tiles?.[0] ?? ''

    expect(tileUrl).toContain(
      'https://avoin.metsakeskus.fi/rajapinnat/v1/forestusedeclaration/ows'
    )
    expect(tileUrl).toContain('service=WMS')
    expect(tileUrl).toContain('request=GetMap')
    expect(tileUrl).toContain('layers=forestusedeclaration')
    expect(tileUrl).toContain('format=image/png')
    expect(tileUrl).toContain('bbox={bbox-epsg-3857}')
    expect(tileUrl).not.toMatch(/api[_-]?key|token|secret/i)
  })

  it('renders one raster layer with the menu default opacity', async () => {
    const style = await getStyle()

    expect(style.layers).toEqual([
      expect.objectContaining({
        id: FOREST_USE_DECLARATIONS_RASTER_LAYER_ID,
        source: FOREST_USE_DECLARATIONS_SOURCE_ID,
        type: 'raster',
        paint: {
          'raster-opacity': FOREST_USE_DECLARATIONS_DEFAULT_OPACITY,
        },
      }),
    ])
  })
})
