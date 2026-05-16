import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { SlotsProvider } from '#/components/context/slotsContext'

import { SidebarBoundary } from './SidebarBoundary'
import {
  getSidebarSlotKey,
  IntoSidebarHeaderSlot,
  IntoSidebarPanelSlot,
  SidebarHeaderSlot,
  SidebarPanelSlot,
} from './sidebarSlots'

const resetSidebarBoundaryRegistry = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
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
        slot: 'panel',
        panelId: 'secondary',
      })
    ).toBe('sidebar:boundary-a:panel:secondary')
  })

  it('portals content into the nearest sidebar boundary scoped slot', () => {
    render(
      <SlotsProvider>
        <SidebarBoundary id="parent" mode="floating">
          <SidebarHeaderSlot boundaryId="parent" />
          <IntoSidebarHeaderSlot>
            <button type="button">Parent header</button>
          </IntoSidebarHeaderSlot>

          <SidebarBoundary id="child" mode="panel">
            <SidebarHeaderSlot boundaryId="child" />
            <SidebarPanelSlot boundaryId="child" panelId="secondary" />
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
    expect(
      screen.getByRole('button', { name: 'Child header' })
    ).toBeInTheDocument()
    expect(screen.getByText('Child panel')).toBeInTheDocument()
  })
})
