'use client'

import React from 'react'

import { StaticAuthSessionProvider } from '#/common/auth/sessionContext'
import type { AuthSession } from '#/common/auth/types'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import PlanFolder from 'applets/hiilikartta/components/PlanFolder'
import PlanFolderLoading from 'applets/hiilikartta/components/PlanFolderLoading'
import PlanListItem from 'applets/hiilikartta/components/PlanListItem'
import PlanListItemLoading from 'applets/hiilikartta/components/PlanListItemLoading'
import PlanOutlineIcon from 'applets/hiilikartta/components/PlanOutlineIcon'
import SelectionMenu from 'applets/hiilikartta/components/SelectionMenu'
import {
  CalculationState,
  type PlaceholderPlanConf,
  type PlanConf,
} from 'applets/hiilikartta/common/types'

const authenticatedSession: AuthSession = {
  session: {
    id: 'fixture-session',
    userId: 'fixture-user',
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  },
  user: {
    id: 'fixture-user',
    name: 'Fixture User',
    email: 'fixture@example.test',
    image: null,
  },
  accessToken: 'fixture-access-token',
  accessTokenExpiresAt: new Date('2099-01-01T00:00:00.000Z'),
}

const fixturePlanFeature: PlanConf['data']['features'][number] = {
  id: 'fixture-feature',
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [24.93, 60.17],
        [24.94, 60.17],
        [24.94, 60.18],
        [24.93, 60.18],
        [24.93, 60.17],
      ],
    ],
  },
  properties: {
    id: 'fixture-feature',
    name: 'Fixture zoning area',
    area_ha: 3.4,
    zoning_code: 'AK',
  },
}

const createFixturePlan = (
  overrides: Partial<PlanConf> = {}
): PlanConf => ({
  id: 'fixture-plan',
  serverId: 'fixture-server-plan',
  created: 1704067200000,
  name: 'Keskustan viherkorttelin asemakaava',
  areaHa: 3.4,
  data: {
    type: 'FeatureCollection',
    features: [fixturePlanFeature],
  },
  calculationState: CalculationState.NOT_STARTED,
  reportData: undefined,
  localLastEdited: 1704067200000,
  state: undefined,
  userId: 'fixture-user',
  isHidden: false,
  ...overrides,
})

const loadingPlan: PlaceholderPlanConf = {
  id: 'fixture-loading-plan',
  serverId: 'fixture-loading-server-plan',
  name: 'Loading fixture plan',
  cloudLastSaved: 1704067200000,
  userId: 'fixture-user',
}

const freezeSvgAnimations = (root: HTMLDivElement | null) => {
  root?.querySelectorAll('svg').forEach((svg) => {
    svg.setCurrentTime(0)
    svg.pauseAnimations()
  })
}

const FixtureStack = ({ children }: { children: React.ReactNode }) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    freezeSvgAnimations(rootRef.current)
    const timeoutId = window.setTimeout(() => {
      freezeSvgAnimations(rootRef.current)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <Box
      ref={rootRef}
      sx={{
        width: 390,
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {children}
    </Box>
  )
}

const AuthenticatedFixture = ({ children }: { children: React.ReactNode }) => (
  <StaticAuthSessionProvider session={authenticatedSession}>
    {children}
  </StaticAuthSessionProvider>
)

const SelectionMenuOpenState = () => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      rootRef.current?.querySelector('button')?.click()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <Box ref={rootRef} sx={{ width: 260 }}>
      <SelectionMenu
        id="fixture-selection-menu-open"
        label="Scenario"
        value="Current"
        options={['Current', 'Planned', 'Difference']}
        onChange={() => {}}
      />
    </Box>
  )
}

