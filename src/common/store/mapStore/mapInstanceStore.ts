import { create } from 'zustand'
import { Map } from 'maplibre-gl'

type Vars = {
  _map: Map | null
}

type Actions = {
  _setMap: (map: Map) => void
}

export type MapInstanceState = Vars & Actions

export const useMapInstanceStore = create<MapInstanceState>((set) => ({
  _map: null,
  _setMap: (map) => set({ _map: map }),
}))
