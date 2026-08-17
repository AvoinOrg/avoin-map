import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import DOMPurify from 'dompurify'

import {
  CARBON_HOME_FLOATING_GUTTER_PX,
  MAP_CONTROL_EDGE_GUTTER_PX,
} from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import { useMapStore, useUIStore } from '#/common/store'
import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import {
  Box,
  type AppSystemStyleObject,
  toSxArray,
} from '#/common/style/theme/system'
import { ButtonBase } from '#/components/common/Button'
import {
  selectActiveSidebarBoundaryId,
  selectActiveSidebarMode,
} from '#/common/utils/sidebarBoundaryRegistry'
import { IntoSlot } from '#/components/context/slotsContext'
import { AttributionInfo, Cookie } from '#/components/icons'
import { getSidebarSlotKey } from '#/components/Sidebar/sidebarSlots'
import MapBottomLeftFloatingControlsSlot from './MapBottomLeftFloatingControlsSlot'

const INITIAL_PANEL_MAX_WIDTH_PX = 480
const MIN_INLINE_PANEL_WIDTH_PX = 120
const PANEL_GAP_PX = 8
const CARBON_HOME_SIDEBAR_BOUNDARY_ID = 'carbon-home'

type MainSidebarPlacement =
  | 'under-left'
  | 'under-right'
  | 'outside-right'
  | 'overlay-sidebar'

type PanelLayout = 'inline-right' | 'overlay-sidebar'

const bottomControlButtonSx = {
  width: '2.125rem',
  minWidth: '2.125rem',
  height: '2.125rem',
  border: 0,
  p: 0,
  m: 0,
  borderRadius: '0.3125rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  appearance: 'none',
  backgroundColor: 'rgba(244, 244, 244, 0.9)',
  boxShadow: 'inset 2px 2px 2px rgba(177, 177, 177, 0.25)',
  cursor: 'pointer',
  '& svg': {
    width: '1.15rem',
    height: '1.15rem',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(79, 79, 79, 0.85)',
    outlineOffset: 2,
  },
  '&:disabled': {
    cursor: 'default',
    pointerEvents: 'none',
  },
} satisfies AppSystemStyleObject

type BottomControlButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  sx?: AppSystemStyleObject
}

const BottomControlButton = ({
  children,
  sx,
  ...props
}: BottomControlButtonProps) => (
  <ButtonBase {...props} sx={[bottomControlButtonSx, ...toSxArray(sx)]}>
    {children}
  </ButtonBase>
)

