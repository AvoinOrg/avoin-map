'use client'

import React from 'react'

import { Box } from '#/common/style/theme'
import { mainRouteTree } from '#/common/routing/routes/main'
import LayerLegend from '#/components/common/LayerLegend'
import LayerMenuAccordion from '#/components/common/LayerMenuAccordion'
import { Legend } from '#/components/common/Legend'
import { LegendBox } from '#/components/common/LegendBox'
import {
  LayerToggleRow,
  LayerToggleRowAccordion,
  LayerToggleRowLink,
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
    'src/components/common/LayerMenuAccordion.tsx',
    'src/components/common/LayerMenuAccordion.test.tsx',
    'src/components/common/Legend.tsx',
    'src/components/common/LegendBox.tsx',
    'src/components/common/LayerLegend.tsx',
    'src/common/component-fixtures/fixtures/LayerToggleRowFixture.tsx',
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
          iconSx={{
            '& svg': { visibility: 'hidden' },
            '&::before': {
              content: '""',
              width: '0.25rem',
              height: '0.25rem',
              borderRadius: '50%',
              backgroundColor: '#111111',
              boxShadow: '0.375rem 0 #111111, 0.75rem 0 #111111',
            },
          }}
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
      id: 'accordion-closed',
      label: 'Accordion closed',
      description: 'Closed accordion variant with unmounted child content.',
      canvasSx: {
        minWidth: 360,
      },
      render: () => (
        <LayerToggleRowAccordion
          label="Forest layers"
          status="hidden"
          expanded={false}
          ariaLabel="Toggle forest layers fixture"
          onToggle={noop}
          contentSx={{ pt: 1.25 }}
        >
          <LayerRowList>
            <LayerRowText>Natural forests</LayerRowText>
            <LayerRowText>Protected areas</LayerRowText>
          </LayerRowList>
        </LayerToggleRowAccordion>
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
          <LayerRowList>
            <LayerRowText>Natural forests</LayerRowText>
            <LayerRowText>Protected areas</LayerRowText>
          </LayerRowList>
        </LayerToggleRowAccordion>
      ),
    },
    {
      id: 'row-link',
      label: 'Row link',
      description: 'Layer row with an isolated details link action.',
      render: () => (
        <LayerToggleRowLink
          label="Forest overview"
          status="visible"
          ariaLabel="Toggle forest overview fixture"
          onToggle={noop}
          linkAriaLabel="Open forest overview fixture"
          linkProps={{
            route: mainRouteTree.forests,
            routeTree: mainRouteTree,
            onClick: (event) => event.preventDefault(),
          }}
        />
      ),
    },
    {
      id: 'layer-menu-accordion-closed',
      label: 'Layer menu accordion closed',
      description: 'Closed shared layer menu accordion segment.',
      canvasSx: {
        minWidth: 360,
      },
      render: () => (
        <LayerMenuAccordion
          id="fixture-layer-menu-closed"
          title="Building layers"
          ariaLabel="Toggle building layers fixture"
        >
          <LayerRowText>Building heat demand</LayerRowText>
        </LayerMenuAccordion>
      ),
    },
    {
      id: 'layer-menu-accordion-open',
      label: 'Layer menu accordion open',
      description: 'Open shared layer menu accordion segment.',
      canvasSx: {
        minWidth: 360,
      },
      render: () => (
        <LayerMenuAccordion
          id="fixture-layer-menu-open"
          title="Building layers"
          ariaLabel="Toggle building layers fixture"
          defaultExpanded
        >
          <Box sx={{ py: 1 }}>
            <LayerToggleRow
              label="Building heat demand"
              status="visible"
              ariaLabel="Toggle building heat demand nested fixture"
              onToggle={noop}
            />
          </Box>
        </LayerMenuAccordion>
      ),
    },
    {
      id: 'legend-basic',
      label: 'Legend basic',
      description: 'Simple legend container with color swatches.',
      render: () => (
        <Legend>
          <LegendBox color="rgba(73, 25, 232, 0.65)" title="Mature forest" />
          <LegendBox color="rgba(206, 244, 66, 0.35)" title="Other forest" />
        </Legend>
      ),
    },
    {
      id: 'layer-legend',
      label: 'Layer legend',
      description: 'Layer legend item rows with literal and translated labels.',
      render: () => (
        <LayerLegend
          items={[
            { color: '#2f855a', label: 'Positive carbon change' },
            {
              color: '#d53f8c',
              labelTranslationKey: 'sidebar.legend.title',
              translationNs: 'avoin-map',
            },
          ]}
        />
      ),
    },
  ],
}

const LayerRowList = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
    {children}
  </Box>
)

const LayerRowText = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="p"
    sx={{
      m: 0,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      color: '#323b31',
    }}
  >
    {children}
  </Box>
)
