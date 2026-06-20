'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import BackgroundBuildingFiltersAccordionContent from 'applets/energiakartta/components/BackgroundBuildingFiltersAccordionContent'
import EnergyCertificateClassControls from 'applets/energiakartta/components/EnergyCertificateClassControls'
import type { EnergyCertificateClassCode } from 'applets/energiakartta/layers/energyCertificateLayerConf'
import { useAppletStore } from 'applets/energiakartta/state/appletStore'

type EnergyClassControlsPreset = {
  activeClasses?: EnergyCertificateClassCode[]
}

type BackgroundFiltersPreset = {
  selectedConstructionDecade?: number | null
  showBuildingsFromSelectedDecade?: boolean
  showOnlySelectedDecade?: boolean
}

const EnergyClassControlsState = ({
  activeClasses,
  children,
}: React.PropsWithChildren<EnergyClassControlsPreset>) => {
  React.useLayoutEffect(() => {
    const store = useAppletStore.getState()

    store.resetEnergyCertificateClassFilters()

    if (activeClasses) {
      store.setActiveEnergyCertificateClasses(activeClasses)
    }

    return () => {
      useAppletStore.getState().resetEnergyCertificateClassFilters()
    }
  }, [activeClasses])

  return children
}

const BackgroundFiltersState = ({
  selectedConstructionDecade,
  showBuildingsFromSelectedDecade = false,
  showOnlySelectedDecade = false,
}: BackgroundFiltersPreset) => {
  React.useLayoutEffect(() => {
    const store = useAppletStore.getState()

    store.resetBuildingFilters()

    if (selectedConstructionDecade !== undefined) {
      store.setSelectedConstructionDecade(selectedConstructionDecade)
    }

    store.setShowBuildingsFromSelectedDecade(showBuildingsFromSelectedDecade)
    store.setShowOnlySelectedDecade(showOnlySelectedDecade)

    return () => {
      useAppletStore.getState().resetBuildingFilters()
    }
  }, [
    selectedConstructionDecade,
    showBuildingsFromSelectedDecade,
    showOnlySelectedDecade,
  ])

  return <BackgroundBuildingFiltersAccordionContent />
}

const EnergyClassFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      p: 2,
      backgroundColor: '#ffffff',
    }}
  >
    {children}
  </Box>
)

const BackgroundFiltersFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 320,
      p: 2,
      backgroundColor: '#f4f6f3',
    }}
  >
    {children}
  </Box>
)

export const energymapEnergyClassControlsFixture: ComponentFixture = {
  id: 'energymap-energy-class-controls',
  label: 'Energiakartta energy class controls',
  description: 'Energiakartta A-G energy certificate class control states.',
  sourceGlobs: [
    'src/app/[locale]/(map)/(applets)/energiakartta/components/EnergyCertificateClassControls.tsx',
    'src/app/[locale]/(map)/(applets)/energiakartta/components/EnergyCertificateClassControls.test.tsx',
    'src/common/component-fixtures/fixtures/EnergymapFrontPageControlsFixture.tsx',
  ],
  wrapper: EnergyClassFixtureWrapper,
  states: [
    {
      id: 'desktop-all-active',
      label: 'Desktop all active',
      description: 'Default horizontal desktop control with every class active.',
      render: () => (
        <EnergyClassControlsState>
          <EnergyCertificateClassControls />
        </EnergyClassControlsState>
      ),
    },
    {
      id: 'desktop-some-inactive',
      label: 'Desktop some inactive',
      description: 'Horizontal desktop control with alternating inactive classes.',
      render: () => (
        <EnergyClassControlsState activeClasses={['A', 'C', 'E', 'G']}>
          <EnergyCertificateClassControls />
        </EnergyClassControlsState>
      ),
    },
    {
      id: 'mobile-vertical',
      label: 'Mobile vertical',
      description: 'Floating mobile vertical control with a reduced active set.',
      canvasSx: {
        minWidth: 120,
      },
      render: () => (
        <EnergyClassControlsState activeClasses={['A', 'B', 'D', 'F']}>
          <EnergyCertificateClassControls
            variant="mobile"
            orientation="vertical"
          />
        </EnergyClassControlsState>
      ),
    },
  ],
}

export const energymapBackgroundFiltersFixture: ComponentFixture = {
  id: 'energymap-background-filters',
  label: 'Energiakartta background filters',
  description: 'Energiakartta background building filter control states.',
  sourceGlobs: [
    'src/app/[locale]/(map)/(applets)/energiakartta/components/BackgroundBuildingFiltersAccordionContent.tsx',
    'src/app/[locale]/(map)/(applets)/energiakartta/components/BackgroundBuildingFiltersAccordionContent.test.tsx',
    'src/common/component-fixtures/fixtures/EnergymapFrontPageControlsFixture.tsx',
  ],
  wrapper: BackgroundFiltersFixtureWrapper,
  states: [
    {
      id: 'default-any-year',
      label: 'Default any year',
      description: 'Default filters with no construction decade selected.',
      render: () => (
        <BackgroundFiltersState selectedConstructionDecade={null} />
      ),
    },
    {
      id: 'selected-decade',
      label: 'Selected decade',
      description: 'Filters with a selected construction decade and only-decade switch active.',
      render: () => (
        <BackgroundFiltersState
          selectedConstructionDecade={1970}
          showOnlySelectedDecade
        />
      ),
    },
  ],
}
