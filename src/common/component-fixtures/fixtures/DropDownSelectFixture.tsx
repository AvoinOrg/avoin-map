import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import DropDownSelect from '#/components/common/DropDownSelect'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'

const noop = () => {}

const selectOptions = [
  { value: 'heat', label: 'Heat demand' },
  { value: 'solar', label: 'Solar potential' },
  { value: 'emissions', label: 'Emissions' },
]

const longSelectOptions = Array.from({ length: 16 }, (_, index) => ({
  value: `overflow-option-${index + 1}`,
  label: `Overflow option ${String(index + 1).padStart(2, '0')}`,
}))

const FocusedDropDownSelect = () => (
  <DropDownSelect
    value="heat"
    options={selectOptions}
    onChange={noop}
    ariaLabel="Focused select"
    autoFocus
  />
)

const InteractiveDropDownSelect = ({
  initialValue = '',
  placeholder,
  ariaLabel,
}: {
  initialValue?: string
  placeholder?: React.ReactNode
  ariaLabel: string
}) => {
  const [value, setValue] = React.useState(initialValue)

  return (
    <DropDownSelect
      value={value}
      options={selectOptions}
      onChange={(event) => {
        setValue(event.target.value)
      }}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
    />
  )
}

const SelectFixtureWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 380,
      minHeight: 240,
      p: 2,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    }}
  >
    {children}
  </Box>
)

const GeometryReference = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 240,
      borderLeft: '1px dashed #2C8E74',
      borderRight: '1px dashed #2C8E74',
    }}
  >
    {children}
  </Box>
)

