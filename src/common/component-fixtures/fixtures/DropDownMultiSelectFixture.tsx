import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import DropDownMultiSelect, {
  type DropDownMultiSelectOption,
} from '#/components/common/DropDownMultiSelect'

const noop = () => {}

const multiSelectOptions: DropDownMultiSelectOption[] = [
  {
    value: 'heat',
    label: 'Heat demand',
    leading: (
      <Box
        component="span"
        sx={{
          width: '0.625rem',
          height: '0.625rem',
          borderRadius: '999px',
          backgroundColor: '#e05a47',
        }}
      />
    ),
  },
  {
    value: 'solar',
    label: 'Solar potential',
    leading: (
      <Box
        component="span"
        sx={{
          width: '0.625rem',
          height: '0.625rem',
          borderRadius: '999px',
          backgroundColor: '#f2c94c',
        }}
      />
    ),
    trailing: (
      <Box component="span" sx={{ fontSize: '0.625rem', color: '#5b5b5b' }}>
        12
      </Box>
    ),
  },
  {
    value: 'emissions',
    label: 'Emissions',
    leading: (
      <Box
        component="span"
        sx={{
          width: '0.625rem',
          height: '0.625rem',
          borderRadius: '999px',
          backgroundColor: '#2c8e74',
        }}
      />
    ),
  },
]

const DropDownMultiSelectFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
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

export const dropDownMultiSelectFixture: ComponentFixture = {
  id: 'drop-down-multi-select',
  label: 'DropDownMultiSelect',
  description: 'Shared multi-select dropdown states.',
  sourceGlobs: [
    'src/components/common/DropDownSelect.tsx',
    'src/components/common/DropDownMultiSelect.tsx',
    'src/components/icons/Checkbox.tsx',
    'src/components/icons/CheckboxChecked.tsx',
    'src/components/common/DropDownMultiSelect.test.tsx',
    'src/common/component-fixtures/fixtures/DropDownMultiSelectFixture.tsx',
  ],
  wrapper: DropDownMultiSelectFixtureWrapper,
  states: [
    {
      id: 'placeholder',
      label: 'Placeholder',
      description: 'Empty value rendering a muted placeholder.',
      render: () => (
        <DropDownMultiSelect
          value={[]}
          options={multiSelectOptions}
          onChange={noop}
          placeholder="Choose layers"
          ariaLabel="Multi-select placeholder"
        />
      ),
    },
    {
      id: 'open',
      label: 'Open',
      description: 'Open menu with unchecked and checked option indicators.',
      render: () => (
        <DropDownMultiSelect
          value={['heat']}
          options={multiSelectOptions}
          onChange={noop}
          defaultOpen
          ariaLabel="Open multi-select"
        />
      ),
    },
    {
      id: 'selected-one',
      label: 'Selected one',
      description: 'One selected value summarized in the trigger.',
      render: () => (
        <DropDownMultiSelect
          value={['heat']}
          options={multiSelectOptions}
          onChange={noop}
          ariaLabel="One selected multi-select"
        />
      ),
    },
    {
      id: 'selected-multiple',
      label: 'Selected multiple',
      description: 'Multiple selected values summarized in the trigger.',
      render: () => (
        <DropDownMultiSelect
          value={['heat', 'solar']}
          options={multiSelectOptions}
          onChange={noop}
          ariaLabel="Multiple selected multi-select"
        />
      ),
    },
    {
      id: 'custom-option-content',
      label: 'Custom option content',
      description: 'Open menu using a custom option renderer.',
      render: () => (
        <DropDownMultiSelect
          value={['solar']}
          options={multiSelectOptions}
          onChange={noop}
          defaultOpen
          ariaLabel="Custom option multi-select"
          renderOptionContent={(option, selected) => (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                fontSize: '0.75rem',
              }}
            >
              <Box component="span">{option.label}</Box>
              <Box
                component="span"
                sx={{
                  color: selected ? 'secondary.dark' : '#5b5b5b',
                  fontWeight: selected ? 700 : 400,
                }}
              >
                {selected ? 'selected' : 'available'}
              </Box>
            </Box>
          )}
        />
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled trigger with selected value.',
      render: () => (
        <DropDownMultiSelect
          value={['emissions']}
          options={multiSelectOptions}
          onChange={noop}
          disabled
          ariaLabel="Disabled multi-select"
        />
      ),
    },
  ],
}
