import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { AxiosRequestConfig } from 'axios'
import type { FeatureCollection } from 'geojson'

import type { AuthSession } from '#/common/auth'

type AxiosGetMock = (
  url: string,
  config?: AxiosRequestConfig
) => Promise<{ data: FeatureCollection }>

const mockGetAuthSession = jest.fn<() => Promise<AuthSession | null>>()
const mockAxiosGet = jest.fn<AxiosGetMock>()

jest.mock('#/common/auth', () => ({
  getAuthSession: mockGetAuthSession,
}))

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: mockAxiosGet,
  },
  get: mockAxiosGet,
}))

const { geoserverJsonQuery } = jest.requireActual<
  typeof import('./geoserverJsonQuery')
>('./geoserverJsonQuery')
const { queryClient } = jest.requireActual<typeof import('./queryClient')>(
  './queryClient'
)

const featureCollection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

const authenticatedSession: AuthSession = {
  session: {
    id: 'session-id',
    userId: 'user-id',
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  },
  user: {
    id: 'user-id',
    name: 'Fixture User',
    email: 'fixture@example.test',
    image: null,
  },
  accessToken: 'fixture-access-token',
  accessTokenExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
}

describe('geoserverJsonQuery', () => {
  beforeEach(() => {
    queryClient.clear()
    mockGetAuthSession.mockResolvedValue(authenticatedSession)
    mockAxiosGet.mockResolvedValue({ data: featureCollection })
  })

  it('fetches public data without an auth lookup or Authorization header', async () => {
    const dataUrl = 'https://geoserver.example.test/public.geojson'

    await expect(geoserverJsonQuery(dataUrl, false)).resolves.toEqual(
      featureCollection
    )

    expect(mockGetAuthSession).not.toHaveBeenCalled()
    expect(mockAxiosGet).toHaveBeenCalledWith(dataUrl, {})
  })

  it('sends the Better Auth access token for authenticated requests', async () => {
    const dataUrl = 'https://geoserver.example.test/private.geojson'

    await expect(geoserverJsonQuery(dataUrl, true)).resolves.toEqual(
      featureCollection
    )

    expect(mockGetAuthSession).toHaveBeenCalledTimes(1)
    expect(mockAxiosGet).toHaveBeenCalledWith(dataUrl, {
      headers: {
        Authorization: 'Bearer fixture-access-token',
      },
    })
  })

  it('returns undefined and skips the fetch when auth is required without a token', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockGetAuthSession.mockResolvedValue(null)
    const dataUrl = 'https://geoserver.example.test/missing-token.geojson'

    await expect(geoserverJsonQuery(dataUrl, true)).resolves.toBeUndefined()

    expect(mockGetAuthSession).toHaveBeenCalledTimes(1)
    expect(mockAxiosGet).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalledWith(
      '[geoserverJsonQuery] No access token found in session. Ensure the user is authenticated.'
    )

    warnSpy.mockRestore()
  })
})
