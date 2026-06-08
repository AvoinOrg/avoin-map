'use client'

import React from 'react'
import { css, cx } from 'styled-system/css'

import ArrowRight from '#/components/icons/ArrowRight'
import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

export type NodeFlowStatus = 'incomplete' | 'complete' | 'error'
export type NodeFlowButtonState = NodeFlowStatus

export type NodeFlowMarkerProps = {
  status?: NodeFlowStatus
  completedIcon?: React.ReactNode
  incompleteIcon?: React.ReactNode
}

export type NodeFlowButtonProps = NodeFlowMarkerProps & {
  title: React.ReactNode
  helper?: React.ReactNode
  helperLeading?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode | null
  onClick?: () => void
  disabled?: boolean
  ariaLabel?: string
  ariaExpanded?: boolean
  state?: 'active' | 'available'
  showConnector?: boolean
  showConnectorTop?: boolean
  showConnectorBottom?: boolean
  disableOuterOffset?: boolean
  sx?: PandaStyleProp
  rowSx?: PandaStyleProp
  helperSx?: PandaStyleProp
}

type NodeFlowButtonComponent = React.FC<NodeFlowButtonProps> & {
  flowNodeMarker?: string
}

export const NODE_FLOW_OUTER_OFFSET = {
  mobile: '-0.75rem',
  desktop: '-0.875rem',
} as const

export const NODE_FLOW_ROW_INSET = {
  mobile: '0.75rem',
  desktop: '0.875rem',
} as const

export const NODE_FLOW_OUTER_WIDTH = {
  mobile: 'calc(100% + 1.5rem)',
  desktop: 'calc(100% + 1.75rem)',
} as const

export const NODE_FLOW_MARKER_COLOR = '#0D6044'
export const NODE_FLOW_MARKER_BOX_WIDTH = '0.75rem'
export const NODE_FLOW_MARKER_BOX_HEIGHT = '0.75rem'
export const NODE_FLOW_MARKER_CENTER_X = '0.375rem'

const DefaultCompletedMarker = () => (
  <CheckcircleCheckedFilled
    sx={{
      width: 12,
      height: 12,
      color: 'currentColor',
      flexShrink: 0,
    }}
  />
)

const DefaultIncompleteMarker = () => (
  <span
    className={css({
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
      flexShrink: 0,
    })}
  />
)

type NodeFlowRowStyles = {
  accentColor: string
  connectorColor: string
  borderColor: string
  backgroundColor: string
  textColor: string
  helperColor: string
  opacity: number
}

const getEnabledRowStyles = (status: NodeFlowStatus): NodeFlowRowStyles => {
  switch (status) {
    case 'complete':
      return {
        accentColor: '#0D6044',
        connectorColor: '#87BEA8',
        borderColor: '#0E6145',
        backgroundColor: 'rgba(255, 255, 255, 0.28)',
        textColor: '#111111',
        helperColor: '#111111',
        opacity: 1,
      }
    case 'error':
      return {
        accentColor: '#7A3D2B',
        connectorColor: 'rgba(122, 61, 43, 0.42)',
        borderColor: 'rgba(122, 61, 43, 0.45)',
        backgroundColor: 'rgba(122, 61, 43, 0.12)',
        textColor: '#111111',
        helperColor: '#5F291B',
        opacity: 1,
      }
    case 'incomplete':
    default:
      return {
        accentColor: '#0D6044',
        connectorColor: '#87BEA8',
        borderColor: '#0E6145',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        textColor: '#111111',
        helperColor: '#111111',
        opacity: 1,
      }
  }
}

export const getNodeFlowRowStyles = ({
  status = 'incomplete',
  disabled = false,
}: {
  status?: NodeFlowStatus
  disabled?: boolean
}): NodeFlowRowStyles => {
  if (disabled) {
    return {
      accentColor: 'rgba(17, 17, 17, 0.4)',
      connectorColor: 'rgba(17, 17, 17, 0.16)',
      borderColor: 'rgba(17, 17, 17, 0.14)',
      backgroundColor: 'rgba(17, 17, 17, 0.05)',
      textColor: 'rgba(17, 17, 17, 0.62)',
      helperColor: 'rgba(17, 17, 17, 0.62)',
      opacity: 0.88,
    }
  }

  return getEnabledRowStyles(status)
}

