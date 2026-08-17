import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals'

import { EMBEDDED_PARAMS_URL_PREFIX } from '#/common/types/map'

const mockDecodeUrlAndParams = jest.fn()

jest.mock('#/common/utils/map', () => ({
  decodeUrlAndParams: mockDecodeUrlAndParams,
}))

const { createMapTransformRequest } = jest.requireActual<
  typeof import('./mapAuthTransformRequest')
>('./mapAuthTransformRequest')

describe('createMapTransformRequest', () => {
  const originalGeoserverUrl = process.env.PUBLIC_GEOSERVER_URL

  beforeEach(() => {
    process.env.PUBLIC_GEOSERVER_URL = 'https://gis.example.test/geoserver'
    mockDecodeUrlAndParams.mockReset()
  })

  afterAll(() => {
    process.env.PUBLIC_GEOSERVER_URL = originalGeoserverUrl
  })

  it('adds the access token for configured GeoServer URLs that require a token', () => {
    const url =
      'https://gis.example.test/geoserver/wms?service=WMS&requireToken=true'
    const transformRequest = createMapTransformRequest({
      accessToken: 'map-access-token',
    })

    expect(transformRequest(url)).toEqual({
      url,
      headers: {
        Authorization: 'Bearer map-access-token',
      },
    })
  })

  it('returns the original GeoServer URL when a required token is missing', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const url =
      'https://gis.example.test/geoserver/wms?service=WMS&requireToken=true'
    const transformRequest = createMapTransformRequest({})

    expect(transformRequest(url)).toEqual({ url })
    expect(errorSpy).toHaveBeenCalledWith(
      'Maplibre: No access token provided for the request.',
      url
    )

    errorSpy.mockRestore()
  })

  it('adds the access token for embedded URLs with useAccessToken', () => {
    const embeddedUrl = `${EMBEDDED_PARAMS_URL_PREFIX}fixture`
    const originalUrl = 'https://tiles.example.test/private.json'
    mockDecodeUrlAndParams.mockReturnValue({
      url: originalUrl,
      params: {
        useAccessToken: true,
        sourceId: 'fixture-source',
      },
    })
    const transformRequest = createMapTransformRequest({
      accessToken: 'map-access-token',
    })

    expect(transformRequest(embeddedUrl)).toEqual({
      url: originalUrl,
      headers: {
        Authorization: 'Bearer map-access-token',
      },
    })
  })

  it('tracks stale embedded sources when a required token is missing', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const addStaleSourceId = jest.fn()
    const embeddedUrl = `${EMBEDDED_PARAMS_URL_PREFIX}fixture`
    const originalUrl = 'https://tiles.example.test/private.json'
    mockDecodeUrlAndParams.mockReturnValue({
      url: originalUrl,
      params: {
        useAccessToken: true,
        sourceId: 'fixture-source',
      },
    })
    const transformRequest = createMapTransformRequest({
      addStaleSourceId,
    })

    expect(transformRequest(embeddedUrl)).toEqual({ url: originalUrl })
    expect(addStaleSourceId).toHaveBeenCalledWith('fixture-source')
    expect(errorSpy).toHaveBeenCalledWith(
      'Maplibre: No access token provided for the request.',
      originalUrl
    )

    errorSpy.mockRestore()
  })

  it('unwraps embedded URLs that do not request an access token', () => {
    const embeddedUrl = `${EMBEDDED_PARAMS_URL_PREFIX}fixture`
    const originalUrl = 'https://tiles.example.test/public.json'
    mockDecodeUrlAndParams.mockReturnValue({
      url: originalUrl,
      params: {
        useAccessToken: false,
      },
    })
    const transformRequest = createMapTransformRequest({
      accessToken: 'map-access-token',
    })

    expect(transformRequest(embeddedUrl)).toEqual({ url: originalUrl })
  })
})
