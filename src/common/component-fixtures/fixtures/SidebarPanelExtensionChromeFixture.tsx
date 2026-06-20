'use client'

import React from 'react'

import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import type {
  SidebarPanelExtensionTabMetadata,
  SidebarPanelId,
} from '#/common/types/sidebar'
import type { RouteTree } from '#/common/types/routing'
import { Cross, InfoCircle, Layers } from '#/components/icons'
import BreadcrumbNav from '#/components/Sidebar/BreadcrumbNav'
import PopupDrawer from '#/components/Sidebar/PopupDrawer'
import {
  SidebarPanelExtensionTabRail,
} from '#/components/Sidebar/SidebarPanelExtension'
import SidebarPanelExtensionPageContainer from '#/components/Sidebar/SidebarPanelExtensionPageContainer'

const noop = () => {}

const panelLabels: Record<SidebarPanelId, string> = {
  main: 'Main panel',
  secondary: 'Secondary panel',
  tertiary: 'Tertiary panel',
}

const tabs: SidebarPanelExtensionTabMetadata[] = [
  {
    tabId: 'layers',
    tabName: 'Layers',
    tabAriaLabel: 'Open layers tab',
    tabIcon: <Layers />,
    tabButtonId: 'fixture-sidebar-tab-layers',
    tabPanelId: 'fixture-sidebar-tabpanel-layers',
  },
  {
    tabId: 'details',
    tabName: 'Details',
    tabAriaLabel: 'Open details tab',
    tabIcon: <InfoCircle />,
    tabButtonId: 'fixture-sidebar-tab-details',
    tabPanelId: 'fixture-sidebar-tabpanel-details',
  },
  {
    tabId: 'close',
    tabName: 'Close',
    tabAriaLabel: 'Open close tab',
    tabIcon: <Cross />,
    tabButtonId: 'fixture-sidebar-tab-close',
    tabPanelId: 'fixture-sidebar-tabpanel-close',
  },
]

const fixtureRouteTree = {
  _conf: {
    path: '/',
    name: 'Fixtures',
  },
  dev: {
    _conf: {
      path: '/dev',
      name: 'Dev',
    },
    componentFixtures: {
      _conf: {
        path: '/component-fixtures',
        name: 'Component fixtures',
      },
      sidebarPanelExtensionChrome: {
        _conf: {
          path: '/sidebar-panel-extension-chrome',
          name: 'Sidebar panel extension chrome',
        },
        breadcrumbs: {
          _conf: {
            path: '/breadcrumbs',
            name: 'Breadcrumbs',
          },
        },
      },
    },
  },
} as const satisfies RouteTree

const FixtureSurface = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 420,
      maxWidth: '100%',
      minHeight: 240,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#eef1ec',
      borderRadius: '8px',
      p: 2,
    }}
  >
    {children}
  </Box>
)

const PanelPreview = ({
  panelId,
  active = false,
}: {
  panelId: SidebarPanelId
  active?: boolean
}) => (
  <Box
    sx={{
      width: 108,
      minHeight: 92,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '6px',
      border: '1px solid rgba(17, 17, 17, 0.12)',
      backgroundColor: active ? '#e8e8e8' : '#ffffff',
      color: '#111111',
      fontSize: '0.75rem',
      fontWeight: active ? 700 : 500,
      textAlign: 'center',
    }}
  >
    {panelLabels[panelId]}
  </Box>
)

