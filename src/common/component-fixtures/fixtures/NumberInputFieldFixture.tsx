import React from 'react'

import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import { NumberInputField } from '#/components/common/NumberInputField'

const noop = () => {}

const NumberInputFieldFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      minWidth: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
)

const GeometryReference = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: '9rem',
      borderLeft: '1px dashed #2C8E74',
      borderRight: '1px dashed #2C8E74',
    }}
  >
    {children}
  </Box>
)

const FocusedNumberInputField = () => {
  return (
    <NumberInputField
      label="Focused value"
      value={12}
      locale="en-US"
      onValueChange={noop}
      inputSlotProps={{
        autoFocus: true,
        'aria-label': 'Focused value',
      }}
    />
  )
}

export const numberInputFieldFixture: ComponentFixture = {
  id: 'number-input-field',
  label: 'NumberInputField',
  description: 'Shared Base UI number input states.',
  sourceGlobs: [
    'src/components/common/NumberInputField.tsx',
    'src/components/common/NumberInputField.test.tsx',
    'src/common/component-fixtures/fixtures/NumberInputFieldFixture.tsx',
  ],
  wrapper: NumberInputFieldFixtureWrapper,
  states: [
    {
      id: 'empty',
      label: 'Empty',
      description: 'Empty field with a visible label.',
      render: () => (
        <NumberInputField
          label="Distance"
          locale="en-US"
          inputSlotProps={{ 'aria-label': 'Distance' }}
        />
      ),
    },
    {
      id: 'value',
      label: 'Value',
      description: 'Populated field with default medium sizing.',
      render: () => (
        <NumberInputField
          label="Area"
          value={24}
          locale="en-US"
          onValueChange={noop}
          inputSlotProps={{ 'aria-label': 'Area' }}
        />
      ),
    },
    {
      id: 'negative-margins-medium',
      label: 'Medium negative margins',
      description:
        'Medium pill overflows while text and spinner glyph align to reference edges.',
      render: () => (
        <GeometryReference>
          <NumberInputField
            value={24}
            locale="en-US"
            onValueChange={noop}
            applyNegativeMargins
            formControlSx={{ width: '100%' }}
            inputSlotProps={{ 'aria-label': 'Medium negative margin number' }}
          />
        </GeometryReference>
      ),
    },
    {
      id: 'negative-margins-small',
      label: 'Small negative margins',
      description:
        'Small pill uses its size-specific spinner edge for opt-in overflow.',
      render: () => (
        <GeometryReference>
          <NumberInputField
            size="small"
            value={5}
            locale="en-US"
            onValueChange={noop}
            applyNegativeMargins
            formControlSx={{ width: '100%' }}
            inputSlotProps={{ 'aria-label': 'Small negative margin number' }}
          />
        </GeometryReference>
      ),
    },
    {
      id: 'negative-margins-override',
      label: 'Negative margin override',
      description: 'Caller pill margins and width override opt-in defaults.',
      render: () => (
        <GeometryReference>
          <NumberInputField
            value={12}
            locale="en-US"
            onValueChange={noop}
            applyNegativeMargins
            formControlSx={{ width: '100%' }}
            inputSx={{ ml: '-0.25rem', mr: 0, width: '100%' }}
            inputSlotProps={{
              'aria-label': 'Overridden negative margin number',
            }}
          />
        </GeometryReference>
      ),
    },
    {
      id: 'focused',
      label: 'Focused',
      description: 'Focused field using the native input focus state.',
      render: () => <FocusedNumberInputField />,
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled field with value and stepper controls disabled.',
      render: () => (
        <NumberInputField
          disabled
          label="Disabled buffer"
          value={8}
          locale="en-US"
          onValueChange={noop}
          inputSlotProps={{ 'aria-label': 'Disabled buffer' }}
        />
      ),
    },
    {
      id: 'required',
      label: 'Required',
      description: 'Required state with label indication.',
      render: () => (
        <NumberInputField
          required
          label="Required count"
          locale="en-US"
          inputSlotProps={{ 'aria-label': 'Required count' }}
        />
      ),
    },
    {
      id: 'error-helper',
      label: 'Error helper',
      description: 'Error state with helper text.',
      render: () => (
        <NumberInputField
          error
          helperText="Enter a value between 1 and 10."
          label="Invalid value"
          value={12}
          locale="en-US"
          onValueChange={noop}
          inputSlotProps={{ 'aria-label': 'Invalid value' }}
        />
      ),
    },
    {
      id: 'min-max',
      label: 'Min and max',
      description: 'Value at max to show disabled increment control.',
      render: () => (
        <NumberInputField
          label="Maximum"
          value={10}
          min={0}
          max={10}
          locale="en-US"
          onValueChange={noop}
          inputSlotProps={{ 'aria-label': 'Maximum' }}
        />
      ),
    },
    {
      id: 'decimal-step',
      label: 'Decimal step',
      description: 'Decimal value with decimal step formatting.',
      render: () => (
        <NumberInputField
          label="Decimal"
          value={1.5}
          min={0}
          step={0.5}
          snapOnStep
          locale="en-US"
          onValueChange={noop}
          inputSlotProps={{
            inputMode: 'decimal',
            'aria-label': 'Decimal',
          }}
        />
      ),
    },
    {
      id: 'increment-decrement',
      label: 'Increment and decrement',
      description:
        'Medium and small stepper glyph alignment inside unchanged controls.',
      render: () => (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <NumberInputField
            label="Medium stepper"
            value={5}
            min={0}
            max={10}
            step={1}
            locale="en-US"
            onValueChange={noop}
            containerSx={{ width: '8rem' }}
            formControlSx={{ width: '8rem' }}
            inputSx={{ width: '8rem' }}
            inputSlotProps={{ 'aria-label': 'Medium stepper' }}
          />
          <NumberInputField
            size="small"
            label="Small stepper"
            value={5}
            min={0}
            max={10}
            step={1}
            locale="en-US"
            onValueChange={noop}
            containerSx={{ width: '7rem' }}
            formControlSx={{ width: '7rem' }}
            inputSx={{ width: '7rem' }}
            inputSlotProps={{ 'aria-label': 'Small stepper' }}
          />
        </Box>
      ),
    },
    {
      id: 'small',
      label: 'Small',
      description: 'Small size field matching compact map/sidebar call sites.',
      render: () => (
        <NumberInputField
          size="small"
          label="Small field"
          value={2.5}
          step={0.5}
          locale="en-US"
          onValueChange={noop}
          containerSx={{ width: '6rem' }}
          inputRowSx={{ width: '6rem' }}
          formControlSx={{ width: '6rem' }}
          inputSx={{
            width: '6rem',
            '& [data-slot="number-input-input"]': {
              px: '0.625rem',
              textAlign: 'center',
            },
          }}
          inputSlotProps={{
            inputMode: 'decimal',
            'aria-label': 'Small field',
          }}
        />
      ),
    },
  ],
}
