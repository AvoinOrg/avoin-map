import React from 'react'
import '@testing-library/jest-dom'
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'

import { useLayerFixtureStore } from '../state/layerFixtureStore'
import CustomTestLayersAccordionContent from './CustomTestLayersAccordionContent'

const translations: Record<string, string> = {
  'layers.custom_test_layers.dataset.label': 'Data shown on the map',
  'layers.custom_test_layers.dataset.aria_label': 'Choose mock map data',
  'layers.custom_test_layers.dataset.options.all-mock-data': 'All mock data',
  'layers.custom_test_layers.dataset.options.sample-points': 'Sample points',
  'layers.custom_test_layers.dataset.options.imaginary-routes':
    'Imaginary routes',
  'layers.custom_test_layers.dataset.options.sample-zones': 'Sample zones',
  'layers.custom_test_layers.year.label': 'Year',
  'layers.custom_test_layers.year.aria_label': 'Choose mock data year',
  'layers.custom_test_layers.year.options.any-year': 'Any year',
  'layers.custom_test_layers.year.options.2024': '2024',
  'layers.custom_test_layers.year.options.2032': '2032',
  'layers.custom_test_layers.year.options.2040': '2040',
  'layers.custom_test_layers.switches.include_drafts':
    'Include draft records',
  'layers.custom_test_layers.switches.show_labels': 'Show mock labels',
}

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}))

const renderFixture = () =>
  render(
    <AppThemeProvider disableCssBaseline>
      <CustomTestLayersAccordionContent />
    </AppThemeProvider>
  )

const selectOption = async (comboboxName: string, optionName: string) => {
  fireEvent.click(screen.getByRole('combobox', { name: comboboxName }))
  const option = await screen.findByRole('option', { name: optionName })
  fireEvent.mouseMove(option)
  await waitFor(() => {
    expect(option).toHaveAttribute('data-highlighted')
  })
  fireEvent.click(option)
}

describe('CustomTestLayersAccordionContent', () => {
  const originalGetBoundingClientRect =
    HTMLElement.prototype.getBoundingClientRect

  beforeAll(() => {
    HTMLElement.prototype.getBoundingClientRect = () =>
      ({
        bottom: 20,
        height: 20,
        left: 0,
        right: 180,
        top: 0,
        width: 180,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect
  })

  afterAll(() => {
    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect
  })

  beforeEach(() => {
    useLayerFixtureStore.getState().reset()
  })

  it('exposes and controls every fake dataset and year option', async () => {
    renderFixture()

    const datasetSelections = [
      ['Sample points', 'sample-points'],
      ['Imaginary routes', 'imaginary-routes'],
      ['Sample zones', 'sample-zones'],
      ['All mock data', 'all-mock-data'],
    ] as const

    for (const [label, value] of datasetSelections) {
      await selectOption('Choose mock map data', label)
      expect(useLayerFixtureStore.getState().datasetId).toBe(value)
    }

    const yearSelections = [
      ['2024', '2024'],
      ['2032', '2032'],
      ['2040', '2040'],
      ['Any year', 'any-year'],
    ] as const

    for (const [label, value] of yearSelections) {
      await selectOption('Choose mock data year', label)
      expect(useLayerFixtureStore.getState().yearId).toBe(value)
    }
  })

  it('keeps both mock-data switches independently controlled', () => {
    renderFixture()

    const draftsSwitch = screen.getByRole('switch', {
      name: 'Include draft records',
    })
    const labelsSwitch = screen.getByRole('switch', {
      name: 'Show mock labels',
    })

    expect(draftsSwitch).toBeChecked()
    expect(labelsSwitch).toBeChecked()

    fireEvent.click(draftsSwitch)
    expect(draftsSwitch).not.toBeChecked()
    expect(labelsSwitch).toBeChecked()
    expect(useLayerFixtureStore.getState().includeDraftRecords).toBe(false)

    fireEvent.click(labelsSwitch)
    expect(draftsSwitch).not.toBeChecked()
    expect(labelsSwitch).not.toBeChecked()
    expect(useLayerFixtureStore.getState().showMockLabels).toBe(false)
  })
})
