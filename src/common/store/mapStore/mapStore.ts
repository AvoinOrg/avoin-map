import { useMapInstanceStore, type MapInstanceState } from './mapInstanceStore'
import { useMapStateStore, type State as MapState } from './mapStateStore'

export const useMapStore = <T>(
  selector: (state: MapState & MapInstanceState) => T
): T => {
  const mapInstance = useMapInstanceStore()
  const mapState = useMapStateStore()
  return selector({ ...mapState, ...mapInstance })
}
