import { useAppletStore } from './appletStore'

describe('Energiakartta applet store building filters', () => {
  beforeEach(() => {
    useAppletStore.getState().resetBuildingFilters()
  })

  it('defaults both construction-year switches off', () => {
    const state = useAppletStore.getState()

    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })

  it('resets both construction-year switches off', () => {
    useAppletStore.getState().setShowBuildingsFromSelectedDecade(true)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    useAppletStore.getState().resetBuildingFilters()

    const state = useAppletStore.getState()

    expect(state.showBuildingsFromSelectedDecade).toBe(false)
    expect(state.showOnlySelectedDecade).toBe(false)
  })
})
