'use client'

import React, { useEffect, useState } from 'react'

import { Box } from '#/common/style/theme'
import { LayerOrderLevel, ListedLayerMenuItem } from '#/common/types/map'
import { UserAuthState, UserDataState } from '#/common/types/state'
import { useMapStore, useUIStore } from '#/common/store'
import { useUserStore } from '#/common/store/userStore'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import {
  Delete,
  Done,
  EditDocument,
  Layers,
  LayersDark,
  Line,
  Plus,
  Polygon,
} from '#/components/icons'
import { MapButton } from '#/components/Map/MapButton'
import { MapButtonGroup } from '#/components/Map/MapButtonGroups'
import { MapUserButtons } from '#/components/Map/MapUserButtons'
import {
  MapLayerButtonHorizontal,
  MapLayerButtonVertical,
} from '#/components/Map/MapLayerButton'
import LayerMenuContent from '#/components/Map/MapLayerButton/LayerMenuContent'

const noop = () => {}
const thumbnail = '/files/img/og-image.jpg'

const mapSurfaceSx = {
  minWidth: 360,
  minHeight: 220,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 3,
  background:
    'linear-gradient(90deg, rgba(220, 226, 220, 0.9) 1px, transparent 1px), linear-gradient(rgba(220, 226, 220, 0.9) 1px, transparent 1px)',
  backgroundSize: '24px 24px',
  backgroundColor: '#eef2ed',
}

const ToolbarFixtureWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box sx={mapSurfaceSx}>{children}</Box>
)

const backgroundLayer = {
  id: 'fixture-background',
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
    },
  },
  translationNs: 'avoin-map',
  nameTranslationKey: 'fixture.layer.background',
  thumbnail,
} satisfies ListedLayerMenuItem

const overlayLayer = {
  id: 'fixture-overlay',
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
    },
  },
  translationNs: 'avoin-map',
  nameTranslationKey: 'fixture.layer.overlay',
  thumbnail,
  infoElement: <Box sx={{ fontSize: '0.75rem' }}>Fixture layer info</Box>,
  styleOptions: {
    showOpacitySlider: true,
    defaultOpacity: 0.65,
  },
} satisfies ListedLayerMenuItem

const processingLayer = {
  id: 'fixture-processing',
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
    },
  },
  translationNs: 'avoin-map',
  nameTranslationKey: 'fixture.layer.processing',
  thumbnail,
} satisfies ListedLayerMenuItem

const accordionLayer = {
  id: 'fixture-layer-accordion',
  type: 'accordion',
  menuOrderLevel: LayerOrderLevel.BACKGROUND_OVERLAY,
  translationNs: 'avoin-map',
  titleTranslationKey: 'fixture.layer.accordion',
  defaultExpanded: true,
  content: <Box sx={{ fontSize: '0.75rem' }}>Fixture accordion content</Box>,
  items: [overlayLayer],
} satisfies ListedLayerMenuItem

const listedLayerItems = [backgroundLayer, accordionLayer, processingLayer]

const setSignedOutUser = () => {
  useUserStore.setState({
    userAuth: null,
    userData: null,
    userAuthState: UserAuthState.Unauthenticated,
    userDataState: UserDataState.Unfetched,
  })
}

const setSignedInUser = () => {
  useUserStore.setState({
    userAuth: { id: 'fixture-user', accessToken: undefined },
    userData: {
      id: 'fixture-user',
      name: 'Fixture User',
      email: 'fixture@example.test',
    },
    userAuthState: UserAuthState.Authenticated,
    userDataState: UserDataState.Fetched,
  })
}

const LayerButtonFixture = ({
  isVertical,
  isOpen,
}: {
  isVertical: boolean
  isOpen: boolean
}) => {
  useEffect(() => {
    useMapStore.setState({
      listedLayerGroups: listedLayerItems,
      layerGroupOpacities: { 'fixture-overlay': 0.65 },
    })
    useUIStore.setState({
      activeMapMenu: isOpen ? 'backgroundLayers' : undefined,
    })

    return () => {
      useUIStore.setState({ activeMapMenu: undefined })
    }
  }, [isOpen])

  const LayerButton = isVertical ? MapLayerButtonVertical : MapLayerButtonHorizontal

  return (
    <Box
      sx={{
        width: isVertical ? 56 : 360,
        minHeight: isVertical ? 220 : 56,
        display: 'flex',
        alignItems: isVertical ? 'flex-start' : 'center',
        justifyContent: isVertical ? 'flex-end' : 'flex-start',
      }}
    >
      <LayerButton
        shownLayerLevels={[LayerOrderLevel.BACKGROUND]}
        headerLabel="Fixture layers"
        tooltipLabel="Open fixture layers"
        mapMenuState="backgroundLayers"
        icon={<LayersDark />}
      />
    </Box>
  )
}