const MapBottomControls = () => {
  const _map = useMapInstanceStore((state) => state._map)
  const mapAttributionHtml = useMapStore((state) => state.mapAttributionHtml)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const sidebarWidth = useUIStore((state) => state.sidebarWidth)
  const activeSidebarId = useUIStore((state) =>
    selectActiveSidebarBoundaryId(state.sidebarBoundaries)
  )
  const activeSidebarMode = useUIStore((state) =>
    selectActiveSidebarMode(state.sidebarBoundaries)
  )
  const isMobile = useIsMobile('desktop')
  const isHomeSidebarActive = activeSidebarMode === 'home'
  const isCarbonHomeSidebarActive =
    activeSidebarId === CARBON_HOME_SIDEBAR_BOUNDARY_ID
  const useMainSidebarBottomSlot =
    isHomeSidebarActive && activeSidebarId != null && isSidebarOpen && !isMobile
  const useMainSidebarTopSlot =
    isHomeSidebarActive && activeSidebarId != null && isSidebarOpen && isMobile
  const useMobileFixedInfoOnly =
    isHomeSidebarActive && !isSidebarOpen && isMobile
  const mainSidebarTopControlsSlot =
    activeSidebarId != null
      ? getSidebarSlotKey({ boundaryId: activeSidebarId, slot: 'topControls' })
      : undefined
  const mainSidebarBottomControlsSlot =
    activeSidebarId != null
      ? getSidebarSlotKey({
          boundaryId: activeSidebarId,
          slot: 'bottomControls',
        })
      : undefined

  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [panelMaxWidth, setPanelMaxWidth] = useState<number>(
    INITIAL_PANEL_MAX_WIDTH_PX
  )
  const [panelLeftOffset, setPanelLeftOffset] = useState<number>(84)
  const [overlayPanelLeftOffset, setOverlayPanelLeftOffset] =
    useState<number>(0)
  const [panelLayout, setPanelLayout] = useState<PanelLayout>('inline-right')
  const [slotPlacement, setSlotPlacement] =
    useState<MainSidebarPlacement | null>(null)
  const [buttonRowWidth, setButtonRowWidth] = useState<number>(0)
  const [viewportWidth, setViewportWidth] = useState<number | null>(null)
  const controlsRef = useRef<HTMLDivElement | null>(null)
  const buttonRowRef = useRef<HTMLDivElement | null>(null)

  const sanitizedAttributionHtml = useMemo(
    () =>
      DOMPurify.sanitize(mapAttributionHtml || '', {
        ADD_ATTR: ['target', 'rel'],
      }),
    [mapAttributionHtml]
  )

  const controlEdgeGutterPx =
    !isMobile && isCarbonHomeSidebarActive
      ? CARBON_HOME_FLOATING_GUTTER_PX
      : MAP_CONTROL_EDGE_GUTTER_PX
  const spacingLeftPx = controlEdgeGutterPx
  const spacingBottomPx = controlEdgeGutterPx

  const desiredLeftOffsetPx = isMobile
    ? spacingLeftPx
    : isSidebarOpen
      ? (sidebarWidth ?? 0) + spacingLeftPx
      : spacingLeftPx
  const hasRoomForDesiredLeftOffset =
    isMobile ||
    viewportWidth == null ||
    buttonRowWidth <= 0 ||
    desiredLeftOffsetPx + buttonRowWidth <= viewportWidth - spacingLeftPx
  const leftOffsetPx = hasRoomForDesiredLeftOffset
    ? desiredLeftOffsetPx
    : spacingLeftPx

  const updatePanelLayout = useCallback(() => {
    const controlsEl = controlsRef.current
    const buttonRowEl = buttonRowRef.current

    if (!controlsEl || !buttonRowEl || typeof window === 'undefined') {
      return
    }

    const controlsRect = controlsEl.getBoundingClientRect()
    const buttonRowRect = buttonRowEl.getBoundingClientRect()
    const nextPanelLeftOffset = Math.floor(buttonRowRect.width + PANEL_GAP_PX)
    const nextButtonRowWidth = Math.ceil(buttonRowRect.width)

    setViewportWidth((prev) =>
      prev === window.innerWidth ? prev : window.innerWidth
    )
    setButtonRowWidth((prev) =>
      prev === nextButtonRowWidth ? prev : nextButtonRowWidth
    )

    setPanelLeftOffset((prev) =>
      prev === nextPanelLeftOffset ? prev : nextPanelLeftOffset
    )

    let nextPanelMaxWidth = INITIAL_PANEL_MAX_WIDTH_PX
    let nextOverlayPanelLeftOffset = 0
    let nextPanelLayout: PanelLayout = 'inline-right'
    let nextSlotPlacement: MainSidebarPlacement | null = null

    if (useMainSidebarBottomSlot) {
      const frameEl = controlsEl.closest(
        '[data-main-sidebar-visible-frame="true"]'
      ) as HTMLElement | null
      const wrapperEl = controlsEl.closest(
        '[data-main-sidebar-controls-slot-wrapper]'
      ) as HTMLElement | null

      nextSlotPlacement =
        (wrapperEl?.dataset.mainSidebarControlsSlotWrapper as
          | MainSidebarPlacement
          | undefined) ?? null

      if (frameEl) {
        const frameRect = frameEl.getBoundingClientRect()
        const inlinePanelStartX = controlsRect.left + nextPanelLeftOffset
        const inlineAvailableWidth = Math.floor(
          frameRect.right - inlinePanelStartX - MAP_CONTROL_EDGE_GUTTER_PX
        )
        const overlayStartX = frameRect.left + MAP_CONTROL_EDGE_GUTTER_PX
        const overlayAvailableWidth = Math.floor(
          frameRect.right - overlayStartX - MAP_CONTROL_EDGE_GUTTER_PX
        )

        nextOverlayPanelLeftOffset = Math.floor(
          overlayStartX - controlsRect.left
        )
        nextPanelLayout =
          nextSlotPlacement === 'overlay-sidebar' ||
          inlineAvailableWidth < MIN_INLINE_PANEL_WIDTH_PX
            ? 'overlay-sidebar'
            : 'inline-right'
        nextPanelMaxWidth = Math.max(
          0,
          nextPanelLayout === 'overlay-sidebar'
            ? overlayAvailableWidth
            : inlineAvailableWidth
        )
      }
    } else {
      const panelStartX = controlsRect.left + nextPanelLeftOffset
      const sidebarToggleButton = document.querySelector(
        '.sidebar-toggle-button'
      ) as HTMLElement | null

      if (sidebarToggleButton) {
        const toggleRect = sidebarToggleButton.getBoundingClientRect()
        nextPanelMaxWidth = Math.max(
          0,
          Math.floor(toggleRect.left - panelStartX - PANEL_GAP_PX)
        )
      } else {
        nextPanelMaxWidth = Math.max(
          0,
          Math.floor(window.innerWidth - panelStartX - spacingLeftPx)
        )
      }
    }

    setSlotPlacement((prev) =>
      prev === nextSlotPlacement ? prev : nextSlotPlacement
    )
    setOverlayPanelLeftOffset((prev) =>
      prev === nextOverlayPanelLeftOffset ? prev : nextOverlayPanelLeftOffset
    )
    setPanelLayout((prev) =>
      prev === nextPanelLayout ? prev : nextPanelLayout
    )
    setPanelMaxWidth((prev) =>
      prev === nextPanelMaxWidth ? prev : nextPanelMaxWidth
    )
  }, [spacingLeftPx, useMainSidebarBottomSlot])

  useEffect(() => {
    const closePanel = () => {
      setIsPanelOpen(false)
    }

    if (!_map) {
      return
    }

    _map.on('click', closePanel)
    _map.on('dragstart', closePanel)
    _map.on('zoomstart', closePanel)
    _map.on('rotatestart', closePanel)
    _map.on('pitchstart', closePanel)

    return () => {
      _map.off('click', closePanel)
      _map.off('dragstart', closePanel)
      _map.off('zoomstart', closePanel)
      _map.off('rotatestart', closePanel)
      _map.off('pitchstart', closePanel)
    }
  }, [_map])

  useEffect(() => {
    updatePanelLayout()

    window.addEventListener('resize', updatePanelLayout)
    return () => {
      window.removeEventListener('resize', updatePanelLayout)
    }
  }, [
    updatePanelLayout,
    isMobile,
    isSidebarOpen,
    sidebarWidth,
    useMainSidebarBottomSlot,
    useMainSidebarTopSlot,
    useMobileFixedInfoOnly,
  ])

  const cookieButton = (
    <BottomControlButton
      type="button"
      aria-label="Cookie settings"
      disabled={true}
      tabIndex={-1}
      sx={[
        {
          color: 'rgba(79, 79, 79, 0.55)',
          opacity: 0.75,
          '&:disabled': {
            color: 'rgba(79, 79, 79, 0.55)',
            backgroundColor: 'rgba(244, 244, 244, 0.9)',
            opacity: 0.75,
          },
        },
      ]}
    >
      <Cookie />
    </BottomControlButton>
  )

  const infoButton = (
    <BottomControlButton
      type="button"
      onClick={() => setIsPanelOpen((prev) => !prev)}
      aria-label="Toggle attribution information"
      sx={[
        {
          color: 'rgba(79, 79, 79, 0.85)',
        },
      ]}
    >
      <AttributionInfo />
    </BottomControlButton>
  )

  const renderControls = ({
    showCookieButton,
    showInfoButton,
  }: {
    showCookieButton: boolean
    showInfoButton: boolean
  }) => (
    <>
      <MapBottomLeftFloatingControlsSlot />
      {showInfoButton && isPanelOpen && sanitizedAttributionHtml && (
        <Box
          data-map-attribution-panel="true"
          sx={(theme) => ({
            position: 'absolute',
            left:
              panelLayout === 'overlay-sidebar'
                ? `${overlayPanelLeftOffset}px`
                : `${panelLeftOffset}px`,
            bottom:
              panelLayout === 'overlay-sidebar' ? 'calc(100% + 0.5rem)' : 0,
            pointerEvents: 'auto',
            width: 'max-content',
            maxWidth: `${panelMaxWidth}px`,
            px: '0.875rem',
            py: '0.375rem',
            borderRadius: '0.3125rem',
            color: '#FFFFFF',
            backgroundColor: '#4F4F4F',
            boxShadow: 'inset 2px 2px 2px rgba(0, 0, 0, 0.1)',
            fontSize: '0.5rem',
            fontFamily: theme.typography.fontFamily,
            fontWeight: 400,
            lineHeight: '0.75rem',
            letterSpacing: '0.05rem',
            whiteSpace: 'normal',
            overflowWrap: 'break-word',
            '& p': {
              m: 0,
            },
            '& a': {
              color: '#FFFFFF',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              letterSpacing: 'inherit',
              textDecoration: 'underline',
            },
          })}
          dangerouslySetInnerHTML={{ __html: sanitizedAttributionHtml }}
        />
      )}
      <Box
        ref={buttonRowRef}
        data-main-sidebar-controls-row-placement={slotPlacement ?? undefined}
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
          pointerEvents: 'auto',
        })}
      >
        {showCookieButton ? cookieButton : null}
        {showInfoButton ? infoButton : null}
      </Box>
    </>
  )

  if (isCarbonHomeSidebarActive && isMobile && isSidebarOpen) {
    return null
  }

  if (useMainSidebarTopSlot && mainSidebarTopControlsSlot != null) {
    return (
      <IntoSlot name={mainSidebarTopControlsSlot}>
        <Box
          ref={controlsRef}
          data-main-sidebar-top-control-inner="true"
          sx={(theme) => ({
            position: 'relative',
            width: 'max-content',
            pointerEvents: 'none',
            zIndex: theme.zIndex.mapButtons,
          })}
        >
          {renderControls({ showCookieButton: true, showInfoButton: false })}
        </Box>
      </IntoSlot>
    )
  }

  if (useMainSidebarBottomSlot && mainSidebarBottomControlsSlot != null) {
    return (
      <IntoSlot name={mainSidebarBottomControlsSlot}>
        <Box
          ref={controlsRef}
          data-main-sidebar-bottom-control-inner="true"
          sx={(theme) => ({
            position: 'relative',
            width: 'max-content',
            pointerEvents: 'none',
            zIndex: theme.zIndex.mapButtons,
          })}
        >
          {renderControls({ showCookieButton: true, showInfoButton: true })}
        </Box>
      </IntoSlot>
    )
  }

  return (
    <Box
      ref={controlsRef}
      sx={(theme) => ({
        position: 'fixed',
        left: leftOffsetPx,
        bottom: spacingBottomPx,
        pointerEvents: 'none',
        zIndex:
          isMobile || !hasRoomForDesiredLeftOffset
            ? theme.zIndex.drawer + 13
            : theme.zIndex.mapButtons,
        transition:
          'left 220ms cubic-bezier(.2,0,.2,1), bottom 220ms cubic-bezier(.2,0,.2,1)',
      })}
    >
      {renderControls({
        showCookieButton: !useMobileFixedInfoOnly,
        showInfoButton: true,
      })}
    </Box>
  )
}

export default MapBottomControls
