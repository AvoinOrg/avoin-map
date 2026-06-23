import { setWorkerUrl } from 'maplibre-gl'
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'

if (typeof window !== 'undefined') {
  setWorkerUrl(maplibreWorkerUrl)
}
