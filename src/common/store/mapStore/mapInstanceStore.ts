import { create } from 'zustand'
import { Map } from 'maplibre-gl'

type Vars = {
  _map: Map | null
}

type Actions = {
  setMap: (map: Map) => void
}

export type MapInstanceState = Vars & Actions

export const useMapInstanceStore = create<MapInstanceState>((set) => ({
  _map: null,
  setMap: (map) => set({ _map: map }),
}))