const NodeFlowButtonBase = ({
  title,
  helper,
  helperLeading,
  status = 'incomplete',
  completedIcon,
  incompleteIcon,
  leading,
  trailing,
  onClick,
  disabled = false,
  ariaLabel,
  ariaExpanded,
  disableOuterOffset = false,
  sx,
  rowSx,
  helperSx,
}: NodeFlowButtonProps) => {
  const isDisabled = disabled
  const isCompleted = status === 'complete'
  const isInteractive = !isDisabled && onClick != null
  const rowStyles = getNodeFlowRowStyles({ status, disabled: isDisabled })
  const resolvedMarker =
    leading ??
    (isCompleted
      ? (completedIcon ?? <DefaultCompletedMarker />)
      : (incompleteIcon ?? <DefaultIncompleteMarker />))
  const markerColor = rowStyles.accentColor
  const resolvedTrailing =
    trailing === undefined ? (
      <ArrowRight
        sx={{
          width: '0.375rem',
          height: '0.625rem',
          color: 'inherit',
        }}
      />
    ) : (
      trailing
    )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={cx(
        css({
          position: 'relative',
          width: '100%',
          minWidth: 0,
          color: '#111111',
        }),
        !disableOuterOffset
          ? css({
              ml: NODE_FLOW_OUTER_OFFSET,
              width: NODE_FLOW_OUTER_WIDTH,
            })
          : undefined,
        css(...pandaStylePropsToArray(sx))
      )}
      style={mergePandaStyleProps({ sx })}
    >
      <div
        className={css({
          position: 'relative',
          width: '100%',
          minWidth: 0,
        })}
      >
        <div
          onClick={isInteractive ? onClick : undefined}
          onKeyDown={handleKeyDown}
          role={isInteractive ? 'button' : undefined}
          tabIndex={isInteractive ? 0 : undefined}
          aria-disabled={isDisabled || undefined}
          aria-expanded={ariaExpanded}
          aria-label={
            ariaLabel ??
            (typeof title === 'string' || typeof title === 'number'
              ? String(title)
              : undefined)
          }
          className={cx(
            css({
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              minWidth: 0,
              minHeight: '1.5rem',
              px: NODE_FLOW_ROW_INSET,
              py: '0.25rem',
              borderRadius: '0.9375rem',
              border: `0.2px solid ${rowStyles.borderColor}`,
              backgroundColor: rowStyles.backgroundColor,
              color: rowStyles.textColor,
              opacity: rowStyles.opacity,
              cursor: isInteractive ? 'pointer' : 'default',
              transition:
                'background-color 160ms cubic-bezier(.2,0,.2,1), border-color 160ms cubic-bezier(.2,0,.2,1), transform 160ms cubic-bezier(.2,0,.2,1)',
              '&:hover': isInteractive
                ? {
                    transform: 'translateX(1px)',
                  }
                : undefined,
              '&:focus-visible': isInteractive
                ? {
                    outline: '2px solid rgba(17,17,17,0.4)',
                    outlineOffset: '2px',
                  }
                : undefined,
            }),
            css(...pandaStylePropsToArray(rowSx))
          )}
          style={mergePandaStyleProps({ sx: rowSx })}
        >
          <span
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '0 0 auto',
              width: NODE_FLOW_MARKER_BOX_WIDTH,
              height: NODE_FLOW_MARKER_BOX_HEIGHT,
              overflow: 'visible',
              color: markerColor,
            })}
          >
            {resolvedMarker}
          </span>

          <span
            className={css({
              flex: 1,
              minWidth: 0,
              fontSize: '0.625rem',
              fontWeight: 700,
              lineHeight: '1.125rem',
              letterSpacing: '0.1em',
              color: 'inherit',
              whiteSpace: 'normal',
            })}
          >
            {title}
          </span>

          {resolvedTrailing != null && (
            <span
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: rowStyles.accentColor,
              })}
            >
              {resolvedTrailing}
            </span>
          )}
        </div>
      </div>

      {helper && (
        <div
          className={cx(
            css({
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
              pt: '0.625rem',
              pl: '0.25rem',
              color: rowStyles.helperColor,
            }),
            css(...pandaStylePropsToArray(helperSx))
          )}
          style={mergePandaStyleProps({ sx: helperSx })}
        >
          {helperLeading && (
            <span
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'inherit',
              })}
            >
              {helperLeading}
            </span>
          )}

          <span
            className={css({
              minWidth: 0,
              fontSize: '0.625rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              letterSpacing: '0.1em',
              color: 'inherit',
            })}
          >
            {helper}
          </span>
        </div>
      )}
    </div>
  )
}

const NodeFlowButton = NodeFlowButtonBase as NodeFlowButtonComponent

NodeFlowButton.flowNodeMarker = 'flow-node'

export default NodeFlowButton
