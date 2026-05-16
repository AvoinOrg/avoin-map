export type SidebarBoundaryId = string

export type SidebarMode = 'none' | 'home' | 'floating' | 'panel'

export type SidebarPanelId = 'main' | 'secondary' | 'tertiary'

export type SidebarSlotName =
  | 'header'
  | 'footer'
  | 'actionRail'
  | 'headerChildren'

export type SidebarWidthToken = 'default' | 'compact' | 'wide'

export type SidebarChromeToken = 'visible' | 'hidden'

export type SidebarPanelLayout = 'single' | 'double' | 'triple'

export type SidebarMobileMode = 'stacked' | 'buttons'

export type SidebarMobileStackPlacement = 'before' | 'after'

export type SidebarActionRailPlacement =
  | 'inside'
  | 'outside'
  | 'bottomActionRow'

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

export type SidebarModeConfigMap = {
  none: SidebarNoneConfig
  home: SidebarHomeConfig
  floating: SidebarFloatingConfig
  panel: SidebarPanelConfig
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
