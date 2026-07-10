import React from 'react'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { useUIStore } from '#/common/store'
import type { AppBoxProps } from '#/common/style/theme/system'
import { Box } from '#/common/style/theme/system'
import type { SidebarActionRailPlacement } from '#/common/types/sidebar'
import { ArrowLeft, Cross } from '../icons'
import SidebarToggleButton from './SidebarToggleButton'
import SidebarScaffold from './SidebarScaffold'
import { SimpleSidebarProvider } from './SimpleSidebarContext'

export type SimpleSidebarMobileMode = 'stacked' | 'buttons'
export type SimpleSidebarMobilePanel = 'main' | 'a' | 'b'
export type SimpleSidebarMobileStackPlacement = 'before' | 'after'
type SidebarStyleProps = AppBoxProps['sx']
const nativeButtonType = {
  type: 'button',
} satisfies Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>

export type SimpleSidebarPanelConfig = {
  content: React.ReactNode
  desktopWidth?: string
  desktopContentSx?: SidebarStyleProps
  showBackButton?: boolean
  onBack?: () => void
  backAriaLabel?: string
  showCloseButton?: boolean
  onClose?: () => void
  closeAriaLabel?: string
}

type SimpleSidebarDefaultPanelsConfig = {
  mode?: 'default'
}

type SimpleSidebarSinglePanelsConfig = {
  mode: 'single'
  isOpen: boolean
  panel: SimpleSidebarPanelConfig
  desktopActionRail?: React.ReactNode
  mobileActionRail?: React.ReactNode
  mobileMode?: SimpleSidebarMobileMode
  mobileStackPlacement?: SimpleSidebarMobileStackPlacement
  mobileActivePanel?: Extract<SimpleSidebarMobilePanel, 'main' | 'a'>
  onMobileActivePanelChange?: (
    panel: Extract<SimpleSidebarMobilePanel, 'main' | 'a'>
  ) => void
  mobileNavigation?: React.ReactNode
  mobileStackRender?: 'context' | 'direct'
}

type SimpleSidebarDoublePanelConfig = SimpleSidebarPanelConfig

type SimpleSidebarDoublePanelsConfig = {
  mode: 'double'
  panelA: SimpleSidebarPanelConfig
  panelB: SimpleSidebarDoublePanelConfig
  desktopActionRail?: React.ReactNode
  mobileActionRail?: React.ReactNode
  mobileMode?: SimpleSidebarMobileMode
  mobileActivePanel?: Extract<SimpleSidebarMobilePanel, 'a' | 'b'>
  onMobileActivePanelChange?: (
    panel: Extract<SimpleSidebarMobilePanel, 'a' | 'b'>
  ) => void
  mobileNavigation?: React.ReactNode
  desktopMainPanelVisible?: boolean
  mobileMainPanelVisible?: boolean
}

export type SimpleSidebarPanelsConfig =
  | SimpleSidebarDefaultPanelsConfig
  | SimpleSidebarSinglePanelsConfig
  | SimpleSidebarDoublePanelsConfig

const DESKTOP_MAIN_WIDTH_REM = 23.75
const DESKTOP_PANEL_WIDTH_REM = 23.75
const SIDEBAR_TOGGLE_BUTTON_SIZE_PX = 45
const ACTION_RAIL_GAP_PX = 10
const BOTTOM_ACTION_ROW_TOGGLE_RIGHT = '35px'
const BOTTOM_ACTION_ROW_BOTTOM =
  'calc(env(safe-area-inset-bottom, 0px) + 26px)'
const FIXED_BOTTOM_ACTION_ROW_RIGHT_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
const FIXED_RIGHT_ACTION_COLUMN_TOP_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
const FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX =
  MAP_CONTROL_EDGE_GUTTER_PX +
  SIDEBAR_TOGGLE_BUTTON_SIZE_PX +
  ACTION_RAIL_GAP_PX
type FixedSidebarActionRailPlacement = Extract<
  SidebarActionRailPlacement,
  'fixedBottomActionRow' | 'fixedRightActionColumn'
>

