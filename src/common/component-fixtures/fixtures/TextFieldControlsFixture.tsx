import React from 'react'

import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'
import TextFieldMultilineWithLabel from '#/components/common/TextFieldMultilineWithLabel'

const TextFieldFixtureWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 420,
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    {children}
  </Box>
)

export const textFieldWithLabelFixture: ComponentFixture = {
  id: 'text-field-with-label',
  label: 'TextFieldWithLabel',
  description: 'Shared labeled single-line text field states.',
  sourceGlobs: [
    'src/components/common/TextFieldWithLabel.tsx',
    'src/components/common/TextFieldWithLabel.test.tsx',
    'src/common/component-fixtures/fixtures/TextFieldControlsFixture.tsx',
  ],
  wrapper: TextFieldFixtureWrapper,
  states: [
    {
      id: 'empty',
      label: 'Empty',
      description: 'Empty value with label and helper area hidden.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField empty"
          value=""
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'placeholder',
      label: 'Placeholder',
      description: 'Empty field with placeholder text.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField placeholder"
          placeholder="Type a name"
          value=""
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'value',
      label: 'Value',
      description: 'Populated text value.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField value"
          value="Current value"
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'focused',
      label: 'Focused',
      description: 'Single-line control with deterministic focus.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField focused"
          value=""
          onChange={() => {}}
          autoFocus
        />
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled state with visible inactive styling.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField disabled"
          value="Read only"
          disabled
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'error-helper',
      label: 'Error with helper text',
      description: 'Error state with helper text and required marker.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField error"
          value=""
          required
          error
          helperText="Required field"
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'required',
      label: 'Required',
      description: 'Required label marker.',
      render: () => (
        <TextFieldWithLabel
          label="Required field"
          ariaLabel="TextField required"
          value=""
          required
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'trailing',
      label: 'Trailing',
      description: 'Trailing slot with custom content.',
      render: () => (
        <TextFieldWithLabel
          label="Label"
          ariaLabel="TextField trailing"
          value=""
          trailing={
            <Box sx={{ color: 'neutral.dark', fontSize: '0.625rem' }}>OK</Box>
          }
          onChange={() => {}}
        />
      ),
    },
  ],
}

export const textFieldMultilineWithLabelFixture: ComponentFixture = {
  id: 'text-field-multiline-with-label',
  label: 'TextFieldMultilineWithLabel',
  description: 'Shared labeled multiline text field states.',
  sourceGlobs: [
    'src/components/common/TextFieldWithLabel.tsx',
    'src/components/common/TextFieldMultilineWithLabel.tsx',
    'src/components/common/TextFieldMultilineWithLabel.test.tsx',
    'src/common/component-fixtures/fixtures/TextFieldControlsFixture.tsx',
  ],
  wrapper: TextFieldFixtureWrapper,
  states: [
    {
      id: 'empty',
      label: 'Empty',
      description: 'Empty textarea with label and default sizing.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Description"
          ariaLabel="Multiline empty"
          value=""
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'placeholder',
      label: 'Placeholder',
      description: 'Empty textarea with placeholder text.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Description"
          ariaLabel="Multiline placeholder"
          placeholder="Type a description"
          value=""
          rows={3}
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'value',
      label: 'Value',
      description: 'Textarea with multiple lines of content.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Description"
          ariaLabel="Multiline value"
          value={'Line one\nLine two'}
          rows={3}
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'focused',
      label: 'Focused',
      description: 'Textarea control with deterministic focus.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Description"
          ariaLabel="Multiline focused"
          value=""
          rows={3}
          autoFocus
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled textarea with visible inactive styling.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Description"
          ariaLabel="Multiline disabled"
          value="Read only"
          disabled
          rows={3}
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'error-helper',
      label: 'Error with helper text',
      description: 'Textarea error state with helper text and required marker.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Description"
          ariaLabel="Multiline error"
          value=""
          required
          error
          helperText="Required description"
          rows={3}
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'required',
      label: 'Required',
      description: 'Required label marker on a textarea.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Required description"
          ariaLabel="Multiline required"
          value=""
          required
          rows={3}
          onChange={() => {}}
        />
      ),
    },
    {
      id: 'row-sizing',
      label: 'Row sizing',
      description: 'Textarea with min and max row sizing.',
      render: () => (
        <TextFieldMultilineWithLabel
          label="Long description"
          ariaLabel="Multiline row sizing"
          value={'First note\nSecond note'}
          minRows={4}
          maxRows={8}
          helperText="Uses the same border curve as TextFieldWithLabel."
          onChange={() => {}}
        />
      ),
    },
  ],
}
