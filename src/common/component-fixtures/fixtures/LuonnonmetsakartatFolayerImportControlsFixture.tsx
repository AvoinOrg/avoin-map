'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import FolayerImportActionsRow from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportActionsRow'
import FolayerImportCodeRecordSelect from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportCodeRecordSelect'

const noop = () => {}

const fixtureColumns = [
  'id',
  'nimi',
  'kunta',
  'maakunta',
  'kuvaus',
  'pinta_ala',
]

const ImportControlsFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      maxWidth: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    {children}
  </Box>
)

const InteractiveCodeRecordSelect = ({
  columns = fixtureColumns,
  initialColumn,
  allowEmpty = false,
  label,
}: {
  columns?: string[]
  initialColumn?: string
  allowEmpty?: boolean
  label: string
}) => {
  const [selectedColumn, setSelectedColumn] = React.useState(initialColumn)

  return (
    <FolayerImportCodeRecordSelect
      columns={columns}
      selectedColumn={selectedColumn}
      onColumnChange={setSelectedColumn}
      allowEmpty={allowEmpty}
      label={label}
    />
  )
}

export const luonnonmetsakartatFolayerImportControlsFixture: ComponentFixture = {
  id: 'luonnonmetsakartat-folayer-import-controls',
  label: 'Luonnonmetsakartat folayer import controls',
  locale: 'fi',
  description:
    'Natural forest admin import action and code-record selector states for F047 remigration coverage.',
  sourceGlobs: [
    'src/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportActionsRow.tsx',
    'src/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportCodeRecordSelect.tsx',
    'src/common/component-fixtures/fixtures/LuonnonmetsakartatFolayerImportControlsFixture.tsx',
  ],
  wrapper: ImportControlsFixtureWrapper,
  states: [
    {
      id: 'accept-enabled',
      label: 'Accept enabled',
      description: 'Accept imported forest-layer action when form state is valid.',
      render: () => (
        <FolayerImportActionsRow
          onClickAccept={noop}
          isAcceptDisabled={false}
        />
      ),
    },
    {
      id: 'accept-disabled',
      label: 'Accept disabled',
      description: 'Disabled accept action before the import can be created.',
      render: () => (
        <FolayerImportActionsRow
          onClickAccept={noop}
          isAcceptDisabled
        />
      ),
    },
    {
      id: 'code-record-empty',
      label: 'Code selector empty',
      description: 'Selector helper returns no control when no columns are loaded.',
      render: () => (
        <InteractiveCodeRecordSelect
          columns={[]}
          label="Tunnistesarake"
        />
      ),
    },
    {
      id: 'code-record-selected',
      label: 'Code selector selected',
      description: 'Code-record selector after a matching shapefile column is selected.',
      render: () => (
        <InteractiveCodeRecordSelect
          initialColumn="nimi"
          label="Nimisarake"
        />
      ),
    },
    {
      id: 'code-record-allow-empty',
      label: 'Optional code selector',
      description: 'Optional code-record selector with the empty value allowed.',
      render: () => (
        <InteractiveCodeRecordSelect
          allowEmpty
          label="Kuvaussarake"
        />
      ),
    },
  ],
}
