import axios from 'axios'

const mockUseAuthSession = jest.fn()
const mockGetAppletState = jest.fn()
const mockGetRequiredBearerAuthHeader = jest.fn()

jest.mock('axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}))

jest.mock('#/common/auth', () => ({
  useAuthSession: mockUseAuthSession,
}))

jest.mock('applets/luonnonmetsakartat/state/appletStore', () => ({
  useAppletStore: { getState: mockGetAppletState },
}))

jest.mock('../utils', () => ({
  getFolayerCentroidSourceLayer: (folayerId: string) =>
    `forest_areas_${folayerId.replace(/-/g, '')}_centroid`,
}))

jest.mock('./authHeaders', () => ({
  getRequiredBearerAuthHeader: mockGetRequiredBearerAuthHeader,
}))

import { FolayerConfState } from '../types'
import { useAdminFolayerAreaQueryOptions } from './adminFolayerAreaQuery'
import { folayerAreaQuery } from './folayerAreaQuery'

const mockedAxiosGet = jest.mocked(axios.get)

const runQuery = async (queryFn: unknown) => {
  expect(typeof queryFn).toBe('function')
  return (queryFn as () => Promise<unknown>)()
}

describe('Luonnonmetsakartat folayer GeoServer queries', () => {
  const originalGeoServerUrl = process.env.PUBLIC_GEOSERVER_URL
  const originalWorkspace =
    process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE
  const originalMockScenarios =
    process.env.PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED
  const updateFolayerAreaConf = jest.fn()
  const addFolayerAreaConf = jest.fn()

  beforeEach(() => {
    process.env.PUBLIC_GEOSERVER_URL =
      ' https://gis.example.test/root/geoserver/// '
    process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE = ' forests '
    process.env.PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED = '0'
    mockUseAuthSession.mockReturnValue({
      data: { accessToken: 'admin-access-token' },
    })
    mockGetRequiredBearerAuthHeader.mockReturnValue({
      Authorization: 'Bearer admin-access-token',
    })
    mockGetAppletState.mockReturnValue({
      folayerAreaConfs: {},
      updateFolayerAreaConf,
      addFolayerAreaConf,
    })
    mockedAxiosGet.mockResolvedValue({
      status: 200,
      data: { type: 'FeatureCollection', features: [] },
    })
  })

  afterAll(() => {
    const restoreEnv = (key: string, value: string | undefined) => {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }

    restoreEnv('PUBLIC_GEOSERVER_URL', originalGeoServerUrl)
    restoreEnv(
      'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE',
      originalWorkspace
    )
    restoreEnv(
      'PUBLIC_LUONNONMETSAKARTAT_MOCK_SCENARIOS_ENABLED',
      originalMockScenarios
    )
  })

  it('calls public WFS with the normalized URL', async () => {
    const options = folayerAreaQuery('layer-id')

    await expect(runQuery(options.queryFn)).resolves.toMatchObject({
      id: 'layer-id',
      state: FolayerConfState.Idle,
    })
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      'https://gis.example.test/root/geoserver/forests/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=forests:forest_areas_layerid_centroid&outputFormat=application/json&srsName=EPSG:4326'
    )
    expect(addFolayerAreaConf).toHaveBeenCalledWith(
      'layer-id',
      expect.objectContaining({ state: FolayerConfState.Fetching })
    )
  })

  it('calls admin WFS with the existing bearer-header behavior', async () => {
    const options = useAdminFolayerAreaQueryOptions('layer-id')

    await expect(runQuery(options.queryFn)).resolves.toMatchObject({
      id: 'layer-id',
      state: FolayerConfState.Idle,
    })
    expect(mockGetRequiredBearerAuthHeader).toHaveBeenCalledWith({
      accessToken: 'admin-access-token',
      requestName: 'Luonnonmetsakartat admin folayer areas',
    })
    expect(mockedAxiosGet).toHaveBeenCalledWith(
      'https://gis.example.test/root/geoserver/forests/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=forests:forest_areas_layerid_centroid&outputFormat=application/json&srsName=EPSG:4326',
      {
        headers: { Authorization: 'Bearer admin-access-token' },
      }
    )
  })

  it.each([
    ['public', 'base'],
    ['public', 'workspace'],
    ['admin', 'base'],
    ['admin', 'workspace'],
  ] as const)(
    'skips the %s query before state or request work when %s is missing',
    async (queryKind, missingValue) => {
      if (missingValue === 'base') {
        delete process.env.PUBLIC_GEOSERVER_URL
      } else {
        delete process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE
      }
      const options =
        queryKind === 'admin'
          ? useAdminFolayerAreaQueryOptions('layer-id')
          : folayerAreaQuery('layer-id')

      await expect(runQuery(options.queryFn)).resolves.toBeNull()
      expect(mockedAxiosGet).not.toHaveBeenCalled()
      expect(mockGetAppletState).not.toHaveBeenCalled()
      expect(updateFolayerAreaConf).not.toHaveBeenCalled()
      expect(addFolayerAreaConf).not.toHaveBeenCalled()
      expect(mockGetRequiredBearerAuthHeader).not.toHaveBeenCalled()
    }
  )
})
