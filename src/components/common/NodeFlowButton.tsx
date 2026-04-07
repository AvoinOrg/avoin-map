'use client'

import React from 'react'
import { Box, SxProps, Theme, Typography } from '@mui/material'

import ArrowRight from '#/components/icons/ArrowRight'

export type NodeFlowButtonState =
  | 'available'
  | 'active'
  | 'disabled'
  | 'complete'
  | 'error'

export type NodeFlowButtonProps = {
  title: React.ReactNode
  helper?: React.ReactNode
  helperLeading?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode | null
  onClick?: () => void
  state?: NodeFlowButtonState
  disabled?: boolean
  ariaLabel?: string
  ariaExpanded?: boolean
  showConnector?: boolean
  showConnectorTop?: boolean
  showConnectorBottom?: boolean
  disableOuterOffset?: boolean
  sx?: SxProps<Theme>
  rowSx?: SxProps<Theme>
  helperSx?: SxProps<Theme>
}

type NodeFlowButtonComponent = React.FC<NodeFlowButtonProps> & {
  flowNodeMarker?: string
}

const NODE_FLOW_OUTER_OFFSET = {
  mobile: '-0.75rem',
  desktop: '-0.875rem',
} as const

const NODE_FLOW_OUTER_WIDTH = {
  mobile: 'calc(100% + 1.5rem)',
  desktop: 'calc(100% + 1.75rem)',
} as const

const NODE_FLOW_CONNECTOR_X = '1.125rem'

const getRowStyles = (state: NodeFlowButtonState) => {
  switch (state) {
    case 'active':
      return {
        accentColor: '#0D6044',
        connectorColor: '#87BEA8',
        borderColor: 'transparent',
        backgroundColor: 'rgba(14, 97, 69, 0.2)',
        textColor: '#111111',
        helperColor: '#111111',
        opacity: 1,
      }
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
    case 'disabled':
      return {
        accentColor: 'rgba(13, 96, 68, 0.5)',
        connectorColor: 'rgba(135, 190, 168, 0.7)',
        borderColor: 'rgba(14, 97, 69, 0.22)',
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        textColor: 'rgba(17, 17, 17, 0.62)',
        helperColor: 'rgba(17, 17, 17, 0.62)',
        opacity: 0.8,
      }
    case 'available':
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

const NodeFlowButtonBase = ({
  title,
  helper,
  helperLeading,
  leading,
  trailing,
  onClick,
  state = 'available',
  disabled = false,
  ariaLabel,
  ariaExpanded,
  showConnector = false,
  showConnectorTop = false,
  showConnectorBottom,
  disableOuterOffset = false,
  sx,
  rowSx,
  helperSx,
}: NodeFlowButtonProps) => {
  const isDisabled = disabled || state === 'disabled'
  const isInteractive = !isDisabled && onClick != null
  const rowStyles = getRowStyles(state)
  const shouldShowConnectorBottom = showConnectorBottom ?? showConnector
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
    <Box
      sx={[
        {
          position: 'relative',
          width: '100%',
          minWidth: 0,
          color: '#111111',
        },
        !disableOuterOffset
          ? {
              ml: NODE_FLOW_OUTER_OFFSET,
              width: NODE_FLOW_OUTER_WIDTH,
            }
          : undefined,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minWidth: 0,
        }}
      >
        {showConnectorTop && (
          <Box
            sx={{
              position: 'absolute',
              left: NODE_FLOW_CONNECTOR_X,
              bottom: '100%',
              height: 'var(--flow-node-gap, 1.5rem)',
              transform: 'translateX(-50%)',
              width: '1px',
              backgroundColor: rowStyles.connectorColor,
              pointerEvents: 'none',
            }}
          />
        )}

        {shouldShowConnectorBottom && (
          <Box
            sx={{
              position: 'absolute',
              left: NODE_FLOW_CONNECTOR_X,
              top: '100%',
              height: 'var(--flow-node-gap, 1.5rem)',
              transform: 'translateX(-50%)',
              width: '1px',
              backgroundColor: rowStyles.connectorColor,
              pointerEvents: 'none',
            }}
          />
        )}

        <Box
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
          sx={[
            {
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              minWidth: 0,
              minHeight: '1.5rem',
              px: '0.75rem',
              py: '0.1875rem',
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
            },
            ...(Array.isArray(rowSx) ? rowSx : [rowSx]),
          ]}
        >
          {leading && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: rowStyles.accentColor,
              }}
            >
              {leading}
            </Box>
          )}

          <Typography
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
          </Typography>

          {resolvedTrailing != null && (
            <Box
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
        </Box>
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
              pl: '0.25rem',
              color: rowStyles.helperColor,
            },
            ...(Array.isArray(helperSx) ? helperSx : [helperSx]),
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

          <Typography
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
          </Typography>
        </Box>
      )}
    </Box>
  )
}

const NodeFlowButton = NodeFlowButtonBase as NodeFlowButtonComponent

NodeFlowButton.flowNodeMarker = 'flow-node'

export default NodeFlowButton
