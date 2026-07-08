'use client'

import React from 'react'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme'
import { ButtonBase } from '#/components/common/Button'
import ArrowRight from '#/components/icons/ArrowRight'
import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'

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
  dataSlot?: string
  ariaLabel?: string
  ariaExpanded?: boolean
  showConnector?: boolean
  showConnectorTop?: boolean
  showConnectorBottom?: boolean
  disableOuterOffset?: boolean
  sx?: AppSxProps
  rowSx?: AppSxProps
  helperSx?: AppSxProps
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
export const NODE_FLOW_BELOW_TEXT_INSET = {
  mobile: `calc(${NODE_FLOW_ROW_INSET.mobile} + ${NODE_FLOW_MARKER_CENTER_X})`,
  desktop: `calc(${NODE_FLOW_ROW_INSET.desktop} + ${NODE_FLOW_MARKER_CENTER_X})`,
} as const

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
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
      flexShrink: 0,
    }}
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
  dataSlot,
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
  const hasCustomTrailing = trailing !== undefined

  const rowAriaLabel =
    ariaLabel ??
    (typeof title === 'string' || typeof title === 'number'
      ? String(title)
      : undefined)

  const rowContent = (
    <>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
          width: NODE_FLOW_MARKER_BOX_WIDTH,
          height: NODE_FLOW_MARKER_BOX_HEIGHT,
          overflow: 'visible',
          color: markerColor,
        }}
      >
        {resolvedMarker}
      </Box>

      <Box
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: '0.625rem',
          fontWeight: 700,
          lineHeight: '1.125rem',
          letterSpacing: '0.1em',
          color: 'inherit',
          whiteSpace: 'normal',
        }}
      >
        {title}
      </Box>

      {resolvedTrailing != null && (
        <Box
          onClick={
            hasCustomTrailing
              ? (event) => {
                  event.stopPropagation()
                }
              : undefined
          }
          onKeyDown={
            hasCustomTrailing
              ? (event) => {
                  event.stopPropagation()
                }
              : undefined
          }
          onKeyUp={
            hasCustomTrailing
              ? (event) => {
                  event.stopPropagation()
                }
              : undefined
          }
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: rowStyles.accentColor,
          }}
        >
          {resolvedTrailing}
        </Box>
      )}
    </>
  )

  const rowBaseSx: AppSxProps = [
    {
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
      textAlign: 'left',
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
    },
    ...toSxArray(rowSx),
  ]

  return (
    <Box
      sx={[
        {
          position: 'relative',
          width: '100%',
          minWidth: 0,
          color: '#111111',
        },
        ...(!disableOuterOffset
          ? [
              {
                ml: NODE_FLOW_OUTER_OFFSET,
                width: NODE_FLOW_OUTER_WIDTH,
              },
            ]
          : []),
        ...toSxArray(sx),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
        }}
      >
        {isInteractive ? (
          <ButtonBase
            component="div"
            role="button"
            data-slot={dataSlot}
            onClick={onClick}
            aria-expanded={ariaExpanded}
            aria-label={rowAriaLabel}
            sx={rowBaseSx}
          >
            {rowContent}
          </ButtonBase>
        ) : (
          <Box
            data-slot={dataSlot}
            aria-disabled={isDisabled || undefined}
            aria-expanded={ariaExpanded}
            aria-label={rowAriaLabel}
            sx={rowBaseSx}
          >
            {rowContent}
          </Box>
        )}
      </Box>

      {helper && (
        <Box
          sx={[
            {
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
              pt: '0.625rem',
              pl: NODE_FLOW_BELOW_TEXT_INSET,
              pr: NODE_FLOW_ROW_INSET,
              boxSizing: 'border-box',
              color: rowStyles.helperColor,
            },
            ...toSxArray(helperSx),
          ]}
        >
          {helperLeading && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'inherit',
              }}
            >
              {helperLeading}
            </Box>
          )}

          <Box
            component="span"
            sx={{
              minWidth: 0,
              fontSize: '0.625rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              letterSpacing: '0.1em',
              color: 'inherit',
            }}
          >
            {helper}
          </Box>
        </Box>
      )}
    </Box>
  )
}

const NodeFlowButton = NodeFlowButtonBase as NodeFlowButtonComponent

NodeFlowButton.flowNodeMarker = 'flow-node'

export default NodeFlowButton
