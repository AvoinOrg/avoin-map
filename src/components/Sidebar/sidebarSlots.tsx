'use client'

import React from 'react'

import type {
  SidebarBoundaryId,
  SidebarPanelId,
  SidebarSlotName,
} from '#/common/types/sidebar'
import { IntoSlot, Slot } from '#/components/context/slotsContext'

import { useSidebarBoundaryContext } from './sidebarBoundaryContext'

export type SidebarNamedSlotKeyInput = {
  boundaryId: SidebarBoundaryId
  slot: SidebarSlotName
}

export type SidebarPanelSlotKeyInput = {
  boundaryId: SidebarBoundaryId
  slot: 'panel'
  panelId: SidebarPanelId
}

export type SidebarSlotKeyInput =
  | SidebarNamedSlotKeyInput
  | SidebarPanelSlotKeyInput

export const getSidebarSlotKey = (input: SidebarSlotKeyInput) => {
  if (input.slot === 'panel') {
    return `sidebar:${input.boundaryId}:panel:${input.panelId}`
  }

  return `sidebar:${input.boundaryId}:${input.slot}`
}

export const SidebarSlotHost = (props: SidebarSlotKeyInput) => (
  <Slot name={getSidebarSlotKey(props)} />
)

export const SidebarHeaderSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => <SidebarSlotHost boundaryId={boundaryId} slot="header" />

export const SidebarHeaderChildrenSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => <SidebarSlotHost boundaryId={boundaryId} slot="headerChildren" />

export const SidebarFooterSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => <SidebarSlotHost boundaryId={boundaryId} slot="footer" />

export const SidebarActionRailSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => <SidebarSlotHost boundaryId={boundaryId} slot="actionRail" />

// TODO F026.6: remove after Energiakartta building info moves to PanelSidebar slots.
export const SidebarFloatingTrailingSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => (
  <Slot
    name={getSidebarSlotKey({ boundaryId, slot: 'floatingTrailing' })}
    style={{ display: 'contents' }}
  />
)

export const SidebarPanelSlot = ({
  boundaryId,
  panelId,
}: {
  boundaryId: SidebarBoundaryId
  panelId: SidebarPanelId
}) => (
  <SidebarSlotHost boundaryId={boundaryId} slot="panel" panelId={panelId} />
)

const IntoSidebarNamedSlot = ({
  slot,
  children,
}: {
  slot: SidebarSlotName
  children: React.ReactNode
}) => {
  const { boundaryId } = useSidebarBoundaryContext()

  return (
    <IntoSlot name={getSidebarSlotKey({ boundaryId, slot })}>
      {children}
    </IntoSlot>
  )
}

export const IntoSidebarHeaderSlot = ({
  children,
}: {
  children: React.ReactNode
}) => <IntoSidebarNamedSlot slot="header">{children}</IntoSidebarNamedSlot>

export const IntoSidebarHeaderChildrenSlot = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <IntoSidebarNamedSlot slot="headerChildren">{children}</IntoSidebarNamedSlot>
)

export const IntoSidebarFooterSlot = ({
  children,
}: {
  children: React.ReactNode
}) => <IntoSidebarNamedSlot slot="footer">{children}</IntoSidebarNamedSlot>

export const IntoSidebarActionRailSlot = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <IntoSidebarNamedSlot slot="actionRail">{children}</IntoSidebarNamedSlot>
)

export const IntoSidebarFloatingTrailingSlot = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <IntoSidebarNamedSlot slot="floatingTrailing">
    {children}
  </IntoSidebarNamedSlot>
)

export const IntoSidebarPanelSlot = ({
  panelId,
  children,
}: {
  panelId: SidebarPanelId
  children: React.ReactNode
}) => {
  const { boundaryId } = useSidebarBoundaryContext()

  return (
    <IntoSlot name={getSidebarSlotKey({ boundaryId, slot: 'panel', panelId })}>
      {children}
    </IntoSlot>
  )
}
