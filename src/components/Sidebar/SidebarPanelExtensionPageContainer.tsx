'use client'

import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css, cx } from 'styled-system/css'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { PartialOptions } from 'overlayscrollbars'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { Box } from '#/components/common/PandaBox'
import SimpleTooltip from '#/components/common/SimpleTooltip'
import { Cross } from '../icons'

export type SidebarPanelExtensionPageContainerProps = {
  children?: React.ReactNode
  sx?: PandaStyleProp
  contentSx?: PandaStyleProp
  controlsSx?: PandaStyleProp
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

type PageControlButtonProps = Omit<
  React.ComponentProps<typeof BaseButton>,
  'className' | 'style' | 'color'
> & {
  sx?: PandaStyleProp
}

const PageControlButton = ({
  sx,
  children,
  type = 'button',
  ...props
}: PageControlButtonProps) => (
  <BaseButton
    {...props}
    type={type}
    className={cx(css(pageControlButtonSx, ...pandaStylePropsToArray(sx)))}
    style={mergePandaStyleProps({ sx })}
  >
    {children}
  </BaseButton>
)

const CollapsePanelIcon = ({ sx }: { sx?: PandaStyleProp }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={css(...pandaStylePropsToArray(sx))}
    style={mergePandaStyleProps({ sx })}
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
        ...(Array.isArray(sx) ? sx : [sx]),
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
            ...(Array.isArray(controlsSx) ? controlsSx : [controlsSx]),
          ]}
        >
          {showCollapse && (
            <SimpleTooltip title={collapseAriaLabel}>
              <PageControlButton
                aria-label={collapseAriaLabel}
                onClick={onCollapse}
                sx={pageControlButtonSx}
              >
                <CollapsePanelIcon sx={{ width: '1.85rem', height: '1.85rem' }} />
              </PageControlButton>
            </SimpleTooltip>
          )}
          {showClose && (
            <SimpleTooltip title={closeAriaLabel}>
              <PageControlButton
                aria-label={closeAriaLabel}
                onClick={onClose}
                sx={pageControlButtonSx}
              >
                <Cross sx={{ width: '1rem', height: '1rem' }} />
              </PageControlButton>
            </SimpleTooltip>
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
              ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
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
