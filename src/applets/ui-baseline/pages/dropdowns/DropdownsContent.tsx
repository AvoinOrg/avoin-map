'use client'

import React, { useState } from 'react'

import { Box } from '#/common/style/theme'
import type { SelectOption } from '#/common/types/general'
import DropDownMultiSelect, {
  type DropDownMultiSelectOption,
} from '#/components/common/DropDownMultiSelect'
import DropDownSelect from '#/components/common/DropDownSelect'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import MultiSelectAutocomplete from '#/components/common/MultiSelectAutocomplete'

import { BaselineExample, BaselineSection, noop } from '../BaselineContent'

const selectOptions: SelectOption[] = [
  { value: 'heat-demand', label: 'Heat demand' },
  { value: 'solar-potential', label: 'Solar potential' },
  { value: 'emissions', label: 'Emissions' },
]

const multiSelectOptions: DropDownMultiSelectOption[] = [
  { value: 'heat-demand', label: 'Heat demand' },
  { value: 'solar-potential', label: 'Solar potential' },
  { value: 'emissions', label: 'Emissions' },
]

const autocompleteOptions: SelectOption[] = [
  { value: 'central-plan', label: 'Central plan' },
  { value: 'harbor-plan', label: 'Harbor plan' },
  { value: 'forest-edge', label: 'Forest edge' },
]

const StatefulDropDownSelect = ({
  initialValue = '',
  placeholder,
  ariaLabel,
  label,
  allowEmpty = false,
  autoFocus = false,
  successIndicatorMode,
  open,
}: {
  initialValue?: string
  placeholder?: React.ReactNode
  ariaLabel: string
  label?: string
  allowEmpty?: boolean
  autoFocus?: boolean
  successIndicatorMode?: React.ComponentProps<
    typeof DropDownSelect
  >['successIndicatorMode']
  open?: boolean
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownSelect
      value={value}
      options={selectOptions}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      label={label}
      allowEmpty={allowEmpty}
      autoFocus={autoFocus}
      successIndicatorMode={successIndicatorMode}
      open={open}
    />
  )
}

const StatefulDropDownSelectWithLabel = ({
  initialValue,
  label,
  placeholder,
}: {
  initialValue: string
  label: string
  placeholder?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownSelectWithLabel
      value={value}
      options={selectOptions}
      onChange={(event) => setValue(event.target.value)}
      label={label}
      placeholder={placeholder}
    />
  )
}

const StatefulDropDownSelectInset = ({
  initialValue,
  label,
  ariaLabel,
}: {
  initialValue: string
  label: string
  ariaLabel: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownSelectInset
      value={value}
      options={selectOptions}
      onChange={(event) => setValue(event.target.value)}
      label={label}
      ariaLabel={ariaLabel}
    />
  )
}

const StatefulDropDownSelectMinimal = ({
  initialValue,
  ariaLabel,
}: {
  initialValue: string
  ariaLabel: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownSelectMinimal
      value={value}
      options={selectOptions}
      onChange={(event) => setValue(event.target.value)}
      ariaLabel={ariaLabel}
    />
  )
}

const StatefulDropDownMultiSelect = ({
  initialValue,
  placeholder,
  ariaLabel,
}: {
  initialValue: string[]
  placeholder?: React.ReactNode
  ariaLabel: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownMultiSelect
      value={value}
      options={multiSelectOptions}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
    />
  )
}

