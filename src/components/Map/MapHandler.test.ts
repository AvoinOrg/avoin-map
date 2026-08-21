import { afterAll, describe, expect, it, jest } from '@jest/globals'

const geoserverUrl = 'https://gis.example.test/geoserver'
const originalGeoserverUrl = process.env.PUBLIC_GEOSERVER_URL

process.env.PUBLIC_GEOSERVER_URL = geoserverUrl

jest.mock('maplibre-gl', () => ({
  AttributionControl: jest.fn(),
  Map: jest.fn(),
}))
jest.mock('#/common/auth', () => ({ useAuthSession: jest.fn() }))
jest.mock('#/common/store', () => ({
  useMapStore: jest.fn(),
  useUIStore: jest.fn(),
}))
jest.mock('#/common/store/mapStore/mapInstanceStore', () => ({
  useMapInstanceStore: jest.fn(),
}))
jest.mock('./MapActionsWrapper', () => ({ MapActionsWrapper: jest.fn() }))
jest.mock('./MapBottomControls', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('./MapPopupHandler', () => ({ MapPopupHandler: jest.fn() }))
jest.mock('./OverlayMessages', () => ({ OverlayMessages: jest.fn() }))
jest.mock('./mapAuthTransformRequest', () => ({
  createMapTransformRequest: jest.fn(),
}))

const { createMapHandlerStyle } = jest.requireActual<
  typeof import('./MapHandler')
>('./MapHandler')

describe('createMapHandlerStyle', () => {
  afterAll(() => {
    if (originalGeoserverUrl === undefined) {
      delete process.env.PUBLIC_GEOSERVER_URL
    } else {
      process.env.PUBLIC_GEOSERVER_URL = originalGeoserverUrl
    }
    jest.resetModules()
  })

  it('omits a GeoServer-derived glyph URL from the startup style', () => {
    const style = createMapHandlerStyle()
    const serializedStyle = JSON.stringify(style)

    expect(style).toEqual({
      version: 8,
      sources: {},
      layers: [],
    })
    expect(Object.hasOwn(style, 'glyphs')).toBe(false)
    expect(serializedStyle).not.toContain(geoserverUrl)
    expect(serializedStyle).not.toContain('/www/font/{fontstack}/{range}.pbf')
  })
})
