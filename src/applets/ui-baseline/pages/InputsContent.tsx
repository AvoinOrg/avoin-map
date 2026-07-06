'use client'

import React, { useState } from 'react'

import { Box } from '#/common/style/theme'
import EditableText from '#/components/common/EditableText'
import { NumberInputField } from '#/components/common/NumberInputField'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'

import { BaselineExample, BaselineSection, noop } from './BaselineContent'

const noopString = (_value: string) => {}

const StatefulTextFieldWithLabel = ({
  initialValue = '',
  ...props
}: Omit<
  React.ComponentProps<typeof TextFieldWithLabel>,
  'value' | 'onChange'
> & {
  initialValue?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <TextFieldWithLabel
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

const StatefulTextFieldWithHeader = ({
  initialValue = '',
  ...props
}: Omit<
  React.ComponentProps<typeof TextFieldWithHeader>,
  'value' | 'onChange'
> & {
  initialValue?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <TextFieldWithHeader {...props} value={value} onChange={setValue} />
  )
}

const StatefulEditableText = ({
  initialValue,
  valueAppendix,
}: {
  initialValue: string
  valueAppendix?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <EditableText
      value={value}
      valueAppendix={valueAppendix}
      onChange={(event) => setValue(event.target.value)}
      editButtonAriaLabel={`Edit ${initialValue}`}
      saveButtonAriaLabel={`Save ${initialValue}`}
      cancelButtonAriaLabel={`Cancel editing ${initialValue}`}
      textFieldAriaLabel={`Editing ${initialValue}`}
    />
  )
}

const StatefulNumberInputField = ({
  initialValue,
  ...props
}: Omit<
  React.ComponentProps<typeof NumberInputField>,
  'value' | 'onValueChange'
> & {
  initialValue: number | null
}) => {
  const [value, setValue] = useState<number | null>(initialValue)

  return (
    <NumberInputField
      {...props}
      value={value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === 'number' || nextValue === null) {
          setValue(nextValue)
        }
      }}
    />
  )
}

const InputsContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="TextFieldWithLabel">
      <BaselineExample title="Empty and placeholder">
        <StatefulTextFieldWithLabel
          label="Area name"
          ariaLabel="Empty area name"
          placeholder="Type a name"
        />
      </BaselineExample>
      <BaselineExample title="Populated and focused">
        <StatefulTextFieldWithLabel
          label="Focused area"
          ariaLabel="Focused area"
          initialValue="Central district"
          autoFocus
        />
      </BaselineExample>
      <BaselineExample title="Required error with helper">
        <StatefulTextFieldWithLabel
          label="Required field"
          ariaLabel="Required field"
          required
          error
          helperText="This value is required."
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <TextFieldWithLabel
          label="Disabled field"
          ariaLabel="Disabled field"
          value="Locked value"
          disabled
          onChange={noop}
        />
      </BaselineExample>
      <BaselineExample title="Multiline">
        <StatefulTextFieldWithLabel
          label="Description"
          ariaLabel="Multiline description"
          initialValue={'Line one\nLine two'}
          multiline
          rows={3}
          helperText="Multiline helper text."
        />
      </BaselineExample>
      <BaselineExample title="Trailing content">
        <StatefulTextFieldWithLabel
          label="Buffer"
          ariaLabel="Buffer with trailing unit"
          initialValue="250"
          inputMode="numeric"
          trailing="m"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="TextFieldWithHeader">
      <BaselineExample title="Empty placeholder">
        <StatefulTextFieldWithHeader
          headerText="Scenario name"
          placeholderText="Type scenario name"
        />
      </BaselineExample>
      <BaselineExample title="Populated">
        <StatefulTextFieldWithHeader
          headerText="Plan name"
          initialValue="Harbor plan"
          placeholderText="Type plan name"
        />
      </BaselineExample>
      <BaselineExample title="Required error with helper">
        <TextFieldWithHeader
          headerText="Required header"
          value=""
          onChange={noopString}
          placeholderText="Type a value"
          required
          error
          helperText="Header value is required."
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <TextFieldWithHeader
          headerText="Disabled header"
          value="Disabled value"
          onChange={noopString}
          placeholderText="Type a value"
          disabled
        />
      </BaselineExample>
      <BaselineExample title="Multiline">
        <StatefulTextFieldWithHeader
          headerText="Notes"
          initialValue={'First note\nSecond note'}
          placeholderText="Type notes"
          multiline
          rows={3}
          helperText="Header multiline helper text."
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="EditableText">
      <BaselineExample title="Display and edit action">
        <StatefulEditableText initialValue="Editable baseline title" />
      </BaselineExample>
      <BaselineExample title="Display with appendix">
        <StatefulEditableText initialValue="125" valueAppendix=" ha" />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="NumberInputField">
      <BaselineExample title="Empty">
        <NumberInputField label="Distance" />
      </BaselineExample>
      <BaselineExample title="Value and stepper">
        <StatefulNumberInputField
          label="Area"
          initialValue={24}
          min={0}
          max={100}
          step={1}
        />
      </BaselineExample>
      <BaselineExample title="Focused value">
        <StatefulNumberInputField
          label="Focused value"
          initialValue={12}
          inputSlotProps={{ autoFocus: true }}
        />
      </BaselineExample>
      <BaselineExample title="Required">
        <NumberInputField label="Required count" required />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <NumberInputField label="Disabled buffer" value={8} disabled />
      </BaselineExample>
      <BaselineExample title="Error helper">
        <StatefulNumberInputField
          label="Invalid value"
          initialValue={12}
          min={1}
          max={10}
          error
          helperText="Enter a value between 1 and 10."
        />
      </BaselineExample>
      <BaselineExample title="Min and max boundary">
        <StatefulNumberInputField
          label="Maximum"
          initialValue={10}
          min={0}
          max={10}
          step={1}
        />
      </BaselineExample>
      <BaselineExample title="Decimal step">
        <StatefulNumberInputField
          label="Decimal"
          initialValue={1.5}
          min={0}
          step={0.5}
          snapOnStep
          inputSlotProps={{ inputMode: 'decimal' }}
        />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

export default InputsContent
