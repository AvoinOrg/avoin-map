import React, { useState } from 'react'

import { Box } from '#/common/style/theme'
import EditableText from '#/components/common/EditableText'
import { NumberInputField } from '#/components/common/NumberInputField'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'
import TextFieldMultilineWithLabel from '#/components/common/TextFieldMultilineWithLabel'

import { BaselineExample, BaselineSection, noop } from '../BaselineContent'

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

const StatefulTextFieldMultilineWithLabel = ({
  initialValue = '',
  ...props
}: Omit<
  React.ComponentProps<typeof TextFieldMultilineWithLabel>,
  'value' | 'onChange'
> & {
  initialValue?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <TextFieldMultilineWithLabel
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
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

const GeometryReference = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: '15rem',
      borderLeft: '1px dashed #2C8E74',
      borderRight: '1px dashed #2C8E74',
    }}
  >
    {children}
  </Box>
)

const InputsContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Negative-margin input geometry">
      <BaselineExample title="Text input aligned edges">
        <GeometryReference>
          <StatefulTextFieldWithLabel
            label="Area name"
            ariaLabel="Negative margin text input"
            initialValue="Central district"
            applyNegativeMargins
          />
        </GeometryReference>
      </BaselineExample>
      <BaselineExample title="Text input caller override">
        <GeometryReference>
          <StatefulTextFieldWithLabel
            label="Area name"
            ariaLabel="Overridden negative margin text input"
            initialValue="Central district"
            applyNegativeMargins
            textFieldSx={{
              ml: '-0.25rem',
              mr: 0,
              width: 'calc(100% + 0.25rem)',
            }}
          />
        </GeometryReference>
      </BaselineExample>
      <BaselineExample title="Medium number spinner aligned edges">
        <GeometryReference>
          <StatefulNumberInputField
            initialValue={24}
            applyNegativeMargins
            formControlSx={{ width: '100%' }}
            inputSlotProps={{
              'aria-label': 'Medium negative margin number input',
            }}
          />
        </GeometryReference>
      </BaselineExample>
      <BaselineExample title="Small number spinner aligned edges">
        <GeometryReference>
          <StatefulNumberInputField
            initialValue={5}
            size="small"
            applyNegativeMargins
            formControlSx={{ width: '100%' }}
            inputSlotProps={{
              'aria-label': 'Small negative margin number input',
            }}
          />
        </GeometryReference>
      </BaselineExample>
    </BaselineSection>

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

    <BaselineSection title="TextFieldMultilineWithLabel">
      <BaselineExample title="Empty placeholder">
        <StatefulTextFieldMultilineWithLabel
          label="Scenario notes"
          ariaLabel="Scenario notes"
          placeholder="Type scenario notes"
          rows={3}
        />
      </BaselineExample>
      <BaselineExample title="Populated">
        <StatefulTextFieldMultilineWithLabel
          label="Plan notes"
          ariaLabel="Plan notes"
          initialValue={'Harbor plan\nFollow-up note'}
          placeholder="Type plan notes"
          rows={3}
        />
      </BaselineExample>
      <BaselineExample title="Required error with helper">
        <TextFieldMultilineWithLabel
          label="Required notes"
          ariaLabel="Required notes"
          value=""
          onChange={noop}
          placeholder="Type a value"
          required
          error
          helperText="Notes are required."
          rows={3}
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <TextFieldMultilineWithLabel
          label="Disabled notes"
          ariaLabel="Disabled notes"
          value="Disabled value"
          onChange={noop}
          placeholder="Type a value"
          disabled
          rows={3}
        />
      </BaselineExample>
      <BaselineExample title="Row sizing and helper">
        <StatefulTextFieldMultilineWithLabel
          label="Long description"
          ariaLabel="Long description"
          initialValue={'First note\nSecond note'}
          placeholder="Type notes"
          minRows={4}
          maxRows={8}
          helperText="Multiline helper text."
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
