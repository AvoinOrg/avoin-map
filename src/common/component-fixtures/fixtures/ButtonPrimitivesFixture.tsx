'use client'

import React from 'react'

import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Button, IconButton } from '#/components/common/Button'
import { CircleArrowRight, EyeOpen, InfoCircle } from '#/components/icons'

const noop = () => {}

const fixtureIconSx = {
  width: 18,
  height: 18,
}

const ButtonFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      minWidth: 280,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
)

const FocusVisibleButton = () => {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    ref.current?.focus()
  }, [])

  return (
    <Button
      ref={ref}
      data-focus-visible="true"
      variant="outlined"
      onClick={noop}
    >
      Keyboard focus
    </Button>
  )
}

export const buttonPrimitivesFixture: ComponentFixture = {
  id: 'button-primitives',
  label: 'Button primitives',
  description: 'Shared Base UI backed button primitive states.',
  sourceGlobs: [
    'src/components/common/Button.tsx',
    'src/components/common/Button.test.tsx',
    'src/common/component-fixtures/fixtures/ButtonPrimitivesFixture.tsx',
  ],
  wrapper: ButtonFixtureWrapper,
  states: [
    {
      id: 'button-default',
      label: 'Button default',
      description: 'Default contained button with decorative icon slots.',
      render: () => (
        <Button
          variant="contained"
          startIcon={<InfoCircle aria-hidden="true" sx={fixtureIconSx} />}
          endIcon={<CircleArrowRight aria-hidden="true" sx={fixtureIconSx} />}
          onClick={noop}
        >
          Inspect layer
        </Button>
      ),
    },
    {
      id: 'button-disabled',
      label: 'Button disabled',
      description: 'Disabled native button state.',
      render: () => (
        <Button disabled variant="contained" onClick={noop}>
          Disabled action
        </Button>
      ),
    },
    {
      id: 'button-focus-visible',
      label: 'Button focus visible',
      description: 'Keyboard focus-visible styling hook.',
      render: () => <FocusVisibleButton />,
    },
    {
      id: 'button-pressed',
      label: 'Button pressed',
      description: 'Pressed and active styling hooks supplied by ARIA/data.',
      render: () => (
        <Button
          aria-pressed="true"
          data-active="true"
          variant="outlined"
          onClick={noop}
        >
          Selected
        </Button>
      ),
    },
    {
      id: 'button-anchor',
      label: 'Button anchor',
      description: 'Anchor render preserving link semantics.',
      render: () => (
        <Button component="a" href="#button-anchor-fixture" variant="text">
          Open details
        </Button>
      ),
    },
    {
      id: 'icon-only',
      label: 'Icon only',
      description: 'Icon-only button with caller supplied accessible name.',
      render: () => (
        <IconButton aria-label="Show layer" onClick={noop}>
          <EyeOpen aria-hidden="true" sx={{ width: 22, height: 22 }} />
        </IconButton>
      ),
    },
  ],
}
