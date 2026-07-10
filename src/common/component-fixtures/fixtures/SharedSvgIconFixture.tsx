import React from 'react'
import { Box } from '#/common/style/theme'
import type { AppSxProps } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import * as SharedIcons from '#/components/icons'
import {
  ArrowNextBig,
  AttributionInfo,
  CircleArrowRight,
  Cookie,
  MapPinGlobe,
  Pointer,
  RadioButtonChecked,
  RadioButtonUnchecked,
  Search,
  Sandwich,
  Terrain,
} from '#/components/icons'

type SharedIcon = React.ComponentType<{ sx?: AppSxProps }>

const sharedIcons = SharedIcons as Record<string, SharedIcon>
const allIconNames = Object.keys(sharedIcons).sort()

const iconCellSx: AppSxProps = {
  minWidth: 86,
  height: 56,
  display: 'grid',
  placeItems: 'center',
  gap: 0.5,
  px: 1,
  py: 0.75,
  border: '1px solid #d7ddd6',
  borderRadius: 1,
  backgroundColor: '#ffffff',
  color: '#1f2937',
}

const SharedSvgIconFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: '100%',
      display: 'grid',
      gap: 1.5,
      p: 1.5,
      backgroundColor: '#f5f7f5',
    }}
  >
    {children}
  </Box>
)

export const sharedSvgIconFixture: ComponentFixture = {
  id: 'shared-svg-icons',
  label: 'Shared SVG icons',
  description:
    'Shared icon suite coverage including size, color, and edge-case behavior.',
  sourceGlobs: [
    'src/components/icons/**/*.tsx',
    'src/components/icons/index.ts',
    'src/common/component-fixtures/fixtures/SharedSvgIconFixture.tsx',
  ],
  wrapper: SharedSvgIconFixtureWrapper,
  states: [
    {
      id: 'all-icons-default',
      label: 'All icons default',
      description:
        'Default render of every icon export from the shared icon index in a compact grid.',
      render: () => (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 1.25,
          }}
        >
          {allIconNames.map((name) => {
            const Icon = sharedIcons[name]

            return (
              <Box key={name} sx={iconCellSx}>
                <Icon sx={{ width: 20, height: 20 }} aria-hidden="true" />
                <Box sx={{ fontSize: '0.7rem', color: '#2f3f36' }}>{name}</Box>
              </Box>
            )
          })}
        </Box>
      ),
    },
    {
      id: 'color-and-size',
      label: 'Color and size',
      description: 'Explicit size overrides and currentColor propagation checks.',
      render: () => (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={iconCellSx}>
              <Search
                sx={{ width: 18, height: 18, color: '#2563eb' }}
                aria-hidden="true"
              />
              <Box sx={{ fontSize: '0.7rem' }}>Search 18 blue</Box>
            </Box>
            <Box sx={iconCellSx}>
              <Cookie
                sx={{ width: 30, height: 30, color: '#dc2626' }}
                aria-hidden="true"
              />
              <Box sx={{ fontSize: '0.7rem' }}>Cookie 30 red</Box>
            </Box>
            <Box sx={iconCellSx}>
              <CircleArrowRight sx={{ width: 26, height: 26, color: '#10b981' }} aria-hidden="true" />
              <Box sx={{ fontSize: '0.7rem' }}>Arrow 26 green</Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ ...iconCellSx, color: '#7c3aed' }}>
              <Sandwich sx={{ width: 24, height: 24 }} aria-hidden="true" />
              <Box sx={{ fontSize: '0.7rem' }}>Sandwich inherits</Box>
            </Box>
            <Box sx={{ ...iconCellSx, color: '#047857' }}>
              <Terrain sx={{ width: 24, height: 24 }} aria-hidden="true" />
              <Box sx={{ fontSize: '0.7rem' }}>Terrain inherits</Box>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: 'edge-cases',
      label: 'Edge cases',
      description:
        'Representatives without viewBox or with path/mask-heavy structures and unusual wrappers.',
      render: () => (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1.5,
          }}
        >
          <Box sx={iconCellSx}>
            <Cookie sx={{ width: 22, height: 22 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>Cookie</Box>
          </Box>
          <Box sx={{ ...iconCellSx, color: '#0ea5e9' }}>
            <AttributionInfo sx={{ width: 22, height: 22 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>AttributionInfo</Box>
          </Box>
          <Box sx={{ ...iconCellSx, color: '#0891b2' }}>
            <MapPinGlobe sx={{ width: 22, height: 22 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>MapPinGlobe</Box>
          </Box>
          <Box sx={iconCellSx}>
            <Pointer sx={{ width: 22, height: 22 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>Pointer</Box>
          </Box>
          <Box sx={iconCellSx}>
            <RadioButtonChecked sx={{ width: 22, height: 22 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>RadioButtonChecked</Box>
          </Box>
          <Box sx={iconCellSx}>
            <RadioButtonUnchecked sx={{ width: 22, height: 22 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>RadioButtonUnchecked</Box>
          </Box>
          <Box sx={iconCellSx}>
            <Sandwich sx={{ width: 24, height: 24 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>Sandwich</Box>
          </Box>
          <Box sx={iconCellSx}>
            <ArrowNextBig sx={{ width: 26, height: 26 }} aria-hidden="true" />
            <Box sx={{ fontSize: '0.7rem' }}>ArrowNextBig</Box>
          </Box>
        </Box>
      ),
    },
  ],
}
