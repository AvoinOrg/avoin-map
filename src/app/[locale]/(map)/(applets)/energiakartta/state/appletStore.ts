import { create } from 'zustand'
import { subscribeWithSelector, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { commonDevtools } from '#/common/store/shared-devtools'
import {
  ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
  ENERGYMAP_DEFAULT_CONSTRUCTION_DECADE,
} from '../layers/buildingPolygonsLayerConf'
import { ENERGY_CERTIFICATE_CLASS_CODES } from '../layers/energyCertificateLayerConf'
import type {
  EnergymapBuildingFilterState,
  EnergymapBuildingTypeFilter,
} from '../layers/buildingPolygonsLayerConf'
import type { EnergyCertificateClassCode } from '../layers/energyCertificateLayerConf'

type EnergyCertificateClassFilterState = {
  activeEnergyCertificateClasses: EnergyCertificateClassCode[]
}

type Vars = EnergymapBuildingFilterState & EnergyCertificateClassFilterState

type Actions = {
  setBuildingTypeFilter: (
    buildingTypeFilter: EnergymapBuildingTypeFilter
  ) => void
  setSelectedConstructionDecade: (selectedConstructionDecade: number) => void
  setShowBuildingsFromSelectedDecade: (
    showBuildingsFromSelectedDecade: boolean
  ) => void
  setShowOnlySelectedDecade: (showOnlySelectedDecade: boolean) => void
  setEnergyCertificateClassActive: (
    classCode: EnergyCertificateClassCode,
    isActive: boolean
  ) => void
  toggleEnergyCertificateClass: (
    classCode: EnergyCertificateClassCode
  ) => void
  setActiveEnergyCertificateClasses: (
    activeEnergyCertificateClasses: EnergyCertificateClassCode[]
  ) => void
  resetEnergyCertificateClassFilters: () => void
  resetBuildingFilters: () => void
}

export type State = Vars & Actions

const initialBuildingFilterState: Vars = {
  buildingTypeFilter: ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
  selectedConstructionDecade: ENERGYMAP_DEFAULT_CONSTRUCTION_DECADE,
  showBuildingsFromSelectedDecade: false,
  showOnlySelectedDecade: false,
  activeEnergyCertificateClasses: [...ENERGY_CERTIFICATE_CLASS_CODES],
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
          setEnergyCertificateClassActive: (classCode, isActive) => {
            set((state) => {
              const classSet = new Set(state.activeEnergyCertificateClasses)

              if (isActive) {
                classSet.add(classCode)
              } else {
                classSet.delete(classCode)
              }

              state.activeEnergyCertificateClasses =
                ENERGY_CERTIFICATE_CLASS_CODES.filter((candidateClassCode) =>
                  classSet.has(candidateClassCode)
                )
            })
          },
          toggleEnergyCertificateClass: (classCode) => {
            set((state) => {
              const classSet = new Set(state.activeEnergyCertificateClasses)

              if (classSet.has(classCode)) {
                classSet.delete(classCode)
              } else {
                classSet.add(classCode)
              }

              state.activeEnergyCertificateClasses =
                ENERGY_CERTIFICATE_CLASS_CODES.filter((candidateClassCode) =>
                  classSet.has(candidateClassCode)
                )
            })
          },
          setActiveEnergyCertificateClasses: (
            activeEnergyCertificateClasses
          ) => {
            set((state) => {
              const classSet = new Set(activeEnergyCertificateClasses)

              state.activeEnergyCertificateClasses =
                ENERGY_CERTIFICATE_CLASS_CODES.filter((classCode) =>
                  classSet.has(classCode)
                )
            })
          },
          resetEnergyCertificateClassFilters: () => {
            set((state) => {
              state.activeEnergyCertificateClasses = [
                ...initialBuildingFilterState.activeEnergyCertificateClasses,
              ]
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