const panelChromeButtonSx = {
  m: 0,
  p: 0,
  border: 0,
  appearance: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  font: 'inherit',
  pointerEvents: 'auto',
  width: '45px',
  minWidth: '45px',
  height: '45px',
  borderRadius: '10px',
  color: 'neutral.darker',
  backgroundColor: '#ffffff',
  boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.18)',
  transition: 'background-color 0.2s, transform 0.2s',
  '&:hover': {
    backgroundColor: '#f4f4f4',
    transform: 'translateY(-1px)',
  },
  '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
    color: 'text.disabled',
    opacity: 0.5,
    transform: 'none',
  },
} as const

const PanelChromeButton = ({
  children,
  disabled,
  onClick,
  ariaLabel,
  sx,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  ariaLabel: string
  sx?: SidebarStyleProps
}) => {
  const disabledProps =
    disabled === undefined
      ? {}
      : ({
          disabled,
        } satisfies Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>)

  return (
    <Box
      component="button"
      {...nativeButtonType}
      {...disabledProps}
      aria-label={ariaLabel}
      onClick={onClick}
      sx={[panelChromeButtonSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  )
}

const shouldShowAction = (showButton?: boolean, handler?: () => void) => {
  return handler != null && showButton !== false
}

const PanelChrome = ({
  panel,
  defaultBackAriaLabel,
  defaultCloseAriaLabel,
}: {
  panel: SimpleSidebarPanelConfig
  defaultBackAriaLabel: string
  defaultCloseAriaLabel: string
}) => {
  const showBack = shouldShowAction(panel.showBackButton, panel.onBack)
  const showClose = shouldShowAction(panel.showCloseButton, panel.onClose)

  if (!showBack && !showClose) return null

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        pt: 1.25,
        pb: 0.5,
        zIndex: 5,
        pointerEvents: 'none',
      }}
    >
      {showBack && (
        <PanelChromeButton
          ariaLabel={panel.backAriaLabel ?? defaultBackAriaLabel}
          onClick={panel.onBack}
        >
          <ArrowLeft sx={{ width: '1.05rem', height: '1.45rem' }} />
        </PanelChromeButton>
      )}
      {showClose ? (
        <PanelChromeButton
          ariaLabel={panel.closeAriaLabel ?? defaultCloseAriaLabel}
          onClick={panel.onClose}
        >
          <Cross sx={{ width: '1rem', height: '1rem' }} />
        </PanelChromeButton>
      ) : null}
    </Box>
  )
}

const DesktopPanelBox = ({
  panel,
  defaultBackAriaLabel,
  defaultCloseAriaLabel,
}: {
  panel: SimpleSidebarPanelConfig
  defaultBackAriaLabel: string
  defaultCloseAriaLabel: string
}) => {
  const isSidebarOpen = useUIStore((s) => s.isSidebarOpen)
  const width = panel.desktopWidth ?? `${DESKTOP_PANEL_WIDTH_REM}rem`
  const hasChrome =
    shouldShowAction(panel.showBackButton, panel.onBack) ||
    shouldShowAction(panel.showCloseButton, panel.onClose)

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 auto',
        width,
        maxWidth: `min(${width}, 100vw)`,
        height: '100%',
        pt: 0,
        pb: 0,
        ml: 0,
        zIndex: (theme.zIndex?.drawer ?? 1200) + 1,
        pointerEvents: isSidebarOpen ? 'auto' : 'none',
        visibility: isSidebarOpen ? 'visible' : 'hidden',
      })}
    >
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 6px rgba(17, 17, 17, 0.06)',
          borderLeft: '1px solid rgba(17, 17, 17, 0.08)',
        }}
      >
        <PanelChrome
          panel={panel}
          defaultBackAriaLabel={defaultBackAriaLabel}
          defaultCloseAriaLabel={defaultCloseAriaLabel}
        />
        <Box
          sx={[
            {
              position: 'absolute',
              inset: 0,
              overflow: 'auto',
              pt: hasChrome ? '4rem' : 0,
            },
            ...(Array.isArray(panel.desktopContentSx)
              ? panel.desktopContentSx
              : [panel.desktopContentSx]),
          ]}
        >
          {panel.content}
        </Box>
      </Box>
    </Box>
  )
}

const MobileDoubleBackButton = ({
  onBack,
  ariaLabel,
}: {
  onBack: () => void
  ariaLabel?: string
}) => {
  return (
    <Box
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        p: 1,
        backgroundColor: '#ffffff',
        borderBottom: `1px solid ${theme.palette.neutral.main}`,
      })}
    >
      <PanelChromeButton
        ariaLabel={ariaLabel ?? 'back to main sidebar'}
        onClick={onBack}
      >
        <ArrowLeft sx={{ width: '1.05rem', height: '1.45rem' }} />
      </PanelChromeButton>
    </Box>
  )
}

