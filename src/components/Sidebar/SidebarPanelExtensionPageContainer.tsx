import React from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { PartialOptions } from 'overlayscrollbars'

import {
  Box,
  toSxArray,
} from '#/common/style/theme/system'
import type { AppSxProps } from '#/common/style/theme/system'
import { IconButton } from '#/components/common/Button'

import { Cross } from '../icons'
import { SidebarPanelExtensionTooltip } from './SidebarPanelExtensionTooltip'

export type SidebarPanelExtensionPageContainerProps = {
  children?: React.ReactNode
  sx?: AppSxProps
  contentSx?: AppSxProps
  controlsSx?: AppSxProps
  scrollbarSide?: 'left' | 'right'
  scrollbarOptions?: PartialOptions
  showCollapseControl?: boolean
  showCloseControl?: boolean
  onCollapse?: () => void
  onClose?: () => void
  collapseAriaLabel?: string
  closeAriaLabel?: string
}

const shouldShowAction = (showControl?: boolean, handler?: () => void) =>
  handler != null && showControl !== false

const pageControlButtonSx = {
  width: '2.25rem',
  minWidth: '2.25rem',
  height: '2.25rem',
  padding: '0.125rem',
  borderRadius: '0.625rem',
  color: 'neutral.darker',
  backgroundColor: '#ffffff',
  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.12)',
  '&:hover': {
    backgroundColor: '#f4f4f4',
  },
} as const

const CollapsePanelIcon = ({ sx }: { sx?: AppSxProps }) => (
  <Box
    component="span"
    aria-hidden="true"
    data-testid="sidebar-panel-extension-collapse-icon"
    sx={[
      {
        display: 'inline-flex',
        width: '1em',
        height: '1em',
        flexShrink: 0,
        color: 'currentColor',
        fontSize: '1.5rem',
        lineHeight: 1,
      },
      ...toSxArray(sx),
    ]}
  >
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <path
        d="M11 6 6 12l5 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
      />
      <path
        d="m18 6-5 6 5 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.7}
      />
    </svg>
  </Box>
)

export const SidebarPanelExtensionPageContainer = ({
  children,
  sx,
  contentSx,
  controlsSx,
  scrollbarSide = 'left',
  scrollbarOptions,
  showCollapseControl,
  showCloseControl,
  onCollapse,
  onClose,
  collapseAriaLabel = 'collapse sidebar panel extension page',
  closeAriaLabel = 'close sidebar panel extension page',
}: SidebarPanelExtensionPageContainerProps) => {
  const showCollapse = shouldShowAction(showCollapseControl, onCollapse)
  const showClose = shouldShowAction(showCloseControl, onClose)
  const hasControls = showCollapse || showClose
  const resolvedScrollbarOptions: PartialOptions = {
    ...scrollbarOptions,
    overflow: {
      x: 'hidden',
      y: 'scroll',
      ...scrollbarOptions?.overflow,
    },
    scrollbars: {
      theme: 'os-theme-dark',
      visibility: 'auto',
      autoHide: 'leave',
      autoHideDelay: 600,
      ...scrollbarOptions?.scrollbars,
    },
  }

  return (
    <Box
      className="sidebar-panel-extension-page-container"
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
        },
        ...toSxArray(sx),
      ]}
    >
      {hasControls && (
        <Box
          className="sidebar-panel-extension-page-container-controls"
          sx={[
            {
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.75,
              px: 1.5,
              py: 1.25,
              backgroundColor: '#ffffff',
              borderBottom: '1px solid rgba(17, 17, 17, 0.08)',
              zIndex: 1,
            },
            ...toSxArray(controlsSx),
          ]}
        >
          {showCollapse && (
            <SidebarPanelExtensionTooltip title={collapseAriaLabel} side="top">
              {(tooltipTriggerProps) => {
                const {
                  onClick: onTooltipTriggerClick,
                  ...buttonTooltipTriggerProps
                } = tooltipTriggerProps

                return (
                  <IconButton
                    {...buttonTooltipTriggerProps}
                    aria-label={collapseAriaLabel}
                    onClick={(event) => {
                      onTooltipTriggerClick?.(
                        event as React.MouseEvent<HTMLButtonElement>
                      )

                      if (event.defaultPrevented) {
                        return
                      }

                      onCollapse?.()
                    }}
                    type="button"
                    size="small"
                    sx={pageControlButtonSx}
                  >
                    <CollapsePanelIcon sx={{ fontSize: '1.85rem' }} />
                  </IconButton>
                )
              }}
            </SidebarPanelExtensionTooltip>
          )}
          {showClose && (
            <SidebarPanelExtensionTooltip title={closeAriaLabel} side="top">
              {(tooltipTriggerProps) => {
                const {
                  onClick: onTooltipTriggerClick,
                  ...buttonTooltipTriggerProps
                } = tooltipTriggerProps

                return (
                  <IconButton
                    {...buttonTooltipTriggerProps}
                    aria-label={closeAriaLabel}
                    onClick={(event) => {
                      onTooltipTriggerClick?.(
                        event as React.MouseEvent<HTMLButtonElement>
                      )

                      if (event.defaultPrevented) {
                        return
                      }

                      onClose?.()
                    }}
                    type="button"
                    size="small"
                    sx={pageControlButtonSx}
                  >
                    <Cross sx={{ width: '1rem', height: '1rem' }} />
                  </IconButton>
                )
              }}
            </SidebarPanelExtensionTooltip>
          )}
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          height: '100%',
          ...(scrollbarSide === 'left' && {
            '& .os-scrollbar-vertical': {
              left: 0,
              right: 'auto',
            },
            '& .os-scrollbar-corner': {
              left: 0,
              right: 'auto',
            },
          }),
        }}
      >
        <OverlayScrollbarsComponent
          className={`osScroll${scrollbarSide === 'left' ? ' osLeft' : ''}`}
          data-testid="sidebar-panel-extension-page-scroll"
          options={resolvedScrollbarOptions}
          style={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            direction: scrollbarSide === 'left' ? 'rtl' : 'ltr',
          }}
        >
          <Box
            className="sidebar-panel-extension-page-container-inner"
            sx={[
              {
                direction: 'ltr',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: '100%',
                minWidth: 0,
              },
              ...toSxArray(contentSx),
            ]}
          >
            {children}
          </Box>
        </OverlayScrollbarsComponent>
      </Box>
    </Box>
  )
}

export default SidebarPanelExtensionPageContainer
