import { FeatureCollection } from 'geojson'
import { queryClient } from './queryClient'

export const geoserverJsonQuery = async (
  dataUrl: string
): Promise<FeatureCollection | undefined> => {
  try {
    const fetchedData = await queryClient.fetchQuery<FeatureCollection>({
      queryKey: ['geoserverJsonQuery', dataUrl],
      queryFn: async () => {
        const response = await fetch(dataUrl)
        if (!response.ok) {
          throw new Error(
            `[geoserverJsonQuery] Failed to fetch GeoJSON from ${dataUrl}: ${response.status} ${response.statusText}`
          )
        }
        const jsonData = await response.json()
        if (
          jsonData.type !== 'FeatureCollection' ||
          !Array.isArray(jsonData.features)
        ) {
          console.warn(
            `[geoserverJsonQuery] Data fetched from ${dataUrl} is not a valid FeatureCollection. Received:`,
            jsonData
          )
          throw new Error(
            '[geoserverJsonQuery] Fetched data is not a valid FeatureCollection.'
          )
        }
        return jsonData as FeatureCollection
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