const UserButtonsFixture = ({
  signedIn,
  loginDefaultMenuOpen,
  languageDefaultMenuOpen,
}: {
  signedIn?: boolean
  loginDefaultMenuOpen?: boolean
  languageDefaultMenuOpen?: boolean
}) => {
  const [isReady] = useState(() => {
    if (signedIn) {
      setSignedInUser()
    } else {
      setSignedOutUser()
    }

    return true
  })

  useEffect(() => {
    return () => {
      setSignedOutUser()
    }
  }, [])

  if (!isReady) {
    return null
  }

  return (
    <MapUserButtons
      isVertical={false}
      loginDefaultMenuOpen={loginDefaultMenuOpen}
      languageDefaultMenuOpen={languageDefaultMenuOpen}
    />
  )
}

const LayerMenuState = ({
  visibleIds = [],
  items = listedLayerItems,
}: {
  visibleIds?: string[]
  items?: ListedLayerMenuItem[]
}) => (
  <Box
    sx={{
      width: 224,
      minHeight: 220,
      backgroundColor: 'rgba(246, 244, 244, 0.9)',
      borderRadius: '0.3125rem',
      boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.18)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <LayerMenuContent
      headerLabel="Fixture layers"
      items={items}
      visibleLayerGroupIds={visibleIds}
      opacityLabel="Opacity"
      onToggleLayer={noop}
      onOpacityChange={noop}
      onClose={noop}
    />
  </Box>
)

export const mapButtonGroupsFixture: ComponentFixture = {
  id: 'map-button-groups',
  label: 'Map button groups',
  description: 'Map toolbar button group orientation and draw-control states.',
  sourceGlobs: [
    'src/components/Map/MapButtonGroups.tsx',
    'src/components/Map/MapButton.tsx',
    'src/components/icons/Done.tsx',
    'src/components/icons/ExploreOutlined.tsx',
    'src/common/component-fixtures/fixtures/MapLayerToolbarChromeFixture.tsx',
  ],
  wrapper: ToolbarFixtureWrapper,
  states: [
    {
      id: 'horizontal-basic',
      label: 'Horizontal basic',
      description: 'Joined horizontal map button group.',
      render: () => (
        <MapButtonGroup orientation="horizontal">
          <MapButton tooltip="Background layers" onClick={noop}>
            <LayersDark aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Overlay layers" onClick={noop}>
            <Layers aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Zoom in" onClick={noop}>
            <Plus aria-hidden="true" />
          </MapButton>
        </MapButtonGroup>
      ),
    },
    {
      id: 'vertical-basic',
      label: 'Vertical basic',
      description: 'Joined vertical map button group.',
      render: () => (
        <MapButtonGroup orientation="vertical">
          <MapButton tooltip="Background layers" isVertical onClick={noop}>
            <LayersDark aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Overlay layers" isVertical onClick={noop}>
            <Layers aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Zoom in" isVertical onClick={noop}>
            <Plus aria-hidden="true" />
          </MapButton>
        </MapButtonGroup>
      ),
    },
    {
      id: 'draw-enabled',
      label: 'Draw enabled',
      description: 'Draw/edit/delete toolbar controls in a joined group.',
      render: () => (
        <MapButtonGroup orientation="horizontal">
          <MapButton tooltip="Disable draw" onClick={noop}>
            <Done aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Edit" onClick={noop}>
            <EditDocument aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Polygon" onClick={noop}>
            <Polygon aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Corridor" onClick={noop}>
            <Line aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Delete" onClick={noop}>
            <Delete aria-hidden="true" />
          </MapButton>
        </MapButtonGroup>
      ),
    },
    {
      id: 'dev-hidden',
      label: 'Development buttons hidden',
      description: 'Representative production toolbar group without dev-only buttons.',
      render: () => (
        <MapButtonGroup orientation="horizontal">
          <MapButton tooltip="Background layers" onClick={noop}>
            <LayersDark aria-hidden="true" />
          </MapButton>
          <MapButton tooltip="Zoom in" onClick={noop}>
            <Plus aria-hidden="true" />
          </MapButton>
        </MapButtonGroup>
      ),
    },
  ],
}

export const mapUserButtonsFixture: ComponentFixture = {
  id: 'map-user-buttons',
  label: 'Map user buttons',
  description: 'Account, home, and language map-control states.',
  sourceGlobs: [
    'src/components/Map/MapUserButtons.tsx',
    'src/components/Map/MapLoginButton.tsx',
    'src/components/Map/MapButtonMenu.tsx',
    'src/common/component-fixtures/fixtures/MapLayerToolbarChromeFixture.tsx',
  ],
  wrapper: ToolbarFixtureWrapper,
  states: [
    {
      id: 'signed-out',
      label: 'Signed out',
      description: 'Default signed-out account and language controls.',
      render: () => <UserButtonsFixture />,
    },
    {
      id: 'signed-in-menu-open',
      label: 'Signed in menu open',
      description: 'Authenticated account menu surface.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => <UserButtonsFixture signedIn loginDefaultMenuOpen />,
    },
    {
      id: 'language-menu-open',
      label: 'Language menu open',
      description: 'Language menu surface with selected locale styling.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => <UserButtonsFixture languageDefaultMenuOpen />,
    },
    {
      id: 'single-locale-disabled',
      label: 'Single locale disabled',
      description: 'Disabled language-style map button state.',
      render: () => (
        <MapButton disabled aria-label="Change language: EN">
          EN
        </MapButton>
      ),
    },
  ],
}

export const mapLayerMenuFixture: ComponentFixture = {
  id: 'map-layer-menu',
  label: 'Map layer menu',
  description: 'Layer button popover and layer menu row states.',
  sourceGlobs: [
    'src/components/Map/MapLayerButton/MapLayerButtonBase.tsx',
    'src/components/Map/MapLayerButton/MapLayerButtonHorizontal.tsx',
    'src/components/Map/MapLayerButton/MapLayerButtonVertical.tsx',
    'src/components/Map/MapLayerButton/LayerMenuContent.tsx',
    'src/components/Map/MapLayerButton/LayerItem.tsx',
    'src/common/component-fixtures/fixtures/MapLayerToolbarChromeFixture.tsx',
  ],
  wrapper: ToolbarFixtureWrapper,
  states: [
    {
      id: 'horizontal-closed',
      label: 'Horizontal closed',
      description: 'Closed horizontal layer menu button.',
      render: () => <LayerButtonFixture isVertical={false} isOpen={false} />,
    },
    {
      id: 'horizontal-open',
      label: 'Horizontal open',
      description: 'Open horizontal layer menu popover.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => <LayerButtonFixture isVertical={false} isOpen />,
    },
    {
      id: 'vertical-open',
      label: 'Vertical open',
      description: 'Open vertical layer menu popover.',
      waitFor: '[data-slot="map-button-menu-surface"]',
      render: () => <LayerButtonFixture isVertical isOpen />,
    },
    {
      id: 'mobile-open',
      label: 'Mobile open',
      description: 'Menu content constrained for mobile visual capture.',
      canvasSx: { minWidth: 320, p: 0 },
      render: () => <LayerMenuState visibleIds={['fixture-background']} />,
    },
    {
      id: 'visible-row',
      label: 'Visible row',
      description: 'Selected layer thumbnail border.',
      render: () => (
        <LayerMenuState
          items={[backgroundLayer]}
          visibleIds={['fixture-background']}
        />
      ),
    },
    {
      id: 'hidden-row',
      label: 'Hidden row',
      description: 'Unselected layer thumbnail state.',
      render: () => <LayerMenuState items={[backgroundLayer]} />,
    },
    {
      id: 'processing-row',
      label: 'Processing row',
      description: 'Representative extra listed layer row.',
      render: () => <LayerMenuState items={[processingLayer]} />,
    },
    {
      id: 'info-open',
      label: 'Info open',
      description: 'Layer row with info control available.',
      render: () => (
        <LayerMenuState
          items={[accordionLayer]}
          visibleIds={['fixture-overlay']}
        />
      ),
    },
    {
      id: 'opacity',
      label: 'Opacity',
      description: 'Layer opacity slider state.',
      render: () => (
        <LayerMenuState
          items={[overlayLayer]}
          visibleIds={['fixture-overlay']}
        />
      ),
    },
  ],
}
