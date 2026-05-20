'use client'

import React, { useMemo } from 'react'
import { Box, ButtonBase, SxProps, Theme, Typography } from '@mui/material'

import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'

export type FlowNodeState = 'active' | 'available' | 'disabled' | 'complete'

export type FlowNodeProps = {
  title: React.ReactNode
  description?: React.ReactNode
  helper?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode
  onClick?: () => void
  state?: FlowNodeState
  expanded?: boolean
  defaultExpanded?: boolean
  disabled?: boolean
  onChange?: (expanded: boolean) => void
  children?: React.ReactNode
  sx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
  bodySx?: SxProps<Theme>
  ariaLabel?: string
  showConnector?: boolean
}

type FlowNodeComponent = React.FC<FlowNodeProps> & {
  flowNodeMarker?: string
}

const FlowNodeBase = ({
  title,
  description,
  helper,
  leading,
  trailing,
  onClick,
  state = 'available',
  disabled = false,
  children,
  sx,
  contentSx,
  bodySx,
  ariaLabel,
  showConnector = false,
}: FlowNodeProps) => {
  const hasBody = children != null
  const isDisabled = disabled || state === 'disabled'
  const isInteractive = !isDisabled && onClick != null

  const stateStyles = useMemo(() => {
    switch (state) {
      case 'active':
        return {
          headerBackgroundColor: 'rgba(14, 97, 69, 0.2)',
          markerColor: '#2C8E74',
          connectorColor: '#87BEA8',
          titleColor: '#111111',
        }
      case 'complete':
        return {
          headerBackgroundColor: 'transparent',
          markerColor: '#2C8E74',
          connectorColor: '#87BEA8',
          titleColor: '#111111',
        }
      case 'disabled':
        return {
          headerBackgroundColor: 'transparent',
          markerColor: '#2C8E74',
          connectorColor: '#87BEA8',
          titleColor: '#111111',
        }
      case 'available':
      default:
        return {
          headerBackgroundColor: 'transparent',
          markerColor: '#2C8E74',
          connectorColor: '#87BEA8',
          titleColor: '#111111',
        }
    }
  }, [state])

  const marker = (() => {
    if (state === 'complete') {
      return (
        <CheckcircleCheckedFilled
          sx={{
            width: 12,
            height: 12,
            color: '#2C8E74',
          }}
        />
      )
    }

    return (
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: stateStyles.markerColor,
        }}
      />
    )
  })()

  const headerContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        width: '100%',
        minWidth: 0,
      }}
    >
      {leading && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: stateStyles.markerColor,
          }}
        >
          {leading}
        </Box>
      )}

      <Box
        sx={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: description || helper ? '0.125rem' : 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 700,
            lineHeight: '1.125rem',
            letterSpacing: '0.1em',
            color: stateStyles.titleColor,
            whiteSpace: 'normal',
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 400,
              lineHeight: '0.875rem',
              letterSpacing: '0.04em',
              color: stateStyles.titleColor,
              whiteSpace: 'normal',
            }}
          >
            {description}
          </Typography>
        )}
        {helper && (
          <Typography
            sx={{
              fontSize: '0.625rem',
              fontWeight: 400,
              lineHeight: '0.875rem',
              letterSpacing: '0.04em',
              color: stateStyles.titleColor,
              whiteSpace: 'normal',
            }}
          >
            {helper}
          </Typography>
        )}
      </Box>

      {trailing && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: stateStyles.titleColor,
          }}
        >
          {trailing}
        </Box>
      )}
    </Box>
  )

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          position: 'relative',
          width: '100%',
          color: '#111111',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          width: '0.5rem',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          pt: state === 'active' ? '0.5rem' : '0.4375rem',
        }}
      >
        {showConnector && (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: state === 'complete' ? '0.6rem' : '0.5rem',
              bottom: 'calc(var(--flow-node-gap, 1rem) * -1)',
              transform: 'translateX(-50%)',
              width: '1px',
              backgroundColor: stateStyles.connectorColor,
            }}
          />
        )}

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: state === 'complete' ? 12 : 8,
            height: state === 'complete' ? 12 : 8,
          }}
        >
          {marker}
        </Box>
      </Box>

      <Box
        sx={[
          {
            flex: 1,
            minWidth: 0,
          },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        {isInteractive ? (
          <ButtonBase
            onClick={onClick}
            aria-label={
              ariaLabel ??
              (typeof title === 'string' || typeof title === 'number'
                ? String(title)
                : undefined)
            }
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              textAlign: 'left',
              borderRadius: state === 'active' ? '0.9375rem' : 0,
              px: state === 'active' ? '0.75rem' : 0,
              py: state === 'active' ? '0.125rem' : 0,
              backgroundColor:
                state === 'active'
                  ? stateStyles.headerBackgroundColor
                  : 'transparent',
              color: 'inherit',
            }}
          >
            {headerContent}
          </ButtonBase>
        ) : (
          <Box
            sx={{
              borderRadius: state === 'active' ? '0.9375rem' : 0,
              px: state === 'active' ? '0.75rem' : 0,
              py: state === 'active' ? '0.125rem' : 0,
              backgroundColor:
                state === 'active'
                  ? stateStyles.headerBackgroundColor
                  : 'transparent',
            }}
          >
            {headerContent}
          </Box>
        )}

        {hasBody && (
          <Box
            sx={[
              {
                pt: '1rem',
                pl: '0.0625rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              },
              ...(Array.isArray(bodySx) ? bodySx : [bodySx]),
            ]}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  )
}

const FlowNode = FlowNodeBase as FlowNodeComponent

FlowNode.flowNodeMarker = 'flow-node'

export default FlowNode