export const hiilikarttaDisplayPrimitivesFixture: ComponentFixture = {
  id: 'hiilikartta-display-primitives',
  label: 'Hiilikartta display primitives',
  description:
    'Applet-local public display primitive states for the Hiilikartta remigration.',
  sourceGlobs: [
    'src/applets/hiilikartta/components/PlanOutlineIcon.tsx',
    'src/applets/hiilikartta/components/PlanListItem.tsx',
    'src/applets/hiilikartta/components/PlanListItemLoading.tsx',
    'src/applets/hiilikartta/components/PlanFolder.tsx',
    'src/applets/hiilikartta/components/PlanFolderLoading.tsx',
    'src/applets/hiilikartta/components/SelectionMenu.tsx',
    'src/common/component-fixtures/fixtures/HiilikarttaDisplayPrimitivesFixture.tsx',
  ],
  wrapper: FixtureStack,
  states: [
    {
      id: 'plan-outline-icons',
      label: 'Plan outline icons',
      description: 'Small and large plan outline icons with color and size overrides.',
      render: () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <PlanOutlineIcon sx={{ color: '#0D6044' }} />
          <PlanOutlineIcon
            variant="large"
            sx={{ width: '2rem', height: '1.5rem', color: '#7A3D2B' }}
          />
        </Box>
      ),
    },
    {
      id: 'plan-list-default',
      label: 'Plan list default',
      description: 'Normal plan list row with a long name and arrow affordance.',
      render: () => (
        <PlanListItem
          planId="fixture-plan"
          name="Pitkan rannan osayleiskaavan ilmastovaikutusten vertailusuunnitelma"
        />
      ),
    },
    {
      id: 'plan-list-statuses',
      label: 'Plan list statuses',
      description: 'Calculation, error, finished, and custom status rows.',
      render: () => (
        <>
          <PlanListItem
            planId="fixture-initializing"
            name="Calculations starting"
            calculationState={CalculationState.INITIALIZING}
          />
          <PlanListItem
            planId="fixture-calculating"
            name="Calculations in progress"
            calculationState={CalculationState.CALCULATING}
          />
          <PlanListItem
            planId="fixture-errored"
            name="Errored calculation"
            calculationState={CalculationState.ERRORED}
          />
          <PlanListItem
            planId="fixture-finished"
            name="Finished calculation"
            calculationState={CalculationState.FINISHED}
          />
          <PlanListItem
            planId="fixture-custom"
            name="Custom status"
            statusText="Imported from fixture storage"
            statusColor="#7A3D2B"
          />
        </>
      ),
    },
    {
      id: 'plan-list-loading',
      label: 'Plan list loading',
      description: 'Plan list loading placeholder row.',
      render: () => <PlanListItemLoading />,
    },
    {
      id: 'plan-folder-unsaved',
      label: 'Plan folder unsaved',
      description: 'Save-enabled folder with no cloud save timestamp.',
      wrapper: AuthenticatedFixture,
      render: () => <PlanFolder planConf={createFixturePlan()} height={118} />,
    },
    {
      id: 'plan-folder-last-saved',
      label: 'Plan folder last saved',
      description: 'Folder showing a deterministic last-saved timestamp.',
      wrapper: AuthenticatedFixture,
      render: () => (
        <PlanFolder
          planConf={createFixturePlan({ cloudLastSaved: 1704070800000 })}
          height={118}
        />
      ),
    },
    {
      id: 'plan-folder-editable-name',
      label: 'Plan folder editable name',
      description: 'Folder rendering the editable plan name affordance.',
      wrapper: AuthenticatedFixture,
      render: () => (
        <PlanFolder
          planConf={createFixturePlan({
            name: 'Muokattava kaavan nimi',
          })}
          height={118}
          isNameEditable
        />
      ),
    },
    {
      id: 'plan-folder-calculating',
      label: 'Plan folder calculating',
      description: 'Folder with calculation progress status.',
      render: () => (
        <PlanFolder
          planConf={createFixturePlan({
            calculationState: CalculationState.CALCULATING,
          })}
          height={118}
        />
      ),
    },
    {
      id: 'plan-folder-errored',
      label: 'Plan folder errored',
      description: 'Folder with calculation error status.',
      render: () => (
        <PlanFolder
          planConf={createFixturePlan({
            calculationState: CalculationState.ERRORED,
          })}
          height={118}
        />
      ),
    },
    {
      id: 'plan-folder-loading',
      label: 'Plan folder loading',
      description: 'Folder loading state for cloud plan placeholders.',
      render: () => <PlanFolderLoading planConf={loadingPlan} height={118} />,
    },
    {
      id: 'selection-menu-selected',
      label: 'Selection menu selected',
      description: 'Closed local selection menu with a selected option.',
      render: () => (
        <Box sx={{ width: 260 }}>
          <SelectionMenu
            id="fixture-selection-menu-selected"
            label="Scenario"
            value="Planned"
            options={['Current', 'Planned', 'Difference']}
            onChange={() => {}}
          />
        </Box>
      ),
    },
    {
      id: 'selection-menu-open',
      label: 'Selection menu open',
      description: 'Local selection menu opened by deterministic fixture interaction.',
      waitFor: 'role=option',
      render: () => <SelectionMenuOpenState />,
    },
  ],
}
