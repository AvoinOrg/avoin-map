import React from 'react'

import type {
  SidebarBoundaryId,
  SidebarPanelExtensionId,
  SidebarPanelId,
  SidebarSlotName,
} from '#/common/types/sidebar'
import { IntoSlot, Slot } from '#/components/context/slotsContext'

import { useSidebarBoundaryContext } from './sidebarBoundaryContext'
import { useSidebarPanelExtensionContext } from './sidebarPanelExtensionContext'

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

export type SidebarPanelExtensionNamedSlotKeyInput = {
  extensionId: SidebarPanelExtensionId
  slot: 'actionRail'
}

export type SidebarPanelExtensionPanelSlotKeyInput = {
  extensionId: SidebarPanelExtensionId
  slot: 'panel'
  panelId: SidebarPanelId
}

export type SidebarPanelExtensionSlotKeyInput =
  | SidebarPanelExtensionNamedSlotKeyInput
  | SidebarPanelExtensionPanelSlotKeyInput

export const getSidebarSlotKey = (input: SidebarSlotKeyInput) => {
  if (input.slot === 'panel') {
    return `sidebar:${input.boundaryId}:panel:${input.panelId}`
  }

  return `sidebar:${input.boundaryId}:${input.slot}`
}

export const getSidebarPanelExtensionSlotKey = (
  input: SidebarPanelExtensionSlotKeyInput
) => {
  if (input.slot === 'panel') {
    return `sidebar-panel-extension:${input.extensionId}:panel:${input.panelId}`
  }

  return `sidebar-panel-extension:${input.extensionId}:${input.slot}`
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

export const SidebarTopControlsSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => <SidebarSlotHost boundaryId={boundaryId} slot="topControls" />

export const SidebarBottomControlsSlot = ({
  boundaryId,
}: {
  boundaryId: SidebarBoundaryId
}) => <SidebarSlotHost boundaryId={boundaryId} slot="bottomControls" />

export const SidebarPanelSlot = ({
  boundaryId,
  panelId,
}: {
  boundaryId: SidebarBoundaryId
  panelId: SidebarPanelId
}) => (
  <Slot
    name={getSidebarSlotKey({ boundaryId, slot: 'panel', panelId })}
    style={{ display: 'contents' }}
  />
)

export const SidebarPanelExtensionSlotHost = (
  props: SidebarPanelExtensionSlotKeyInput
) => <Slot name={getSidebarPanelExtensionSlotKey(props)} />

export const SidebarPanelExtensionActionRailSlot = ({
  extensionId,
}: {
  extensionId: SidebarPanelExtensionId
}) => (
  <Slot
    name={getSidebarPanelExtensionSlotKey({
      extensionId,
      slot: 'actionRail',
    })}
    style={{ display: 'contents' }}
  />
)

export const SidebarPanelExtensionPanelSlot = ({
  extensionId,
  panelId,
}: {
  extensionId: SidebarPanelExtensionId
  panelId: SidebarPanelId
}) => (
  <Slot
    name={getSidebarPanelExtensionSlotKey({
      extensionId,
      slot: 'panel',
      panelId,
    })}
    style={{ display: 'contents' }}
  />
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

export const IntoSidebarTopControlsSlot = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <IntoSidebarNamedSlot slot="topControls">{children}</IntoSidebarNamedSlot>
)

export const IntoSidebarBottomControlsSlot = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <IntoSidebarNamedSlot slot="bottomControls">{children}</IntoSidebarNamedSlot>
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

export const IntoSidebarPanelExtensionActionRailSlot = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { extensionId } = useSidebarPanelExtensionContext()

  return (
    <IntoSlot
      name={getSidebarPanelExtensionSlotKey({
        extensionId,
        slot: 'actionRail',
      })}
    >
      {children}
    </IntoSlot>
  )
}

export const IntoSidebarPanelExtensionPanelSlot = ({
  panelId,
  children,
}: {
  panelId: SidebarPanelId
  children: React.ReactNode
}) => {
  const { extensionId } = useSidebarPanelExtensionContext()

  return (
    <IntoSlot
      name={getSidebarPanelExtensionSlotKey({
        extensionId,
        slot: 'panel',
        panelId,
      })}
    >
      {children}
    </IntoSlot>
  )
}
