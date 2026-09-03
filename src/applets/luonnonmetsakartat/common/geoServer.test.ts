import {
  buildFolayerTileUrl,
  buildFolayerWfsUrl,
  resolveFolayerGeoServerSource,
} from './geoServer'

describe('Luonnonmetsakartat GeoServer adapter', () => {
  const configuredEnv = {
    PUBLIC_GEOSERVER_URL: ' https://gis.example.test/root/geoserver/// ',
    PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE: ' forests_workspace ',
  }

  it('preserves the explicit mock source and URLs', () => {
    expect(
      resolveFolayerGeoServerSource({ mockScenariosEnabled: true })
    ).toEqual({
      baseUrl: '/api/luonnonmetsakartat/geoserver',
      workspace: 'mock',
      isMock: true,
    })
    expect(
      buildFolayerTileUrl({
        mockScenariosEnabled: true,
        sourceLayer: 'forest_areas_layerid',
      })
    ).toBe(
      '/api/luonnonmetsakartat/geoserver/gwc/service/tms/1.0.0/mock:forest_areas_layerid@EPSG:900913@pbf/{z}/{x}/{y}.pbf'
    )
    expect(
      buildFolayerWfsUrl({
        mockScenariosEnabled: true,
        centroidSourceLayer: 'forest_areas_layerid_centroid',
      })
    ).toBe(
      '/api/luonnonmetsakartat/geoserver/mock/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mock:forest_areas_layerid_centroid&outputFormat=application/json&srsName=EPSG:4326'
    )
  })

  it('builds real tile and WFS URLs from both validated values', () => {
    expect(
      buildFolayerTileUrl({
        env: configuredEnv,
        mockScenariosEnabled: false,
        sourceLayer: 'forest_areas_layerid',
      })
    ).toBe(
      'https://gis.example.test/root/geoserver/gwc/service/tms/1.0.0/forests_workspace:forest_areas_layerid@EPSG:900913@pbf/{z}/{x}/{y}.pbf'
    )
    expect(
      buildFolayerWfsUrl({
        env: configuredEnv,
        mockScenariosEnabled: false,
        centroidSourceLayer: 'forest_areas_layerid_centroid',
      })
    ).toBe(
      'https://gis.example.test/root/geoserver/forests_workspace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=forests_workspace:forest_areas_layerid_centroid&outputFormat=application/json&srsName=EPSG:4326'
    )
  })

  it.each([
    [{ PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE: 'forests' }],
    [{ PUBLIC_GEOSERVER_URL: 'https://gis.example.test/geoserver' }],
    [
      {
        PUBLIC_GEOSERVER_URL: 'https://gis.example.test/geoserver',
        PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE: 'undefined',
      },
    ],
  ])('does not build real URLs from incomplete configuration', (env) => {
    const tileUrl = buildFolayerTileUrl({
      env,
      mockScenariosEnabled: false,
      sourceLayer: 'forest_areas_layerid',
    })
    const wfsUrl = buildFolayerWfsUrl({
      env,
      mockScenariosEnabled: false,
      centroidSourceLayer: 'forest_areas_layerid_centroid',
    })

    expect(tileUrl).toBeUndefined()
    expect(wfsUrl).toBeUndefined()
    expect(JSON.stringify({ tileUrl, wfsUrl })).not.toContain('undefined/')
  })
})
