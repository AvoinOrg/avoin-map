import { afterAll, describe, expect, it, jest } from '@jest/globals'
import type { StyleSpecification } from 'maplibre-gl'

const geoserverUrl = 'https://gis.example.test/geoserver'
const originalGeoserverUrl = process.env.PUBLIC_GEOSERVER_URL

process.env.PUBLIC_GEOSERVER_URL = geoserverUrl

jest.mock('maplibre-gl', () => ({
  Map: jest.fn(),
}))

const { createCarbonMapGraphStyle } = jest.requireActual<
  typeof import('./CarbonMapGraphMap')
>('./CarbonMapGraphMap')

describe('createCarbonMapGraphStyle', () => {
  afterAll(() => {
    if (originalGeoserverUrl === undefined) {
      delete process.env.PUBLIC_GEOSERVER_URL
    } else {
      process.env.PUBLIC_GEOSERVER_URL = originalGeoserverUrl
    }
    jest.resetModules()
  })

  it('keeps an omitted glyphs property omitted', () => {
    const baseStyle: StyleSpecification = {
      version: 8,
      name: 'Caller style without glyphs',
      sources: {},
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: { 'background-color': '#ffffff' },
        },
      ],
    }

    const style = createCarbonMapGraphStyle(baseStyle)
    const serializedStyle = JSON.stringify(style)

    expect(style).toEqual(baseStyle)
    expect(style).not.toBe(baseStyle)
    expect(Object.hasOwn(style, 'glyphs')).toBe(false)
    expect(serializedStyle).not.toContain(geoserverUrl)
    expect(serializedStyle).not.toContain('/www/font/')
  })

  it('preserves an explicit caller-owned glyph URL and other style fields', () => {
    const glyphs = 'https://fonts.example.test/{fontstack}/{range}.pbf'
    const baseStyle: StyleSpecification = {
      version: 8,
      name: 'Caller style with glyphs',
      glyphs,
      sources: {},
      layers: [],
    }

    const style = createCarbonMapGraphStyle(baseStyle)

    expect(style).toEqual(baseStyle)
    expect(style).not.toBe(baseStyle)
    expect(style.glyphs).toBe(glyphs)
  })
})
