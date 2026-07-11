import type { RequestTransformFunction } from 'maplibre-gl'

import { EMBEDDED_PARAMS_URL_PREFIX } from '#/common/types/map'
import { decodeUrlAndParams } from '#/common/utils/map'

type CreateMapTransformRequestOptions = {
  accessToken?: string
  addStaleSourceId?: (sourceId: string) => void
}

export const createMapTransformRequest = ({
  accessToken,
  addStaleSourceId,
}: CreateMapTransformRequestOptions): RequestTransformFunction => {
  return (url) => {
    if (url.startsWith(EMBEDDED_PARAMS_URL_PREFIX)) {
      const decoded = decodeUrlAndParams(url)
      if (decoded == null) {
        console.error('Maplibre: Could not decode URL and parameters from', url)
        return { url }
      }

      const { url: originalUrl, params } = decoded

      if (params.useAccessToken) {
        if (!accessToken) {
          console.error(
            'Maplibre: No access token provided for the request.',
            originalUrl
          )

          addStaleSourceId?.(
            typeof params.sourceId === 'string' ? params.sourceId : originalUrl
          )

          return { url: originalUrl }
        }

        return {
          url: originalUrl,
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      }

      return { url: originalUrl }
    }

    const geoserverUrl = process.env.PUBLIC_GEOSERVER_URL

    if (
      url.includes('requireToken=true') &&
      geoserverUrl != null &&
      url.includes(geoserverUrl)
    ) {
      if (!accessToken) {
        console.error('Maplibre: No access token provided for the request.', url)
        return { url }
      }

      return {
        url,
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    }
  }
}
