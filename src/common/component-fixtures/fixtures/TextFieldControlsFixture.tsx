'use client'

import React, { useState } from 'react'
import { Box } from '#/common/style/theme'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'
import type { ComponentFixture } from '#/common/component-fixtures/types'

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

const DebouncedHeaderPreview = () => {
  const [value, setValue] = useState('')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextFieldWithHeader
        headerText="Debounced area"
        value={value}
        onChange={setValue}
        debounceTimeout={700}
        placeholderText="Type to debounce"
        helperText="Parent callback is debounced"
      />
      <Box sx={{ fontSize: '0.75rem', color: 'neutral.dark' }}>
        Committed value: {value}
      </Box>
    </Box>
  )
}

export const textFieldWithLabelFixture: ComponentFixture = {
  id: 'text-field-with-label',
  label: 'TextFieldWithLabel',
  description: 'Shared labeled single-line and multiline text field states.',
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
      id: 'multiline',
      label: 'Multiline',
      description: 'Textarea mode with row count and multiline content.',
      render: () => (
        <TextFieldWithLabel
          label="Description"
          ariaLabel="TextField multiline"
          value="Line one\nLine two"
          multiline
          rows={3}
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
          trailing={<Box sx={{ color: 'neutral.dark', fontSize: '0.625rem' }}>OK</Box>}
          onChange={() => {}}
        />
      ),
    },
  ],
}

export const textFieldWithHeaderFixture: ComponentFixture = {
  id: 'text-field-with-header',
  label: 'TextFieldWithHeader',
  description: 'Shared debounced header field states.',
  sourceGlobs: [
    'src/components/common/TextFieldWithHeader.tsx',
    'src/components/common/TextFieldWithHeader.test.tsx',
    'src/common/component-fixtures/fixtures/TextFieldControlsFixture.tsx',
  ],
  wrapper: TextFieldFixtureWrapper,
  states: [
    {
      id: 'empty',
      label: 'Empty',
      description: 'Empty value with default header spacing.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value=""
          onChange={() => {}}
          placeholderText="Type a name"
        />
      ),
    },
    {
      id: 'placeholder',
      label: 'Placeholder',
      description: 'Shows only placeholder content.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value=""
          onChange={() => {}}
          placeholderText="Type a name"
        />
      ),
    },
    {
      id: 'value',
      label: 'Value',
      description: 'Populated field with header label.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value="Rantala"
          onChange={() => {}}
          placeholderText="Type a name"
        />
      ),
    },
    {
      id: 'focused',
      label: 'Focused',
      description: 'Text area is focused by default.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value=""
          onChange={() => {}}
          placeholderText="Type a name"
          autoFocus
        />
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled field and muted content style.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value="Disabled"
          onChange={() => {}}
          placeholderText="Type a name"
          disabled
        />
      ),
    },
    {
      id: 'error-helper',
      label: 'Error with helper text',
      description: 'Error state and helper content.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value=""
          onChange={() => {}}
          placeholderText="Type a name"
          error
          helperText="Area name required"
        />
      ),
    },
    {
      id: 'required',
      label: 'Required',
      description: 'Required marker is shown near header text.',
      render: () => (
        <TextFieldWithHeader
          headerText="Area name"
          value=""
          onChange={() => {}}
          placeholderText="Type a name"
          required
        />
      ),
    },
    {
      id: 'multiline',
      label: 'Multiline',
      description: 'Textarea mode with explicit row count.',
      render: () => (
        <TextFieldWithHeader
          headerText="Description"
          value=""
          onChange={() => {}}
          placeholderText="Add description"
          multiline
          rows={15}
        />
      ),
    },
    {
      id: 'debounced',
      label: 'Debounced',
      description: 'State for local debounced update visualization.',
      render: () => <DebouncedHeaderPreview />,
    },
  ],
}