const MobilePanelNavigation = ({
  activePanel,
  availablePanels,
  onChange,
}: {
  activePanel: SimpleSidebarMobilePanel
  availablePanels: SimpleSidebarMobilePanel[]
  onChange: (panel: SimpleSidebarMobilePanel) => void
}) => {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        gap: 0.5,
        p: 1,
        borderTop: `1px solid ${theme.palette.neutral.main}`,
        backgroundColor: '#ffffff',
      })}
    >
      {availablePanels.includes('main') && (
        <PanelChromeButton
          ariaLabel="show main sidebar panel"
          onClick={() => onChange('main')}
          disabled={activePanel === 'main'}
        >
          <ArrowLeft sx={{ width: '1rem', height: '1rem' }} />
        </PanelChromeButton>
      )}
      {availablePanels.includes('a') && (
        <PanelChromeButton
          ariaLabel="show sidebar panel a"
          onClick={() => onChange('a')}
          disabled={activePanel === 'a'}
          sx={{ ...panelChromeButtonSx, typography: 'caption' }}
        >
          A
        </PanelChromeButton>
      )}
      {availablePanels.includes('b') && (
        <PanelChromeButton
          ariaLabel="show sidebar panel b"
          onClick={() => onChange('b')}
          disabled={activePanel === 'b'}
          sx={{ ...panelChromeButtonSx, typography: 'caption' }}
        >
          B
        </PanelChromeButton>
      )}
    </Box>
  )
}

const getMobileMode = (panels?: SimpleSidebarPanelsConfig) => {
  if (panels?.mode === 'single' || panels?.mode === 'double') {
    return panels.mobileMode ?? 'stacked'
  }

  return 'stacked'
}

const isFixedActionRailPlacement = (
  placement: SidebarActionRailPlacement
): placement is FixedSidebarActionRailPlacement =>
  placement === 'fixedBottomActionRow' ||
  placement === 'fixedRightActionColumn'

const getFixedActionRailSx = (
  placement: FixedSidebarActionRailPlacement
): SidebarStyleProps => {
  if (placement === 'fixedBottomActionRow') {
    return (theme) => ({
      position: 'fixed',
      right: `${FIXED_BOTTOM_ACTION_ROW_RIGHT_PX}px`,
      bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
      zIndex: (theme.zIndex?.drawer ?? 1200) + 12,
      display: 'flex',
      flexDirection: 'row',
      gap: `${ACTION_RAIL_GAP_PX}px`,
      pointerEvents: 'auto',
    })
  }

  return (theme) => ({
    position: 'fixed',
    top: `${FIXED_RIGHT_ACTION_COLUMN_TOP_PX}px`,
    right: `${FIXED_RIGHT_ACTION_COLUMN_RIGHT_PX}px`,
    zIndex: (theme.zIndex?.drawer ?? 1200) + 12,
    display: 'flex',
    flexDirection: 'column',
    gap: `${ACTION_RAIL_GAP_PX}px`,
    pointerEvents: 'auto',
  })
}

