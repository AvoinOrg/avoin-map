'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import PlanImportActionsRow from 'applets/hiilikartta/pages/kaavat/plan/_components/PlanImportActionsRow'
import PlanImportCodeRecordSelect from 'applets/hiilikartta/pages/kaavat/plan/_components/PlanImportCodeRecordSelect'

const noop = () => {}

const fixtureColumns = [
  'kaavamerkinta',
  'alueen_nimi',
  'pinta_ala_ha',
  'kayttotarkoitus',
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
  initialColumn,
  allowEmpty = false,
  label,
  placeholder,
}: {
  initialColumn?: string
  allowEmpty?: boolean
  label: string
  placeholder: string
}) => {
  const [selectedColumn, setSelectedColumn] = React.useState(initialColumn)

  return (
    <PlanImportCodeRecordSelect
      columns={fixtureColumns}
      selectedColumn={selectedColumn}
      onColumnChange={setSelectedColumn}
      allowEmpty={allowEmpty}
      label={label}
      placeholder={placeholder}
    />
  )
}

export const hiilikarttaPlanImportControlsFixture: ComponentFixture = {
  id: 'hiilikartta-plan-import-controls',
  label: 'Hiilikartta plan import controls',
  description:
    'Plan detail import action and code-record selector states for the Hiilikartta authoring flow.',
  sourceGlobs: [
    'src/applets/hiilikartta/pages/kaavat/plan/_components/PlanImportActionsRow.tsx',
    'src/applets/hiilikartta/pages/kaavat/plan/_components/PlanImportCodeRecordSelect.tsx',
    'src/common/component-fixtures/fixtures/HiilikarttaPlanImportControlsFixture.tsx',
  ],
  wrapper: ImportControlsFixtureWrapper,
  states: [
    {
      id: 'accept-enabled',
      label: 'Accept enabled',
      description: 'Accept imported plan action when a pending import exists.',
      render: () => (
        <PlanImportActionsRow
          onClickAccept={noop}
          isAcceptDisabled={false}
        />
      ),
    },
    {
      id: 'accept-disabled',
      label: 'Accept disabled',
      description: 'Disabled accept action before the import can be applied.',
      render: () => (
        <PlanImportActionsRow
          onClickAccept={noop}
          isAcceptDisabled
        />
      ),
    },
    {
      id: 'code-record-placeholder',
      label: 'Code selector placeholder',
      description: 'Required zoning-code selector with columns and no selection.',
      render: () => (
        <InteractiveCodeRecordSelect
          label="Kaavamerkinnät"
          placeholder="Valitse sarake"
        />
      ),
    },
    {
      id: 'code-record-selected',
      label: 'Code selector selected',
      description: 'Required zoning-code selector after a valid column is selected.',
      render: () => (
        <InteractiveCodeRecordSelect
          initialColumn="kaavamerkinta"
          label="Kaavamerkinnät"
          placeholder="Valitse sarake"
        />
      ),
    },
    {
      id: 'code-record-allow-empty',
      label: 'Optional name selector',
      description: 'Optional area-name selector with the empty value allowed.',
      render: () => (
        <InteractiveCodeRecordSelect
          allowEmpty
          label="Alueiden nimet"
          placeholder="Ei nimisaraketta"
        />
      ),
    },
  ],
}
