'use client'

import React, { useEffect, useState } from 'react'

import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'

const noop = () => {}

const ColorPickerFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      minHeight: 280,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      pt: 1,
    }}
  >
    {children}
  </Box>
)

const ChangedDraftColorPicker = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    let frameId = 0

    const run = () => {
      frameId = window.requestAnimationFrame(() => {
        const hueSlider = document.querySelector<HTMLElement>(
          '[aria-label="Hue"]'
        )

        hueSlider?.focus()
        hueSlider?.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'ArrowRight',
            keyCode: 39,
            which: 39,
          })
        )

        if (!cancelled) {
          setReady(true)
        }
      })
    }

    run()

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frameId)
    }
  }, [])

  return (
    <Box>
      {ready && <Box data-testid="color-picker-draft-ready" />}
      <ColorPickerWithPopover
        color="#2374ab"
        onChange={noop}
        ariaLabel="Changed draft color picker fixture"
        labelText="Draft color"
        popoverProps={{ rootProps: { defaultOpen: true } }}
      />
    </Box>
  )
}

export const colorPickerWithPopoverFixture: ComponentFixture = {
  id: 'color-picker-with-popover',
  label: 'ColorPickerWithPopover',
  description: 'Shared color picker trigger and popover states.',
  sourceGlobs: [
    'src/components/common/ColorPickerWithPopover.tsx',
    'src/components/common/ColorPickerWithPopover.test.tsx',
    'src/common/component-fixtures/fixtures/ColorPickerWithPopoverFixture.tsx',
  ],
  wrapper: ColorPickerFixtureWrapper,
  states: [
    {
      id: 'closed-swatch',
      label: 'Closed swatch',
      description: 'Closed trigger with the default swatch only.',
      render: () => (
        <ColorPickerWithPopover
          color="#2374ab"
          onChange={noop}
          ariaLabel="Closed color picker fixture"
        />
      ),
    },
    {
      id: 'closed-with-label',
      label: 'Closed with label',
      description: 'Closed trigger with visible label text beside the swatch.',
      render: () => (
        <ColorPickerWithPopover
          color="#b64f2a"
          onChange={noop}
          ariaLabel="Labeled color picker fixture"
          labelText="Layer color"
        />
      ),
    },
    {
      id: 'open-picker',
      label: 'Open picker',
      description: 'Open popover with the real react-colorful picker.',
      waitFor: '.react-colorful',
      render: () => (
        <ColorPickerWithPopover
          color="#2374ab"
          onChange={noop}
          ariaLabel="Open color picker fixture"
          labelText="Layer color"
          popoverProps={{ rootProps: { defaultOpen: true } }}
        />
      ),
    },
    {
      id: 'changed-draft',
      label: 'Changed draft',
      description:
        'Open picker after a deterministic keyboard draft adjustment before close.',
      waitFor: '[data-testid="color-picker-draft-ready"]',
      render: () => <ChangedDraftColorPicker />,
    },
    {
      id: 'committed-color',
      label: 'Committed color',
      description: 'Closed trigger showing a changed committed color.',
      render: () => (
        <ColorPickerWithPopover
          color="#008866"
          onChange={noop}
          ariaLabel="Committed color picker fixture"
          labelText="Committed color"
        />
      ),
    },
    {
      id: 'custom-swatch',
      label: 'Custom swatch',
      description: 'Closed trigger with custom swatch and label styling hooks.',
      render: () => (
        <ColorPickerWithPopover
          color="#5d3fd3"
          onChange={noop}
          ariaLabel="Custom color picker fixture"
          labelText="Custom swatch"
          colorBoxSx={{
            width: 32,
            height: 20,
            borderColor: '#5d3fd3',
            borderRadius: '6px',
          }}
          labelSx={{
            color: '#274032',
            fontWeight: 700,
          }}
        />
      ),
    },
  ],
}