const StatefulMultiSelectAutocomplete = ({
  initialValue = [],
  ariaLabel,
  placeholder,
  open,
  defaultInputValue,
  disabled = false,
}: {
  initialValue?: SelectOption[]
  ariaLabel: string
  placeholder: string
  open?: boolean
  defaultInputValue?: string
  disabled?: boolean
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <MultiSelectAutocomplete
      value={value}
      options={autocompleteOptions}
      onChange={(_event, nextValue) => setValue(nextValue)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      open={open}
      defaultInputValue={defaultInputValue}
      disabled={disabled}
    />
  )
}

const DropdownsContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Open and empty-result states">
      <BaselineExample
        title="DropDownSelect empty selection menu"
        minHeight="13rem"
      >
        <StatefulDropDownSelect
          initialValue=""
          allowEmpty
          open
          placeholder="Choose layer"
          ariaLabel="Empty selection select"
        />
      </BaselineExample>
      <BaselineExample
        title="MultiSelectAutocomplete no results"
        minHeight="10rem"
      >
        <StatefulMultiSelectAutocomplete
          placeholder="Compare plans"
          ariaLabel="No results autocomplete"
          open
          defaultInputValue="zzz"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="DropDownSelect">
      <BaselineExample title="Placeholder">
        <StatefulDropDownSelect
          placeholder="Choose layer"
          ariaLabel="Placeholder select"
        />
      </BaselineExample>
      <BaselineExample title="Focused selected value">
        <StatefulDropDownSelect
          initialValue="heat-demand"
          ariaLabel="Focused select"
          autoFocus
        />
      </BaselineExample>
      <BaselineExample title="Selected value">
        <StatefulDropDownSelect
          initialValue="heat-demand"
          ariaLabel="Selected select"
        />
      </BaselineExample>
      <BaselineExample title="Floating label and success indicator">
        <StatefulDropDownSelect
          initialValue="solar-potential"
          label="Energy layer"
          ariaLabel="Labeled select"
          successIndicatorMode="outside"
        />
      </BaselineExample>
      <BaselineExample title="Invalid incoming value">
        <StatefulDropDownSelect
          initialValue="legacy-layer"
          ariaLabel="Invalid incoming value select"
        />
      </BaselineExample>
      <BaselineExample title="Disabled selected value">
        <DropDownSelect
          value="emissions"
          options={selectOptions}
          onChange={noop}
          disabled
          ariaLabel="Disabled select"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="Labeled select variants">
      <BaselineExample title="Labeled scenario select">
        <StatefulDropDownSelectWithLabel
          initialValue="heat-demand"
          label="Scenario"
          placeholder="Choose scenario"
        />
      </BaselineExample>
      <BaselineExample title="Labeled plan layer select">
        <StatefulDropDownSelectWithLabel
          initialValue="solar-potential"
          label="Plan layer"
          placeholder="Choose plan layer"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectInset">
        <StatefulDropDownSelectInset
          initialValue="emissions"
          label="Inset label"
          ariaLabel="Inset select"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectMinimal selected">
        <StatefulDropDownSelectMinimal
          initialValue="heat-demand"
          ariaLabel="Minimal selected select"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectMinimal compact">
        <StatefulDropDownSelectMinimal
          initialValue="emissions"
          ariaLabel="Minimal compact select"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="DropDownMultiSelect">
      <BaselineExample title="Placeholder">
        <StatefulDropDownMultiSelect
          initialValue={[]}
          placeholder="Choose layers"
          ariaLabel="Multi-select placeholder"
        />
      </BaselineExample>
      <BaselineExample title="One selected">
        <StatefulDropDownMultiSelect
          initialValue={['heat-demand']}
          ariaLabel="One selected multi-select"
        />
      </BaselineExample>
      <BaselineExample title="Multiple selected">
        <StatefulDropDownMultiSelect
          initialValue={['heat-demand', 'solar-potential']}
          ariaLabel="Multiple selected multi-select"
        />
      </BaselineExample>
      <BaselineExample title="Interactive checked and unchecked values">
        <StatefulDropDownMultiSelect
          initialValue={['heat-demand']}
          ariaLabel="Interactive multi-select"
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <DropDownMultiSelect
          value={['emissions']}
          options={multiSelectOptions}
          onChange={noop}
          disabled
          ariaLabel="Disabled multi-select"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="MultiSelectAutocomplete">
      <BaselineExample title="Empty placeholder">
        <StatefulMultiSelectAutocomplete
          placeholder="Compare plans"
          ariaLabel="Empty autocomplete"
        />
      </BaselineExample>
      <BaselineExample title="Selected chips">
        <StatefulMultiSelectAutocomplete
          initialValue={[autocompleteOptions[0], autocompleteOptions[1]]}
          placeholder="Compare plans"
          ariaLabel="Selected chips autocomplete"
        />
      </BaselineExample>
      <BaselineExample title="Options autocomplete">
        <StatefulMultiSelectAutocomplete
          placeholder="Compare plans"
          ariaLabel="Options autocomplete"
        />
      </BaselineExample>
      <BaselineExample title="Disabled selected chips">
        <StatefulMultiSelectAutocomplete
          initialValue={[autocompleteOptions[2]]}
          placeholder="Compare plans"
          ariaLabel="Disabled autocomplete"
          disabled
        />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

export default DropdownsContent