const TabRailFixture = ({
  orientation,
}: {
  orientation: 'column' | 'row'
}) => (
  <FixtureSurface>
    <Box
      sx={{
        display: 'flex',
        flexDirection: orientation === 'column' ? 'row' : 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <SidebarPanelExtensionTabRail
        tabs={tabs}
        activeTabId="details"
        placement={orientation === 'column' ? 'desktop' : 'mobile'}
        orientation={orientation}
        onTabChange={noop}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <PanelPreview panelId="main" />
        <PanelPreview panelId="secondary" active />
      </Box>
    </Box>
  </FixtureSurface>
)

const PageContainerFixture = () => (
  <Box sx={{ width: 360, height: 280, display: 'flex' }}>
    <SidebarPanelExtensionPageContainer
      onCollapse={noop}
      onClose={noop}
      collapseAriaLabel="Collapse fixture panel"
      closeAriaLabel="Close fixture panel"
      contentSx={{ p: 2, gap: 1 }}
    >
      <Box sx={{ fontSize: '1rem', fontWeight: 700 }}>Panel page</Box>
      <Box sx={{ fontSize: '0.8125rem', lineHeight: 1.45 }}>
        Scrollable page content keeps controls fixed above the OverlayScrollbars
        viewport while the content region owns the page body.
      </Box>
      <Box sx={{ height: 160, borderRadius: '6px', backgroundColor: '#eef1ec' }} />
    </SidebarPanelExtensionPageContainer>
  </Box>
)

const BreadcrumbFixture = () => (
  <FixtureSurface>
    <Box sx={{ width: '100%', backgroundColor: '#ffffff', p: 2 }}>
      <BreadcrumbNav routeTree={fixtureRouteTree} forceRouteTree />
    </Box>
  </FixtureSurface>
)

const PopupDrawerFixture = ({ open }: { open: boolean }) => (
  <FixtureSurface>
    <Box
      sx={{
        minWidth: 300,
        height: 96,
        display: 'flex',
        alignItems: 'stretch',
        border: '1px solid rgba(17, 17, 17, 0.12)',
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          width: 88,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid rgba(17, 17, 17, 0.08)',
          fontSize: '0.75rem',
        }}
      >
        Anchor
      </Box>
      <PopupDrawer open={open}>
        <Box
          sx={{
            width: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f6f7f5',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          Drawer content
        </Box>
      </PopupDrawer>
    </Box>
  </FixtureSurface>
)

export const sidebarPanelExtensionChromeFixture: ComponentFixture = {
  id: 'sidebar-panel-extension-chrome',
  label: 'Sidebar panel extension chrome',
  description:
    'Panel extension tabs, page controls, breadcrumbs, and popup drawer chrome states.',
  sourceGlobs: [
    'src/components/Sidebar/SidebarPanelExtension.tsx',
    'src/components/Sidebar/SidebarPanelExtensionTabIconButton.tsx',
    'src/components/Sidebar/SidebarPanelExtensionTabContainer.tsx',
    'src/components/Sidebar/SidebarPanelExtensionPageContainer.tsx',
    'src/components/Sidebar/BreadcrumbNav.tsx',
    'src/components/Sidebar/PopupDrawer.tsx',
    'src/components/Sidebar/SidebarPanelExtensionTooltip.tsx',
    'src/common/component-fixtures/fixtures/SidebarPanelExtensionChromeFixture.tsx',
  ],
  states: [
    {
      id: 'tab-rail-desktop',
      label: 'Tab rail desktop',
      description: 'Vertical tab rail with the middle tab selected.',
      render: () => <TabRailFixture orientation="column" />,
    },
    {
      id: 'tab-rail-mobile',
      label: 'Tab rail mobile',
      description: 'Horizontal mobile tab rail with the middle tab selected.',
      render: () => <TabRailFixture orientation="row" />,
    },
    {
      id: 'page-container-controls',
      label: 'Page container controls',
      description: 'Scrollable page container with collapse and close controls.',
      canvasSx: { p: 0 },
      render: () => <PageContainerFixture />,
    },
    {
      id: 'breadcrumbs',
      label: 'Breadcrumbs',
      description: 'Route-derived breadcrumb labels and back affordance.',
      render: () => <BreadcrumbFixture />,
    },
    {
      id: 'popup-drawer-open',
      label: 'Popup drawer open',
      description: 'Open popup drawer with mounted children.',
      render: () => <PopupDrawerFixture open />,
    },
    {
      id: 'popup-drawer-closed',
      label: 'Popup drawer closed',
      description: 'Closed popup drawer with zero-width chrome and no children.',
      render: () => <PopupDrawerFixture open={false} />,
    },
  ],
}
