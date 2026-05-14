import { ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE } from '../layers/buildingPolygonsLayerConf'
import { useAppletStore } from './appletStore'

describe('Energiakartta applet store building filters', () => {
  beforeEach(() => {
    useAppletStore.getState().resetBuildingFilters()
  })

  it('defaults to no selected construction decade with both switches off', () => {
    const state = useAppletStore.getState()

    expect(state.selectedConstructionDecade).toBe(
      ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE
    )
    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('resets to no selected construction decade with both switches off', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowBuildingsFromSelectedDecade(true)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    useAppletStore.getState().resetBuildingFilters()

    const state = useAppletStore.getState()

    expect(state.selectedConstructionDecade).toBe(
      ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE
    )
    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('turns only-selected-decade off when from-selected-decade is turned on', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    useAppletStore.getState().setShowBuildingsFromSelectedDecade(true)

    const state = useAppletStore.getState()

    expect(state.showBuildingsFromSelectedDecade).toBe(true)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('turns from-selected-decade off when only-selected-decade is turned on', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowBuildingsFromSelectedDecade(true)

    useAppletStore.getState().setShowOnlySelectedDecade(true)

    const state = useAppletStore.getState()

    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(true)
  })

  it('turning from-selected-decade off leaves both construction switches off', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowBuildingsFromSelectedDecade(true)

    useAppletStore.getState().setShowBuildingsFromSelectedDecade(false)

    const state = useAppletStore.getState()

    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('turning only-selected-decade off leaves both construction switches off', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    useAppletStore.getState().setShowOnlySelectedDecade(false)

    const state = useAppletStore.getState()

    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('keeps switches off when no construction decade is selected', () => {
    useAppletStore.getState().setShowBuildingsFromSelectedDecade(true)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    const state = useAppletStore.getState()

    expect(state.selectedConstructionDecade).toBe(
      ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE
    )
    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('clears both construction switches when no construction decade is selected', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    useAppletStore.getState().setSelectedConstructionDecade(null)

    const state = useAppletStore.getState()

    expect(state.selectedConstructionDecade).toBe(
      ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE
    )
    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })
})
