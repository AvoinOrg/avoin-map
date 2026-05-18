import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { SlotsProvider } from '#/components/context/slotsContext'

import { SidebarBoundary } from './SidebarBoundary'
import { SidebarPanelExtensionProvider } from './SidebarPanelExtensionProvider'
import {
  getSidebarPanelExtensionSlotKey,
  getSidebarSlotKey,
  IntoSidebarActionRailSlot,
  IntoSidebarBottomControlsSlot,
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarHeaderSlot,
  IntoSidebarPanelExtensionActionRailSlot,
  IntoSidebarPanelExtensionPanelSlot,
  IntoSidebarPanelSlot,
  IntoSidebarTopControlsSlot,
  SidebarActionRailSlot,
  SidebarBottomControlsSlot,
  SidebarHeaderChildrenSlot,
  SidebarHeaderSlot,
  SidebarPanelExtensionActionRailSlot,
  SidebarPanelExtensionPanelSlot,
  SidebarPanelSlot,
  SidebarTopControlsSlot,
} from './sidebarSlots'

const resetSidebarBoundaryRegistry = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    sidebarPanelExtensions: {},
    _sidebarPanelExtensionRegistrationOrder: 0,
  })
}

describe('sidebar scoped slots', () => {
  beforeEach(() => {
    resetSidebarBoundaryRegistry()
  })

  it('builds deterministic boundary-scoped slot keys', () => {
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'header',
      })
    ).toBe('sidebar:boundary-a:header')
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'footer',
      })
    ).toBe('sidebar:boundary-a:footer')
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'actionRail',
      })
    ).toBe('sidebar:boundary-a:actionRail')
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'headerChildren',
      })
    ).toBe('sidebar:boundary-a:headerChildren')
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'topControls',
      })
    ).toBe('sidebar:boundary-a:topControls')
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'bottomControls',
      })
    ).toBe('sidebar:boundary-a:bottomControls')
    expect(
      getSidebarSlotKey({
        boundaryId: 'boundary-a',
        slot: 'panel',
        panelId: 'secondary',
      })
    ).toBe('sidebar:boundary-a:panel:secondary')
  })

  it('builds deterministic extension-scoped slot keys', () => {
    expect(
      getSidebarPanelExtensionSlotKey({
        extensionId: 'extension-a',
        slot: 'actionRail',
      })
    ).toBe('sidebar-panel-extension:extension-a:actionRail')
    expect(
      getSidebarPanelExtensionSlotKey({
        extensionId: 'extension-a',
        slot: 'panel',
        panelId: 'main',
      })
    ).toBe('sidebar-panel-extension:extension-a:panel:main')
  })

  it('portals content into the nearest sidebar boundary scoped slot', () => {
    render(
      <SlotsProvider>
        <SidebarBoundary id="parent" mode="floating">
          <SidebarHeaderSlot boundaryId="parent" />
          <SidebarHeaderChildrenSlot boundaryId="parent" />
          <SidebarTopControlsSlot boundaryId="parent" />
          <SidebarBottomControlsSlot boundaryId="parent" />
          <IntoSidebarHeaderSlot>
            <button type="button">Parent header</button>
          </IntoSidebarHeaderSlot>
          <IntoSidebarHeaderChildrenSlot>
            <span>Parent header children</span>
          </IntoSidebarHeaderChildrenSlot>
          <IntoSidebarTopControlsSlot>
            <button type="button">Parent top control</button>
          </IntoSidebarTopControlsSlot>
          <IntoSidebarBottomControlsSlot>
            <button type="button">Parent bottom control</button>
          </IntoSidebarBottomControlsSlot>

          <SidebarBoundary id="child" mode="simple">
            <SidebarActionRailSlot boundaryId="child" />
            <SidebarHeaderSlot boundaryId="child" />
            <SidebarPanelSlot boundaryId="child" panelId="secondary" />
            <IntoSidebarActionRailSlot>
              <button type="button">Child action</button>
            </IntoSidebarActionRailSlot>
            <IntoSidebarHeaderSlot>
              <button type="button">Child header</button>
            </IntoSidebarHeaderSlot>
            <IntoSidebarPanelSlot panelId="secondary">
              <span>Child panel</span>
            </IntoSidebarPanelSlot>
          </SidebarBoundary>
        </SidebarBoundary>
      </SlotsProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Parent header' })
    ).toBeInTheDocument()
    expect(screen.getByText('Parent header children')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Parent top control' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Parent bottom control' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Child header' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Child action' })
    ).toBeInTheDocument()
    expect(screen.getByText('Child panel')).toBeInTheDocument()
  })

  it('portals content into extension-scoped slots independently from boundary slots', () => {
    render(
      <SlotsProvider>
        <SidebarBoundary id="boundary" mode="simple">
          <SidebarPanelSlot boundaryId="boundary" panelId="main" />
          <IntoSidebarPanelSlot panelId="main">
            <span>Boundary main panel</span>
          </IntoSidebarPanelSlot>

          <SidebarPanelExtensionProvider id="extension">
            <SidebarPanelExtensionPanelSlot
              extensionId="extension"
              panelId="main"
            />
            <SidebarPanelExtensionActionRailSlot extensionId="extension" />
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <span>Extension main panel</span>
            </IntoSidebarPanelExtensionPanelSlot>
            <IntoSidebarPanelExtensionActionRailSlot>
              <button type="button">Extension action</button>
            </IntoSidebarPanelExtensionActionRailSlot>
          </SidebarPanelExtensionProvider>
        </SidebarBoundary>
      </SlotsProvider>
    )

    expect(screen.getByText('Boundary main panel')).toBeInTheDocument()
    expect(screen.getByText('Extension main panel')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Extension action' })
    ).toBeInTheDocument()
  })
})
