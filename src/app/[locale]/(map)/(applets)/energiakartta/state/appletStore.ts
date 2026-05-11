import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { commonDevtools } from '#/common/store/shared-devtools'
import {
  ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
  ENERGYMAP_DEFAULT_CONSTRUCTION_DECADE,
} from '../layers/buildingPolygonsLayerConf'
import type {
  EnergymapBuildingFilterState,
  EnergymapBuildingTypeFilter,
} from '../layers/buildingPolygonsLayerConf'

type Vars = EnergymapBuildingFilterState

type Actions = {
  setBuildingTypeFilter: (
    buildingTypeFilter: EnergymapBuildingTypeFilter
  ) => void
  setSelectedConstructionDecade: (selectedConstructionDecade: number) => void
  setShowBuildingsFromSelectedDecade: (
    showBuildingsFromSelectedDecade: boolean
  ) => void
  setShowOnlySelectedDecade: (showOnlySelectedDecade: boolean) => void
  resetBuildingFilters: () => void
}

export type State = Vars & Actions

const initialBuildingFilterState: Vars = {
  buildingTypeFilter: ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
  selectedConstructionDecade: ENERGYMAP_DEFAULT_CONSTRUCTION_DECADE,
  showBuildingsFromSelectedDecade: true,
  showOnlySelectedDecade: false,
}

export const useAppletStore = create<State>()(
  devtools(
    subscribeWithSelector(
      immer((set) => {
        const vars = initialBuildingFilterState

        const actions: Actions = {
          setBuildingTypeFilter: (buildingTypeFilter) => {
            set((state) => {
              state.buildingTypeFilter = buildingTypeFilter
            })
          },
          setSelectedConstructionDecade: (selectedConstructionDecade) => {
            set((state) => {
              state.selectedConstructionDecade = selectedConstructionDecade
            })
          },
          setShowBuildingsFromSelectedDecade: (
            showBuildingsFromSelectedDecade
          ) => {
            set((state) => {
              state.showBuildingsFromSelectedDecade =
                showBuildingsFromSelectedDecade
            })
          },
          setShowOnlySelectedDecade: (showOnlySelectedDecade) => {
            set((state) => {
              state.showOnlySelectedDecade = showOnlySelectedDecade
            })
          },
          resetBuildingFilters: () => {
            set((state) => {
              state.buildingTypeFilter =
                initialBuildingFilterState.buildingTypeFilter
              state.selectedConstructionDecade =
                initialBuildingFilterState.selectedConstructionDecade
              state.showBuildingsFromSelectedDecade =
                initialBuildingFilterState.showBuildingsFromSelectedDecade
              state.showOnlySelectedDecade =
                initialBuildingFilterState.showOnlySelectedDecade
            })
          },
        }

        return { ...vars, ...actions }
      })
    ),
    { ...commonDevtools, store: 'energiakarttaStore' }
  )
)
