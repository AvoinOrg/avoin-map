import type React from 'react'
import type { SxProps, Theme } from '@mui/material'

export type SidebarBoundaryId = string

export type SidebarPanelExtensionId = string

export type SidebarMode = 'none' | 'home' | 'floating' | 'simple'

export type SidebarPanelId = 'main' | 'secondary' | 'tertiary'

export type SidebarSlotName =
  | 'header'
  | 'footer'
  | 'actionRail'
  | 'headerChildren'
  | 'topControls'
  | 'bottomControls'

export type SidebarWidthToken = 'default' | 'compact' | 'wide'

export type SidebarChromeToken = 'visible' | 'hidden'

export type SidebarPanelLayout = 'single' | 'double' | 'triple'

export type SidebarMobileMode = 'stacked' | 'buttons'

export type SidebarMobileStackPlacement = 'before' | 'after'

export type SidebarActionRailPlacement =
  | 'inside'
  | 'outside'
  | 'bottomActionRow'
  | 'fixedBottomActionRow'
  | 'fixedRightActionColumn'

export type SidebarNoneConfig = Record<string, never>

export type SidebarHomeConfig = {
  width?: SidebarWidthToken
  chrome?: SidebarChromeToken
}

export type SidebarFloatingConfig = SidebarHomeConfig & {
  mobileMode?: SidebarMobileMode
  actionRailPlacement?: SidebarActionRailPlacement
}

export type SidebarPanelConfig = SidebarHomeConfig & {
  panelLayout?: SidebarPanelLayout
  mobileMode?: SidebarMobileMode
  mobileStackPlacement?: SidebarMobileStackPlacement
  activePanel?: SidebarPanelId
  visiblePanels?: SidebarPanelId[]
  mainPanelVisible?: boolean
  actionRailPlacement?: SidebarActionRailPlacement
}

export type SidebarSimpleConfig = SidebarPanelConfig

export type SidebarPanelExtensionConfig = SidebarPanelConfig & {
  replaceBaseSidebar?: boolean
}

export type SidebarModeConfigMap = {
  none: SidebarNoneConfig
  home: SidebarHomeConfig
  floating: SidebarFloatingConfig
  simple: SidebarSimpleConfig
}

export type SidebarBoundaryConfig<M extends SidebarMode = SidebarMode> =
  SidebarModeConfigMap[M]

export type SidebarRuntimeOptions = {
  width?: SidebarWidthToken
  chrome?: SidebarChromeToken
  panelLayout?: SidebarPanelLayout
  mobileMode?: SidebarMobileMode
  mobileStackPlacement?: SidebarMobileStackPlacement
  activePanel?: SidebarPanelId
  visiblePanels?: SidebarPanelId[]
  mainPanelVisible?: boolean
  actionRailPlacement?: SidebarActionRailPlacement
}

export type SidebarRuntimeOptionsPatch = Partial<SidebarRuntimeOptions>

export type SidebarPanelExtensionRuntimeOptions = SidebarPanelExtensionConfig

export type SidebarPanelExtensionRuntimeOptionsPatch =
  Partial<SidebarPanelExtensionRuntimeOptions>

export type SidebarPanelExtensionTabMetadata = {
  tabId: string
  tabName: React.ReactNode
  tabAriaLabel?: string
  tabIcon?: React.ReactNode
  tabButtonSx?: SxProps<Theme>
  tabIconSx?: SxProps<Theme>
  tabButtonId: string
  tabPanelId: string
}

export type SidebarBoundaryRegistration<M extends SidebarMode = SidebarMode> = {
  id: SidebarBoundaryId
  mode: M
  depth: number
  config?: SidebarBoundaryConfig<M>
  runtimeOptions: SidebarRuntimeOptions
  registrationOrder: number
}

export type SidebarBoundaryRegistry = Partial<
  Record<SidebarBoundaryId, SidebarBoundaryRegistration | undefined>
>

export type SidebarPanelExtensionRegistration = {
  id: SidebarPanelExtensionId
  depth: number
  config?: SidebarPanelExtensionConfig
  runtimeOptions: SidebarPanelExtensionRuntimeOptions
  registrationOrder: number
}

export type SidebarPanelExtensionRegistry = Partial<
  Record<SidebarPanelExtensionId, SidebarPanelExtensionRegistration | undefined>
>

export type RegisterSidebarBoundaryInput<
  M extends SidebarMode = SidebarMode,
> = {
  id: SidebarBoundaryId
  mode: M
  depth: number
  config?: SidebarBoundaryConfig<M>
  runtimeOptions?: SidebarRuntimeOptions
}

export type SidebarBoundaryUpdate<M extends SidebarMode = SidebarMode> = {
  mode?: M
  depth?: number
  config?: SidebarBoundaryConfig<M>
}

export type RegisterSidebarPanelExtensionInput = {
  id: SidebarPanelExtensionId
  depth: number
  config?: SidebarPanelExtensionConfig
  runtimeOptions?: SidebarPanelExtensionRuntimeOptions
}

export type SidebarPanelExtensionUpdate = {
  depth?: number
  config?: SidebarPanelExtensionConfig
}
