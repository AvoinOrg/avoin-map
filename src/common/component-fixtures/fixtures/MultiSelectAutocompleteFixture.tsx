import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import type { SelectOption } from '#/common/types/general'
import MultiSelectAutocomplete from '#/components/common/MultiSelectAutocomplete'

const noop = () => {}

const autocompleteOptions: SelectOption[] = [
  { value: 'central-plan', label: 'Central plan' },
  { value: 'harbor-plan', label: 'Harbor plan' },
  { value: 'forest-edge', label: 'Forest edge' },
]

const longAutocompleteOptions: SelectOption[] = Array.from(
  { length: 16 },
  (_, index) => ({
    value: `overflow-plan-${index + 1}`,
    label: `Overflow plan ${String(index + 1).padStart(2, '0')}`,
  })
)

const MultiSelectAutocompleteFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 420,
      minHeight: 220,
      p: 2,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    }}
  >
    {children}
  </Box>
)

export const multiSelectAutocompleteFixture: ComponentFixture = {
  id: 'multi-select-autocomplete',
  label: 'MultiSelectAutocomplete',
  description: 'Shared multi-select autocomplete states.',
  sourceGlobs: [
    'src/components/common/MultiSelectAutocomplete.tsx',
    'src/components/common/MultiSelectAutocomplete.test.tsx',
    'src/common/component-fixtures/fixtures/MultiSelectAutocompleteFixture.tsx',
  ],
  wrapper: MultiSelectAutocompleteFixtureWrapper,
  states: [
    {
      id: 'empty',
      label: 'Empty',
      description: 'Empty autocomplete with placeholder text.',
      render: () => (
        <MultiSelectAutocomplete
          value={[]}
          options={autocompleteOptions}
          onChange={noop}
          placeholder="Compare plans"
          ariaLabel="Empty autocomplete"
        />
      ),
    },
    {
      id: 'selected-chips',
      label: 'Selected chips',
      description: 'Autocomplete with selected value chips.',
      render: () => (
        <MultiSelectAutocomplete
          value={[autocompleteOptions[0], autocompleteOptions[1]]}
          options={autocompleteOptions}
          onChange={noop}
          placeholder="Compare plans"
          ariaLabel="Selected chips autocomplete"
        />
      ),
    },
    {
      id: 'open-options',
      label: 'Open options',
      description: 'Open autocomplete list with matching options.',
      waitFor: 'text=Central plan',
      render: () => (
        <MultiSelectAutocomplete
          value={[]}
          options={autocompleteOptions}
          onChange={noop}
          placeholder="Compare plans"
          ariaLabel="Open options autocomplete"
          open
        />
      ),
    },
    {
      id: 'long-list-open',
      label: 'Long list open',
      description: 'Open listbox with enough options to require scrolling.',
      waitFor: 'text=Overflow plan 16',
      canvasSx: { minHeight: 420 },
      render: () => (
        <MultiSelectAutocomplete
          value={[]}
          options={longAutocompleteOptions}
          onChange={noop}
          placeholder="Compare plans"
          ariaLabel="Long autocomplete"
          defaultOpen
        />
      ),
    },
    {
      id: 'chip-delete',
      label: 'Chip delete',
      description: 'Selected chip with visible delete affordance.',
      render: () => (
        <MultiSelectAutocomplete
          value={[autocompleteOptions[1]]}
          options={autocompleteOptions}
          onChange={noop}
          placeholder="Compare plans"
          ariaLabel="Chip delete autocomplete"
        />
      ),
    },
    {
      id: 'no-results',
      label: 'No results',
      description: 'Open autocomplete list with no matching options.',
      waitFor: 'text=components.autocomplete.no_results',
      render: () => (
        <MultiSelectAutocomplete
          value={[]}
          options={autocompleteOptions}
          onChange={noop}
          placeholder="Compare plans"
          ariaLabel="No results autocomplete"
          open
          defaultInputValue="zzz"
        />
      ),
    },
  ],
}
