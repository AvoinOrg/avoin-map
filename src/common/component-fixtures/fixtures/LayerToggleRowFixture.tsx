'use client'

import React from 'react'
import { Box, Stack, Typography } from '@mui/material'

import {
  LayerToggleRow,
  LayerToggleRowAccordion,
} from '#/components/common/LayerToggleRow'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const noop = () => {}

const LayerRowFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 280,
      p: 2,
      backgroundColor: '#ffffff',
      border: '1px solid #d7ddd6',
      borderRadius: 1,
    }}
  >
    {children}
  </Box>
)

export const layerToggleRowFixture: ComponentFixture = {
  id: 'layer-toggle-row',
  label: 'LayerToggleRow',
  description: 'Representative layer visibility toggle row states.',
  sourceGlobs: [
    'src/components/common/LayerToggleRow.tsx',
    'src/components/common/LayerToggleRow.test.tsx',
  ],
  wrapper: LayerRowFixtureWrapper,
  states: [
    {
      id: 'hidden',
      label: 'Hidden',
      description: 'Default hidden layer status.',
      render: () => (
        <LayerToggleRow
          label="Zoning plans"
          status="hidden"
          ariaLabel="Toggle zoning plans fixture"
          onToggle={noop}
        />
      ),
    },
    {
      id: 'visible',
      label: 'Visible',
      description: 'Visible layer status with the default icon.',
      render: () => (
        <LayerToggleRow
          label="Zoning plans"
          status="visible"
          ariaLabel="Toggle zoning plans fixture"
          onToggle={noop}
        />
      ),
    },
    {
      id: 'visible-colored',
      label: 'Visible colored',
      description: 'Visible layer status with a configured layer color.',
      render: () => (
        <LayerToggleRow
          label="Protected forests"
          status="visible"
          color="#2f855a"
          ariaLabel="Toggle protected forests fixture"
          onToggle={noop}
        />
      ),
    },
    {
      id: 'processing',
      label: 'Processing',
      description:
        'Loading state while a layer visibility change is processing.',
      render: () => (
        <LayerToggleRow
          label="Building heat demand"
          status="processing"
          ariaLabel="Toggle building heat demand fixture"
          onToggle={noop}
        />
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled row that should not toggle.',
      render: () => (
        <LayerToggleRow
          label="Private datasets"
          status="hidden"
          disabled
          ariaLabel="Toggle private datasets fixture"
          onToggle={noop}
        />
      ),
    },
    {
      id: 'accordion-open',
      label: 'Accordion open',
      description: 'Expanded accordion variant with visible child content.',
      canvasSx: {
        minWidth: 360,
      },
      render: () => (
        <LayerToggleRowAccordion
          label="Forest layers"
          status="visible"
          expanded
          ariaLabel="Toggle forest layers fixture"
          onToggle={noop}
          contentSx={{ pt: 1.25 }}
        >
          <Stack spacing={0.75}>
            <Typography
              sx={{
                fontSize: '0.75rem',
                lineHeight: 1.4,
                color: '#323b31',
              }}
            >
              Natural forests
            </Typography>
            <Typography
              sx={{
                fontSize: '0.75rem',
                lineHeight: 1.4,
                color: '#323b31',
              }}
            >
              Protected areas
            </Typography>
          </Stack>
        </LayerToggleRowAccordion>
      ),
    },
  ],
}
