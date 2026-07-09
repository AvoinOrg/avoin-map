'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import ZoneClassChip from 'applets/carbon/pages/plans/plan/areas/_components/ZoneClassChip'
import {
  ZoneAreaListControls,
  type ZoneAreaListControlsProps,
} from 'applets/carbon/pages/plans/plan/areas/_components/ZoneAccordion'

const noopFilterChange: ZoneAreaListControlsProps['onFilterChange'] = () => {}
const noopSortChange: ZoneAreaListControlsProps['onSortChange'] = () => {}

const filterOptions: ZoneAreaListControlsProps['filterOptions'] = [
  {
    code: 'AK',
    color: '#C6E8FF',
    count: 2,
    label: 'Asuinkerrostalot',
    value: 'AK',
  },
  {
    code: 'VP',
    color: '#A7D98D',
    count: 4,
    label: 'Puisto',
    value: 'VP',
  },
  {
    code: 'K',
    color: '#F4C66A',
    count: 1,
    label: 'Liikerakennukset',
    value: 'K',
  },
  {
    code: '?',
    count: 1,
    label: 'Tuntematon',
    value: '__EMPTY_ZONE_FILTER_VALUE__',
  },
]

const sortOptions: ZoneAreaListControlsProps['sortOptions'] = [
  { value: 'class-asc', label: 'Luokka A-Z' },
  { value: 'class-desc', label: 'Luokka Z-A' },
  { value: 'name-asc', label: 'Nimi A-Z' },
  { value: 'name-desc', label: 'Nimi Z-A' },
]

const createControlsProps = (
  overrides: Partial<ZoneAreaListControlsProps> = {}
): ZoneAreaListControlsProps => ({
  countLabel: '8 aluetta nakyvissa',
  filterAllLabel: 'Kaikki',
  filterLabel: 'Suodata kaavamerkinnalla',
  filterOptions,
  onFilterChange: noopFilterChange,
  onSortChange: noopSortChange,
  selectedFilterValues: [],
  sortLabel: 'Jarjesta alueet',
  sortOptions,
  sortValue: 'name-asc',
  ...overrides,
})

const ZoneAreaControlsFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      maxWidth: '100%',
      minHeight: 300,
      p: 2,
      backgroundColor: '#F3F3F3',
    }}
  >
    {children}
  </Box>
)

export const hiilikarttaZoneAreaControlsFixture: ComponentFixture = {
  id: 'hiilikartta-zone-area-controls',
  label: 'Hiilikartta zone area controls',
  description:
    'Zone class chip and area filter/sort control states for the Hiilikartta areas route.',
  sourceGlobs: [
    'src/applets/carbon/pages/plans/plan/areas/_components/ZoneAccordion.tsx',
    'src/applets/carbon/pages/plans/plan/areas/_components/ZoneClassChip.tsx',
    'src/applets/carbon/pages/plans/plan/areas/_components/zoneAreaUtils.ts',
    'src/common/component-fixtures/fixtures/HiilikarttaZoneAreaControlsFixture.tsx',
  ],
  wrapper: ZoneAreaControlsFixtureWrapper,
  states: [
    {
      id: 'chip-variants',
      label: 'Chip variants',
      description:
        'Default, dark, custom color, lower-case, and unknown zone class chip states.',
      render: () => (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ZoneClassChip code="AK" />
          <ZoneClassChip code="ALL" dark />
          <ZoneClassChip code="VP" color="#A7D98D" />
          <ZoneClassChip code="all" uppercase={false} />
          <ZoneClassChip code="AK-1B" color="#F4C66A" />
          <ZoneClassChip code="?" />
        </Box>
      ),
    },
    {
      id: 'controls-empty',
      label: 'Controls empty',
      description: 'Closed filter and sort controls with no selected filters.',
      render: () => <ZoneAreaListControls {...createControlsProps()} />,
    },
    {
      id: 'filter-open',
      label: 'Filter open',
      description:
        'Open filter menu with leading zone chips and trailing option counts.',
      waitFor: 'role=option',
      render: () => (
        <ZoneAreaListControls
          {...createControlsProps({
            filterDefaultOpen: true,
            selectedFilterValues: ['AK'],
          })}
        />
      ),
    },
    {
      id: 'selected-one',
      label: 'Selected one',
      description: 'Closed filter control with one selected zone class chip.',
      render: () => (
        <ZoneAreaListControls
          {...createControlsProps({
            countLabel: '2 aluetta nakyvissa',
            selectedFilterValues: ['AK'],
          })}
        />
      ),
    },
    {
      id: 'selected-overflow',
      label: 'Selected overflow',
      description:
        'Closed filter control with two visible chips and an overflow count.',
      render: () => (
        <ZoneAreaListControls
          {...createControlsProps({
            countLabel: '8 aluetta nakyvissa',
            selectedFilterValues: [
              'AK',
              'VP',
              'K',
              '__EMPTY_ZONE_FILTER_VALUE__',
            ],
          })}
        />
      ),
    },
    {
      id: 'sort-open',
      label: 'Sort open',
      description: 'Open compact sort menu using the migrated style hooks.',
      waitFor: 'role=option',
      render: () => (
        <ZoneAreaListControls
          {...createControlsProps({
            sortDefaultOpen: true,
            sortValue: 'class-asc',
          })}
        />
      ),
    },
  ],
}