export const SimpleSidebarBase = ({
  sx,
  sidebarToggleSx,
  panelSx,
  contentSx,
  topContent,
  bottomContent,
  actionRail,
  actionRailPlacement = 'inside',
  hideMainContainer = false,
  mobileStackedContentBefore,
  mobileStackedContentAfter,
  panels,
  children,
  headerChildren,
}: {
  sx?: SidebarStyleProps
  sidebarToggleSx?: SidebarStyleProps
  panelSx?: SidebarStyleProps
  contentSx?: SidebarStyleProps
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  actionRail?: React.ReactNode
  actionRailPlacement?: SidebarActionRailPlacement
  hideMainContainer?: boolean
  mobileStackedContentBefore?: React.ReactNode
  mobileStackedContentAfter?: React.ReactNode
  panels?: SimpleSidebarPanelsConfig
  children: React.ReactNode
  headerChildren?: React.ReactNode
}) => {
  const isMobile = useIsMobile()

  const panelsMode = panels?.mode ?? 'default'
  const mobileMode = getMobileMode(panels)
  const [internalMobilePanelState, setInternalMobilePanelState] =
    React.useState<{
      panelsMode: typeof panelsMode
      panel: SimpleSidebarMobilePanel
    }>(() => ({
      panelsMode,
      panel: panelsMode === 'double' ? 'a' : 'main',
    }))
  const internalMobilePanel =
    internalMobilePanelState.panelsMode === panelsMode
      ? internalMobilePanelState.panel
      : panelsMode === 'double'
        ? 'a'
        : 'main'

  const singlePanel = panels?.mode === 'single' ? panels.panel : null
  const isSinglePanelOpen = panels?.mode === 'single' && panels.isOpen
  const doublePanelA = panels?.mode === 'double' ? panels.panelA : null
  const doublePanelB = panels?.mode === 'double' ? panels.panelB : null

  const setMobileActivePanel = (panel: SimpleSidebarMobilePanel) => {
    if (panels?.mode === 'single' && (panel === 'main' || panel === 'a')) {
      panels.onMobileActivePanelChange?.(panel)
    }

    if (panels?.mode === 'double' && (panel === 'a' || panel === 'b')) {
      panels.onMobileActivePanelChange?.(panel)
    }

    setInternalMobilePanelState({ panelsMode, panel })
  }

  const mobileActivePanel =
    panels?.mode === 'single'
      ? panels.mobileActivePanel ?? internalMobilePanel
      : panels?.mode === 'double'
        ? panels.mobileActivePanel ?? internalMobilePanel
        : 'main'

  let resolvedMobileActivePanel = mobileActivePanel
  if (panels?.mode === 'single' && !panels.isOpen) {
    resolvedMobileActivePanel = 'main'
  }
  if (panels?.mode === 'double' && mobileActivePanel === 'main') {
    resolvedMobileActivePanel = 'a'
  }

  const breadcrumbArea = (
    <Box
      sx={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        px: { mobile: '1rem', desktop: '1.875rem' },
        pt: { mobile: '1rem', desktop: '1.375rem' },
        pb: { mobile: '0.9rem', desktop: '1.375rem' },
        color: 'neutral.darker',
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          width: '100%',
          minHeight: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          typography: 'body2',
        }}
      >
        {headerChildren}
      </Box>
    </Box>
  )

  const desktopTrailing =
    !isMobile && isSinglePanelOpen && singlePanel ? (
      <DesktopPanelBox
        panel={singlePanel}
        defaultBackAriaLabel="back from extra sidebar panel"
        defaultCloseAriaLabel="close extra sidebar panel"
      />
    ) : !isMobile &&
      panels?.mode === 'double' &&
      doublePanelA &&
      doublePanelB ? (
      <>
        <DesktopPanelBox
          panel={doublePanelA}
          defaultBackAriaLabel="back from first extra sidebar panel"
          defaultCloseAriaLabel="close first extra sidebar panel"
        />
        <DesktopPanelBox
          panel={doublePanelB}
          defaultBackAriaLabel="back to main sidebar"
          defaultCloseAriaLabel="close extra sidebar panels"
        />
      </>
    ) : null

  const panelDesktopActionRail =
    (panels?.mode === 'single' || panels?.mode === 'double') &&
    panels.desktopActionRail
      ? panels.desktopActionRail
      : null
  const panelMobileActionRail =
    (panels?.mode === 'single' || panels?.mode === 'double') &&
    panels.mobileActionRail
      ? panels.mobileActionRail
      : null
  const desktopActionRailContent =
    panelDesktopActionRail != null || actionRail != null ? (
      <>
        {panelDesktopActionRail}
        {actionRail}
      </>
    ) : null
  const mobileActionRailContent =
    panelMobileActionRail != null || actionRail != null ? (
      <>
        {panelMobileActionRail}
        {actionRail}
      </>
    ) : null

  const desktopActionRail =
    !isMobile && desktopActionRailContent != null ? (
      actionRailPlacement === 'outside' ? (
        desktopActionRailContent
      ) : (
        <Box
          data-testid="sidebar-action-rail"
          data-sidebar-action-rail-placement={actionRailPlacement}
          data-sidebar-action-rail-fixed={
            isFixedActionRailPlacement(actionRailPlacement) ? 'true' : undefined
          }
          sx={
            isFixedActionRailPlacement(actionRailPlacement)
              ? getFixedActionRailSx(actionRailPlacement)
              : (theme) => ({
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  pt: 2,
                  pl: 1,
                  zIndex: (theme.zIndex?.drawer ?? 1200) + 1,
                  pointerEvents: 'auto',
                })
          }
        >
          {desktopActionRailContent}
        </Box>
      )
    ) : null

  const mobileActionRail =
    isMobile && mobileActionRailContent != null ? (
      actionRailPlacement === 'outside' ? (
        mobileActionRailContent
      ) : (
        <Box
          data-testid="sidebar-action-rail"
          data-sidebar-action-rail-placement={actionRailPlacement}
          data-sidebar-action-rail-fixed={
            isFixedActionRailPlacement(actionRailPlacement) ||
            actionRailPlacement === 'bottomActionRow'
              ? 'true'
              : undefined
          }
          sx={
            isFixedActionRailPlacement(actionRailPlacement)
              ? getFixedActionRailSx(actionRailPlacement)
              : (theme) => ({
                  position:
                    actionRailPlacement === 'bottomActionRow'
                      ? 'fixed'
                      : 'absolute',
                  top:
                    actionRailPlacement === 'bottomActionRow'
                      ? 'auto'
                      : '4.75rem',
                  right:
                    actionRailPlacement === 'bottomActionRow'
                      ? '90px'
                      : '0.75rem',
                  bottom:
                    actionRailPlacement === 'bottomActionRow'
                      ? BOTTOM_ACTION_ROW_BOTTOM
                      : 'auto',
                  zIndex: (theme.zIndex?.drawer ?? 1200) + 12,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '10px',
                  pointerEvents: 'auto',
                })
          }
        >
          {mobileActionRailContent}
        </Box>
      )
    ) : null

  const mobileDoubleBackHeader =
    isMobile && panels?.mode === 'double' && doublePanelB?.onBack ? (
      <MobileDoubleBackButton
        onBack={doublePanelB.onBack}
        ariaLabel={doublePanelB.backAriaLabel}
      />
    ) : null

  const renderSingleMobileStackDirect =
    panels?.mode === 'single' && panels.mobileStackRender === 'direct'
  const mobileStackedContent =
    isMobile &&
    panels?.mode === 'single' &&
    panels.isOpen &&
    mobileMode === 'stacked' &&
    !renderSingleMobileStackDirect &&
    singlePanel ? (
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {singlePanel.content}
      </Box>
    ) : undefined
  const mobileStackPlacement =
    panels?.mode === 'single' ? panels.mobileStackPlacement ?? 'after' : 'after'

  const mobileSingleDirectStackedContent =
    isMobile &&
    panels?.mode === 'single' &&
    panels.isOpen &&
    mobileMode === 'stacked' &&
    renderSingleMobileStackDirect &&
    singlePanel ? (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          width: '100%',
        }}
      >
        {singlePanel.content}
      </Box>
    ) : null

  const mobileButtonsPanelContent =
    isMobile && mobileMode === 'buttons' ? (
      <>
        {isSinglePanelOpen && singlePanel && (
          <Box
            sx={{
              display: resolvedMobileActivePanel === 'a' ? 'block' : 'none',
              overflow: 'auto',
              width: '100%',
            }}
          >
            {singlePanel.content}
          </Box>
        )}
        {doublePanelA && (
          <Box
            sx={{
              display: resolvedMobileActivePanel === 'a' ? 'block' : 'none',
              overflow: 'auto',
              width: '100%',
            }}
          >
            {doublePanelA.content}
          </Box>
        )}
        {doublePanelB && (
          <Box
            sx={{
              display: resolvedMobileActivePanel === 'b' ? 'block' : 'none',
              overflow: 'auto',
              width: '100%',
            }}
          >
            {doublePanelB.content}
          </Box>
        )}
      </>
    ) : null

  const mobileDoubleStackedContent =
    isMobile &&
    mobileMode === 'stacked' &&
    panels?.mode === 'double' &&
    doublePanelA &&
    doublePanelB ? (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          width: '100%',
        }}
      >
        {doublePanelA.content}
        {doublePanelB.content}
      </Box>
    ) : null

  const panelMobileStackedContentBefore =
    mobileStackPlacement === 'before' ? mobileSingleDirectStackedContent : null
  const panelMobileStackedContentAfter =
    mobileStackPlacement === 'after'
      ? (mobileDoubleStackedContent ?? mobileSingleDirectStackedContent)
      : mobileDoubleStackedContent
  const shouldShowMobileMainContent =
    !isMobile ||
    mobileMode !== 'buttons' ||
    (panels?.mode !== 'double' && resolvedMobileActivePanel === 'main')
  const shouldShowStackedMobileMainContent =
    !isMobile ||
    mobileMode !== 'stacked' ||
    panels?.mode !== 'double' ||
    panels.mobileMainPanelVisible === true
  const isMainContentVisible =
    shouldShowMobileMainContent && shouldShowStackedMobileMainContent

  const mobilePanelNavigation =
    isMobile &&
    mobileMode === 'buttons' &&
    ((panels?.mode === 'single' && panels.isOpen) ||
      panels?.mode === 'double') ? (
      <>
        {panels.mobileNavigation ?? (
          <MobilePanelNavigation
            activePanel={resolvedMobileActivePanel}
            availablePanels={
              panels.mode === 'double' ? ['a', 'b'] : ['main', 'a']
            }
            onChange={setMobileActivePanel}
          />
        )}
      </>
    ) : null

  const resolvedTopContent =
    topContent === undefined ? breadcrumbArea : topContent
  const resolvedBottomContent =
    bottomContent != null || mobilePanelNavigation != null ? (
      <>
        {bottomContent}
        {mobilePanelNavigation}
      </>
    ) : undefined
  const shouldHideMainContainer =
    !isMobile &&
    (hideMainContainer ||
      (panels?.mode === 'double' && panels.desktopMainPanelVisible !== true))

  return (
    <SimpleSidebarProvider
      value={{
        isSimpleSidebar: true,
        mobileStackedContentBefore:
          mobileStackPlacement === 'before' ? mobileStackedContent : undefined,
        mobileStackedContentAfter:
          mobileStackPlacement === 'after' ? mobileStackedContent : undefined,
      }}
    >
      <SidebarToggleButton
        sx={[
          actionRailPlacement === 'bottomActionRow'
            ? (theme) => ({
                right: {
                  mobile: BOTTOM_ACTION_ROW_TOGGLE_RIGHT,
                  desktop: BOTTOM_ACTION_ROW_TOGGLE_RIGHT,
                },
                bottom: {
                  mobile: BOTTOM_ACTION_ROW_BOTTOM,
                  desktop: BOTTOM_ACTION_ROW_BOTTOM,
                },
                zIndex: (theme.zIndex?.drawer ?? 1200) + 12,
              })
            : undefined,
          ...(Array.isArray(sidebarToggleSx)
            ? sidebarToggleSx
            : [sidebarToggleSx]),
        ]}
      />
      <SidebarScaffold
        topContent={
          <>
            {resolvedTopContent}
            {mobileDoubleBackHeader}
          </>
        }
        bottomContent={resolvedBottomContent}
        trailingContent={desktopTrailing}
        actionRail={isMobile ? mobileActionRail : desktopActionRail}
        hideMainContainer={shouldHideMainContainer}
        containerSx={[
          {
            pt: { mobile: 0, desktop: 0 },
            pb: { mobile: 0, desktop: 0 },
            ml: { mobile: 0, desktop: 0 },
            width: { mobile: '100vw', desktop: `${DESKTOP_MAIN_WIDTH_REM}rem` },
            maxWidth: {
              mobile: '100vw',
              desktop: `min(${DESKTOP_MAIN_WIDTH_REM}rem, 100vw)`,
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        panelSx={[
          {
            borderRadius: { mobile: 0, desktop: 0 },
            backgroundColor: '#ffffff',
          },
          ...(Array.isArray(panelSx) ? panelSx : [panelSx]),
        ]}
        contentSx={[
          {
            backgroundColor: 'inherit',
            flexDirection: 'column',
          },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {isMobile ? mobileStackedContentBefore : null}
        {panelMobileStackedContentBefore}
        <Box sx={{ display: isMainContentVisible ? 'contents' : 'none' }}>
          {children}
        </Box>
        {panelMobileStackedContentAfter}
        {isMobile ? mobileStackedContentAfter : null}
        {mobileButtonsPanelContent}
      </SidebarScaffold>
    </SimpleSidebarProvider>
  )
}

export default SimpleSidebarBase
