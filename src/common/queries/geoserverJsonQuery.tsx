import { FeatureCollection } from 'geojson'
import { queryClient } from './queryClient'
import { getSession } from 'next-auth/react'
import axios, { AxiosRequestConfig } from 'axios'

export const geoserverJsonQuery = async (
  dataUrl: string,
  useAccessToken?: boolean
): Promise<FeatureCollection | undefined> => {
  let accessToken: string | undefined = undefined

  if (useAccessToken) {
    const session = await getSession()
    accessToken = session?.accessToken

    if (!accessToken) {
      console.warn(
        '[geoserverJsonQuery] No access token found in session. Ensure the user is authenticated.'
      )
      return undefined
    }
  }

  try {
    const fetchedData = await queryClient.fetchQuery<FeatureCollection>({
      queryKey: ['geoserverJsonQuery', dataUrl],
      queryFn: async () => {
        const config: AxiosRequestConfig = {}
        if (accessToken) {
          config.headers = {
            Authorization: `Bearer ${accessToken}`,
          }
        }

        try {
          const response = await axios.get(dataUrl, config)

          const jsonData = response.data
          if (
            jsonData.type !== 'FeatureCollection' ||
            !Array.isArray(jsonData.features)
          ) {
            if (
              jsonData.includes(
                '<ServiceException code="InvalidParameterValue"'
              )
            ) {
              throw new Error(
                '[geoserverJsonQuery] Invalid parameter value in response from GeoServer.'
              )
            }
            console.warn(
              `[geoserverJsonQuery] Data fetched from ${dataUrl} is not a valid FeatureCollection. Received:`,
              jsonData
            )
            throw new Error(
              '[geoserverJsonQuery] Fetched data is not a valid FeatureCollection.'
            )
          }
          return jsonData as FeatureCollection
        } catch (error: any) {
          // Handle Axios errors (network errors, 4xx/5xx responses)
          const status = error.response?.status
          const statusText = error.response?.statusText
          const message = error.message
          throw new Error(
            `[geoserverJsonQuery] Failed to fetch GeoJSON from ${dataUrl}: ${
              status ? `${status} ${statusText}` : message
            }`
          )
        }
      },
    })

    return fetchedData
  } catch (fetchError) {
    console.error(
      `[geoserverJsonQuery] Failed to pre-fetch GeoJSON from "${dataUrl}". MapLibre will attempt to load it using the URL. Error:`,
      fetchError
    )
  }
}
