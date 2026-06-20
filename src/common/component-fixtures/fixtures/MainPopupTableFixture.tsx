'use client'

import React from 'react'

import { Box } from '#/common/style/theme/system'
import {
  PopupTable,
  PopupTableBody,
  PopupTableCell,
  PopupTableRow,
} from '#/components/Map/layers/main/common/PopupTable'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const PopupTableFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      p: 2,
      backgroundColor: '#ffffff',
      border: '1px solid #d7ddd6',
      borderRadius: 1,
    }}
  >
    {children}
  </Box>
)

const FixtureRows = () => (
  <PopupTable>
    <PopupTableBody>
      <PopupTableRow>
        <PopupTableCell component="th" scope="row">
          Building ID
        </PopupTableCell>
        <PopupTableCell>123456789A</PopupTableCell>
      </PopupTableRow>
      <PopupTableRow>
        <PopupTableCell component="th" scope="row">
          Estimated volume
        </PopupTableCell>
        <PopupTableCell>
          1 240 m<sup>3</sup> per floor
        </PopupTableCell>
      </PopupTableRow>
    </PopupTableBody>
  </PopupTable>
)

export const mainPopupTableFixture: ComponentFixture = {
  id: 'main-popup-table',
  label: 'Main popup table',
  description: 'Native table wrappers used by main map layer popups.',
  sourceGlobs: [
    'src/components/Map/layers/main/common/PopupTable.tsx',
    'src/common/component-fixtures/fixtures/MainPopupTableFixture.tsx',
  ],
  wrapper: PopupTableFixtureWrapper,
  states: [
    {
      id: 'light',
      label: 'Light',
      description: 'Default popup table on a light modal background.',
      render: () => <FixtureRows />,
    },
    {
      id: 'dark-inherited',
      label: 'Dark inherited',
      description: 'Popup table inheriting dark modal colors and borders.',
      wrapper: ({ children }) => (
        <Box
          sx={{
            width: 420,
            p: 2,
            backgroundColor: '#3E3E3E',
            color: '#A9E7CB',
            borderRadius: 1,
          }}
        >
          {children}
        </Box>
      ),
      render: () => (
        <PopupTable>
          <PopupTableBody
            sx={{
              'th, td': {
                borderColor: 'rgba(169, 231, 203, 0.2)',
              },
            }}
          >
            <PopupTableRow>
              <PopupTableCell component="th" scope="row" sx={{ pl: 0 }}>
                Estimated yearly heating related CO2-emissions [tCO2/a]
              </PopupTableCell>
              <PopupTableCell sx={{ fontWeight: 700 }}>18</PopupTableCell>
            </PopupTableRow>
            <PopupTableRow>
              <PopupTableCell component="th" scope="row" sx={{ pl: 0 }}>
                Price of district heating & electricity [€/MWh, snt/kWh]
              </PopupTableCell>
              <PopupTableCell sx={{ fontWeight: 700 }}>81 & 10</PopupTableCell>
            </PopupTableRow>
          </PopupTableBody>
        </PopupTable>
      ),
    },
  ],
}