export const dropDownSelectFixture: ComponentFixture = {
  id: 'drop-down-select',
  label: 'DropDownSelect',
  description: 'Shared single-select dropdown states.',
  sourceGlobs: [
    'src/components/common/DropDownSelect.tsx',
    'src/components/common/DropDownSelectWithLabel.tsx',
    'src/components/common/DropDownSelectWithLabel.test.tsx',
    'src/components/common/DropDownSelectInset.tsx',
    'src/components/common/DropDownSelectMinimal.tsx',
    'src/components/common/DropDownSelectInset.test.tsx',
    'src/common/component-fixtures/fixtures/DropDownSelectFixture.tsx',
  ],
  wrapper: SelectFixtureWrapper,
  states: [
    {
      id: 'placeholder',
      label: 'Placeholder',
      description: 'Empty value rendering a muted placeholder.',
      render: () => (
        <InteractiveDropDownSelect
          placeholder="Choose layer"
          ariaLabel="Select placeholder"
        />
      ),
    },
    {
      id: 'empty-selection',
      label: 'Empty selection',
      description: 'Open menu with the empty selection entry.',
      waitFor: 'role=option',
      render: () => (
        <DropDownSelect
          value=""
          options={selectOptions}
          onChange={noop}
          allowEmpty
          defaultOpen
          ariaLabel="Empty select"
        />
      ),
    },
    {
      id: 'invalid-value',
      label: 'Invalid value',
      description: 'Open menu with the invalid incoming value entry.',
      waitFor: 'role=option',
      render: () => (
        <DropDownSelect
          value="legacy"
          options={selectOptions}
          onChange={noop}
          defaultOpen
          ariaLabel="Invalid select"
        />
      ),
    },
    {
      id: 'selected',
      label: 'Selected',
      description:
        'Closed stateful select with a valid selected value for keyboard checks.',
      render: () => (
        <InteractiveDropDownSelect
          initialValue="heat"
          ariaLabel="Selected select"
        />
      ),
    },
    {
      id: 'negative-margins',
      label: 'Negative margins',
      description:
        'Opt-in pill overflow with selected text and arrow aligned to reference edges.',
      render: () => (
        <GeometryReference>
          <DropDownSelect
            value="heat"
            options={selectOptions}
            onChange={noop}
            ariaLabel="Negative margin select"
            applyNegativeMargins
          />
        </GeometryReference>
      ),
    },
    {
      id: 'negative-margins-override',
      label: 'Negative margin override',
      description: 'Caller trigger margins and width override opt-in defaults.',
      render: () => (
        <GeometryReference>
          <DropDownSelect
            value="solar"
            options={selectOptions}
            onChange={noop}
            ariaLabel="Overridden negative margin select"
            applyNegativeMargins
            selectSx={{
              ml: '-0.25rem',
              mr: '-0.5rem',
              width: 'calc(100% + 0.75rem)',
            }}
          />
        </GeometryReference>
      ),
    },
    {
      id: 'open',
      label: 'Open',
      description: 'Open menu below the trigger.',
      waitFor: 'role=option',
      render: () => (
        <DropDownSelect
          value="heat"
          options={selectOptions}
          onChange={noop}
          defaultOpen
          ariaLabel="Open select"
        />
      ),
    },
    {
      id: 'long-list-open',
      label: 'Long list open',
      description: 'Open menu with enough options to require scrolling.',
      waitFor: 'text=Overflow option 16',
      canvasSx: { minHeight: 420 },
      render: () => (
        <DropDownSelect
          value="overflow-option-1"
          options={longSelectOptions}
          onChange={noop}
          defaultOpen
          ariaLabel="Long select"
        />
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled select with a selected value.',
      render: () => (
        <DropDownSelect
          value="emissions"
          options={selectOptions}
          onChange={noop}
          disabled
          ariaLabel="Disabled select"
        />
      ),
    },
    {
      id: 'focused',
      label: 'Focused',
      description: 'Focused trigger state.',
      render: () => <FocusedDropDownSelect />,
    },
    {
      id: 'success-indicator',
      label: 'Success indicator',
      description: 'Valid selection with outside success indicator.',
      render: () => (
        <DropDownSelect
          value="solar"
          options={selectOptions}
          onChange={noop}
          successIndicatorMode="outside"
          ariaLabel="Success select"
        />
      ),
    },
    {
      id: 'header-label-action',
      label: 'Labeled select action',
      description: 'Labeled wrapper with label and action content.',
      render: () => (
        <DropDownSelectWithLabel
          value="heat"
          options={selectOptions}
          onChange={noop}
          label="Energy layer"
          labelAction={
            <Box
              component="span"
              aria-label="Header action marker"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '999px',
                backgroundColor: 'secondary.dark',
              }}
            />
          }
        />
      ),
    },
    {
      id: 'with-label-negative-margins',
      label: 'Labeled negative margins',
      description: 'Labeled wrapper forwards opt-in pill geometry once.',
      render: () => (
        <GeometryReference>
          <DropDownSelectWithLabel
            value="heat"
            options={selectOptions}
            onChange={noop}
            label="Energy layer"
            applyNegativeMargins
          />
        </GeometryReference>
      ),
    },
    {
      id: 'inset-label',
      label: 'Inset label',
      description: 'Inset wrapper with select before the side label.',
      render: () => (
        <DropDownSelectInset
          value="solar"
          options={selectOptions}
          onChange={noop}
          label="Solar suitability"
          ariaLabel="Inset select"
        />
      ),
    },
    {
      id: 'inset-negative-margins',
      label: 'Inset negative margins',
      description: 'Inset wrapper forwards compact opt-in pill geometry once.',
      render: () => (
        <GeometryReference>
          <DropDownSelectInset
            value="solar"
            options={selectOptions}
            onChange={noop}
            label="Solar suitability"
            ariaLabel="Negative margin inset select"
            applyNegativeMargins
          />
        </GeometryReference>
      ),
    },
    {
      id: 'inset-long-label',
      label: 'Inset long label',
      description:
        'Long side label wraps while independently sized wrapper and trigger stay visible.',
      canvasSx: { minWidth: 320 },
      render: () => (
        <DropDownSelectInset
          value="solar"
          options={selectOptions}
          onChange={noop}
          label="Solar suitability for buildings with a deliberately long wrapping label"
          ariaLabel="Long inset select"
          selectWrapperSx={{ width: '8rem' }}
          selectSx={{ height: '1.75rem', backgroundColor: '#F4F7FF' }}
        />
      ),
    },
    {
      id: 'inset-open',
      label: 'Inset open',
      description:
        'Inset dropdown with its popup open for arrow and option spacing checks.',
      waitFor: 'role=option',
      canvasSx: { minWidth: 320 },
      render: () => (
        <DropDownSelectInset
          value="heat"
          options={selectOptions}
          onChange={noop}
          label="Long inset label remains wrapped while the popup is open"
          ariaLabel="Open inset select"
          defaultOpen
        />
      ),
    },
    {
      id: 'minimal-selected',
      label: 'Minimal selected',
      description: 'Compact minimal variant with selected value.',
      render: () => (
        <DropDownSelectMinimal
          value="emissions"
          options={selectOptions}
          onChange={noop}
          ariaLabel="Minimal select"
        />
      ),
    },
    {
      id: 'minimal-negative-margins',
      label: 'Minimal negative margins',
      description:
        'Right-icon minimal pill applies opt-in geometry at its root.',
      render: () => (
        <GeometryReference>
          <DropDownSelectMinimal
            value="emissions"
            options={selectOptions}
            onChange={noop}
            ariaLabel="Negative margin minimal select"
            applyNegativeMargins
          />
        </GeometryReference>
      ),
    },
    {
      id: 'minimal-left-icon-preserved',
      label: 'Minimal left icon preserved',
      description:
        'Left-icon minimal arrangement ignores the right-icon negative-margin mode.',
      render: () => (
        <GeometryReference>
          <DropDownSelectMinimal
            value="emissions"
            options={selectOptions}
            onChange={noop}
            ariaLabel="Left icon minimal select"
            isIconOnTheRight={false}
            applyNegativeMargins
          />
        </GeometryReference>
      ),
    },
    {
      id: 'minimal-open',
      label: 'Minimal open',
      description: 'Compact minimal variant with the menu open.',
      waitFor: 'role=option',
      render: () => (
        <DropDownSelectMinimal
          value="emissions"
          options={selectOptions}
          onChange={noop}
          defaultOpen
          ariaLabel="Minimal open select"
        />
      ),
    },
  ],
}
