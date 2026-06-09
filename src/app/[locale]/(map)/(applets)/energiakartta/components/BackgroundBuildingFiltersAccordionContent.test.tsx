import React from 'react'
import '#/test/baseUiTestPolyfills'
import { fireEvent, render, screen, within } from '@testing-library/react'

import { ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE } from '../layers/buildingPolygonsLayerConf'
import { useAppletStore } from '../state/appletStore'
import BackgroundBuildingFiltersAccordionContent from './BackgroundBuildingFiltersAccordionContent'

jest.mock('@tolgee/react', () => {
  const translations: Record<string, string> = {
    'sidebar.background_filters.building_types.all': 'All buildings',
    'sidebar.background_filters.building_types.01': 'Residential',
    'sidebar.background_filters.building_types.02': 'Free-time residential',
    'sidebar.background_filters.building_types.03': 'Commercial',
    'sidebar.background_filters.building_types.04': 'Office',
    'sidebar.background_filters.building_types.05': 'Traffic',
    'sidebar.background_filters.building_types.06': 'Care',
    'sidebar.background_filters.building_types.07': 'Assembly',
    'sidebar.background_filters.building_types.label': 'Building type',
    'sidebar.background_filters.building_types.aria_label':
      'Building type filter',
    'sidebar.background_filters.construction_year.any': 'Any year',
    'sidebar.background_filters.construction_year.label': 'Construction year',
    'sidebar.background_filters.construction_year.aria_label':
      'Construction year filter',
    'sidebar.background_filters.construction_year.show_from_decade':
      'Show from decade',
    'sidebar.background_filters.construction_year.show_only_decade':
      'Show only decade',
  }

  return {
    T: ({ keyName }: { keyName: string }) => keyName,
    useTranslate: () => ({
      t: (key: string) => translations[key] ?? key,
    }),
  }
})

const getConstructionYearSelect = () =>
  screen.getByRole('combobox', { name: 'Construction year filter' })

const getBuildingTypeSelect = () =>
  screen.getByRole('combobox', { name: 'Building type filter' })

const openSelectOptionList = async () => {
  const listbox = await screen.findByRole('listbox')
  return listbox
}

const selectRenderedOption = async (label: string) => {
  const listbox = await openSelectOptionList()
  const option = within(listbox).getByRole('option', { name: label })
  fireEvent.mouseMove(option)
  fireEvent.click(option)

  return option
}

describe('BackgroundBuildingFiltersAccordionContent', () => {
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect

  beforeAll(() => {
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({
        bottom: 20,
        height: 20,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect
  })

  afterAll(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect
  })

  beforeEach(() => {
    useAppletStore.getState().resetBuildingFilters()
  })

  it('updates store values when building type and decade are selected from rendered popovers', async () => {
    const { rerender } = render(<BackgroundBuildingFiltersAccordionContent />)

    const buildingTypeSelect = getBuildingTypeSelect()
    const constructionYearSelect = getConstructionYearSelect()

    fireEvent.click(buildingTypeSelect)
    await selectRenderedOption('Residential')

    expect(buildingTypeSelect).toHaveTextContent('Residential')
    expect(useAppletStore.getState().buildingTypeFilter).toBe('01')

    rerender(<BackgroundBuildingFiltersAccordionContent />)
    expect(buildingTypeSelect).toHaveTextContent('Residential')

    fireEvent.click(constructionYearSelect)
    await selectRenderedOption('1900 - 1909')

    expect(constructionYearSelect).toHaveTextContent('1900 - 1909')
    expect(useAppletStore.getState().selectedConstructionDecade).toBe(1900)

    expect(
      screen.getByRole('switch', { name: 'Show from decade' })
    ).not.toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByRole('switch', { name: 'Show only decade' })
    ).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('renders Any year as the default and first construction-year option', async () => {
    render(<BackgroundBuildingFiltersAccordionContent />)

    const constructionYearSelect = getConstructionYearSelect()

    expect(constructionYearSelect).toHaveTextContent('Any year')
    expect(
      screen.getByRole('switch', { name: 'Show from decade' })
    ).toHaveAttribute('aria-disabled', 'true')
    expect(
      screen.getByRole('switch', { name: 'Show only decade' })
    ).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(constructionYearSelect)

    const listbox = await openSelectOptionList()
    const options = within(listbox).getAllByRole('option')

    expect(options[0]).toHaveTextContent('Any year')
    expect(options[1]).toHaveTextContent('1900 - 1909')
  })

  it('keeps the construction-year switches exclusive in rendered state and store state', () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)

    render(<BackgroundBuildingFiltersAccordionContent />)

    const showFromSwitch = screen.getByRole('switch', {
      name: 'Show from decade',
    })
    const showOnlySwitch = screen.getByRole('switch', {
      name: 'Show only decade',
    })

    expect(showFromSwitch).not.toHaveAttribute('aria-disabled', 'true')
    expect(showOnlySwitch).not.toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(showFromSwitch)

    expect(showFromSwitch).toBeChecked()
    expect(showOnlySwitch).not.toBeChecked()
    expect(useAppletStore.getState().showBuildingsFromSelectedDecade).toBe(
      true
    )
    expect(useAppletStore.getState().showOnlySelectedDecade).toBe(false)

    fireEvent.click(showOnlySwitch)

    expect(showFromSwitch).not.toBeChecked()
    expect(showOnlySwitch).toBeChecked()
    expect(useAppletStore.getState().showBuildingsFromSelectedDecade).toBe(
      false
    )
    expect(useAppletStore.getState().showOnlySelectedDecade).toBe(true)

    fireEvent.click(showOnlySwitch)

    expect(showFromSwitch).not.toBeChecked()
    expect(showOnlySwitch).not.toBeChecked()
    expect(useAppletStore.getState().showBuildingsFromSelectedDecade).toBe(
      false
    )
    expect(useAppletStore.getState().showOnlySelectedDecade).toBe(false)
  })

  it('clears construction-year switches when Any year is selected', async () => {
    useAppletStore.getState().setSelectedConstructionDecade(1970)
    useAppletStore.getState().setShowOnlySelectedDecade(true)

    render(<BackgroundBuildingFiltersAccordionContent />)

    const constructionYearSelect = getConstructionYearSelect()
    const showFromSwitch = screen.getByRole('switch', {
      name: 'Show from decade',
    })
    const showOnlySwitch = screen.getByRole('switch', {
      name: 'Show only decade',
    })

    expect(showOnlySwitch).toBeChecked()

    fireEvent.click(constructionYearSelect)
    const listbox = await openSelectOptionList()
    const anyYearOption = within(listbox).getByRole('option', {
      name: 'Any year',
    })
    fireEvent.mouseMove(anyYearOption)
    fireEvent.click(anyYearOption)

    expect(constructionYearSelect).toHaveTextContent('Any year')
    expect(showFromSwitch).not.toBeChecked()
    expect(showOnlySwitch).not.toBeChecked()
    expect(showFromSwitch).toHaveAttribute('aria-disabled', 'true')
    expect(showOnlySwitch).toHaveAttribute('aria-disabled', 'true')
    expect(useAppletStore.getState().selectedConstructionDecade).toBe(
      ENERGYMAP_DEFAULT_SELECTED_CONSTRUCTION_DECADE
    )
  })
})
