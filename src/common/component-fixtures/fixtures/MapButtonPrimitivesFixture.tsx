import React from 'react'

import { Box } from '#/common/style/theme/system'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Button } from '#/components/common/Button'
import { Slot, SlotsProvider } from '#/components/context/slotsContext'
import { InfoCircle, Layers, Line, Tune } from '#/components/icons'
import { MapButton } from '#/components/Map/MapButton'
import { MapButtonMenu } from '#/components/Map/MapButtonMenu'
import { MapButtonStickyMenu } from '#/components/Map/MapButtonStickyMenu'

const noop = () => {}
const stickyMenuSlotName = 'map-sticky-menu-toggle'

const drawControlIconSx = {
  display: 'inline-block',
  flexShrink: 0,
  maxWidth: '1.5rem',
  maxHeight: '1.5rem',
} as const

const MenuContent = ({ closeMenu }: { closeMenu?: () => void }) => (
  <Box
    sx={{
      minWidth: 160,
      display: 'grid',
      gap: 0.75,
      color: '#111111',
      fontSize: '0.75rem',
      lineHeight: 1.4,
    }}
  >
    <Box sx={{ fontWeight: 700 }}>Layer options</Box>
    <Box>Background map</Box>
    <Box>Transparent overlay</Box>
    <Button
      type="button"
      onClick={closeMenu}
      variant="outlined"
      size="small"
      sx={{
        justifySelf: 'start',
        mt: 0.25,
        backgroundColor: '#ffffff',
      }}
    >
      Close
    </Button>
  </Box>
)

const StickyMenuContent = () => (
  <Box
    sx={{
      width: 168,
      display: 'grid',
      gap: 0.75,
      color: '#111111',
      fontSize: '0.75rem',
      lineHeight: 1.4,
    }}
  >
    <Box>Corridor width</Box>
    <Box
      sx={{
        width: '6rem',
        px: 1,
        py: 0.375,
        borderRadius: '999px',
        backgroundColor: '#ffffff',
        boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
        textAlign: 'center',
        letterSpacing: '0.04em',
      }}
    >
      8.5 m
    </Box>
  </Box>
)

const MapFixtureSurface = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      minWidth: 320,
      minHeight: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      background:
        'linear-gradient(90deg, rgba(220, 226, 220, 0.9) 1px, transparent 1px), linear-gradient(rgba(220, 226, 220, 0.9) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      backgroundColor: '#eef2ed',
      color: '#111111',
    }}
  >
    {children}
  </Box>
)

const StickyMenuFixture = ({ isVertical }: { isVertical: boolean }) => (
  <SlotsProvider>
    <Box
      sx={{
        minWidth: 320,
        minHeight: 220,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <MapButtonStickyMenu
        isVertical={isVertical}
        isActive
        defaultOpen
        menuTitle="Corridor"
        showTooltip="Show corridor menu"
        menuContent={<StickyMenuContent />}
      >
        <MapButton
          onClick={noop}
          size="small"
          tooltip="Draw corridor"
          isVertical={isVertical}
        >
          <Line aria-hidden="true" sx={drawControlIconSx} />
        </MapButton>
      </MapButtonStickyMenu>
      <Box
        sx={{
          width: 56,
          minHeight: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Slot name={stickyMenuSlotName} />
      </Box>
    </Box>
  </SlotsProvider>
)

export const mapButtonPrimitivesFixture: ComponentFixture = {
  id: 'map-button-primitives',
  label: 'Map button primitives',
  description:
    'Reusable map button, menu, and sticky menu primitive states.',
  sourceGlobs: [
    'src/components/Map/MapButton.tsx',
    'src/components/Map/MapButtonMenu.tsx',
    'src/components/Map/MapButtonStickyMenu.tsx',
    'src/components/Map/CorridorBufferMenu.tsx',
    'src/components/icons/Line.tsx',
    'src/components/icons/Tune.tsx',
    'src/common/component-fixtures/fixtures/MapButtonPrimitivesFixture.tsx',
  ],
  wrapper: MapFixtureSurface,
  states: [
    {
      id: 'default-horizontal',
      label: 'Default horizontal',
      description: 'Default map button with horizontal tooltip placement.',
      render: () => (
        <MapButton
          onClick={noop}
          size="small"
          tooltip="Show layers"
          isVertical={false}
        >
          <Layers aria-hidden="true" />
        </MapButton>
      ),
    },
    {
      id: 'default-vertical',
      label: 'Default vertical',
      description: 'Default map button with vertical tooltip placement.',
      render: () => (
        <MapButton
          onClick={noop}
          size="small"
          tooltip="Show details"
          isVertical
        >
          <InfoCircle aria-hidden="true" />
        </MapButton>
      ),
    },
    {
      id: 'active',
      label: 'Active',
      description: 'Active styling hook supplied through caller sx.',
      render: () => (
        <MapButton
          onClick={noop}
          size="small"
          tooltip="Selected map mode"
          aria-pressed="true"
          sx={{
            backgroundColor: 'primary.light',
            opacity: 1,
            '&:hover': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tune aria-hidden="true" />
        </MapButton>
      ),
    },
    {
      id: 'disabled',
      label: 'Disabled',
      description: 'Disabled button styling with tooltip wrapper present.',
      render: () => (
        <MapButton
          disabled
          onClick={noop}
          size="small"
          tooltip="Unavailable"
        >
          <Layers aria-hidden="true" />
        </MapButton>
      ),
    },
    {
      id: 'tooltip-visible',
      label: 'Tooltip visible',
      description: 'Forced-open tooltip for deterministic visual capture.',
      waitFor: '[data-slot="map-button-tooltip"]',
      render: () => (
        <MapButton
          onClick={noop}
          size="small"
          tooltip="Tooltip text"
          tooltipOpen
        >
          <InfoCircle aria-hidden="true" />
        </MapButton>
      ),
    },
    {
      id: 'menu-open',
      label: 'Menu open',
      description: 'Default-open floating menu anchored to a map button.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => (
        <MapButtonMenu
          isVertical={false}
          defaultOpen
          menuContent={({ closeMenu }) => <MenuContent closeMenu={closeMenu} />}
        >
          <MapButton onClick={noop} size="small" tooltip="Open menu">
            <Layers aria-hidden="true" />
          </MapButton>
        </MapButtonMenu>
      ),
    },
    {
      id: 'sticky-menu-open',
      label: 'Sticky menu open',
      description:
        'Active sticky menu with toggle rendered through the map sticky slot.',
      waitFor: '[data-slot="map-button-sticky-menu-close"]',
      render: () => <StickyMenuFixture isVertical={false} />,
    },
    {
      id: 'horizontal',
      label: 'Horizontal',
      description: 'Horizontal menu placement below the map button.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => (
        <MapButtonMenu
          isVertical={false}
          defaultOpen
          menuContent={<MenuContent />}
        >
          <MapButton onClick={noop} size="small" tooltip="Horizontal menu">
            <Layers aria-hidden="true" />
          </MapButton>
        </MapButtonMenu>
      ),
    },
    {
      id: 'vertical',
      label: 'Vertical',
      description: 'Vertical menu placement to the left of the map button.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => (
        <MapButtonMenu isVertical defaultOpen menuContent={<MenuContent />}>
          <MapButton
            onClick={noop}
            size="small"
            tooltip="Vertical menu"
            isVertical
          >
            <Layers aria-hidden="true" />
          </MapButton>
        </MapButtonMenu>
      ),
    },
  ],
}
