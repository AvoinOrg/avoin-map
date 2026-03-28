'use client'

import React, { useId, useMemo, useState } from 'react'
import {
  Box,
  ButtonBase,
  Collapse,
  SxProps,
  Theme,
  Typography,
} from '@mui/material'

import ArrowDown from '#/components/icons/ArrowDown'
import CheckcircleChecked from '#/components/icons/CheckcircleChecked'

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
  expanded,
  defaultExpanded = false,
  disabled = false,
  onChange,
  children,
  sx,
  contentSx,
  ariaLabel,
  showConnector = false,
}: FlowNodeProps) => {
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded)
  const isExpanded = expanded ?? uncontrolledExpanded
  const isDisabled = disabled || state === 'disabled'
  const bodyId = useId()
  const hasBody = children != null

  const stateStyles = useMemo(() => {
    switch (state) {
      case 'active':
        return {
          borderColor: 'rgba(255, 255, 255, 0.36)',
          backgroundColor: 'rgba(255, 255, 255, 0.16)',
          markerBorderColor: '#ffffff',
          markerBackgroundColor: 'rgba(255, 255, 255, 0.22)',
          connectorColor: 'rgba(255, 255, 255, 0.45)',
        }
      case 'complete':
        return {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          markerBorderColor: '#ffffff',
          markerBackgroundColor: 'rgba(255, 255, 255, 0.2)',
          connectorColor: 'rgba(255, 255, 255, 0.4)',
        }
      case 'disabled':
        return {
          borderColor: 'rgba(255, 255, 255, 0.16)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          markerBorderColor: 'rgba(255, 255, 255, 0.45)',
          markerBackgroundColor: 'transparent',
          connectorColor: 'rgba(255, 255, 255, 0.2)',
        }
      case 'available':
      default:
        return {
          borderColor: 'rgba(255, 255, 255, 0.24)',
          backgroundColor: 'rgba(255, 255, 255, 0.09)',
          markerBorderColor: '#ffffff',
          markerBackgroundColor: 'transparent',
          connectorColor: 'rgba(255, 255, 255, 0.3)',
        }
    }
  }, [state])

  const handleToggle = () => {
    if (isDisabled) {
      return
    }

    if (!hasBody) {
      onClick?.()
      return
    }

    const nextExpanded = !isExpanded

    if (expanded == null) {
      setUncontrolledExpanded(nextExpanded)
    }

    onChange?.(nextExpanded)
  }

  const defaultMarker = (() => {
    if (state === 'complete') {
      return (
        <CheckcircleChecked
          fillColor="rgba(255,255,255,0.32)"
          sx={{ width: 24, height: 24 }}
        />
      )
    }

    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${stateStyles.markerBorderColor}`,
          backgroundColor: stateStyles.markerBackgroundColor,
          boxSizing: 'border-box',
        }}
      />
    )
  })()

  return (
    <Box
      sx={[
        {
          display: 'flex',
          gap: 1.25,
          position: 'relative',
          width: '100%',
          color: '#fff',
          opacity: isDisabled ? 0.75 : 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          width: '1.75rem',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          pt: 1,
        }}
      >
        {showConnector && (
          <Box
            sx={{
              position: 'absolute',
              top: '2.25rem',
              bottom: '-1rem',
              width: '2px',
              borderRadius: '999px',
              backgroundColor: stateStyles.connectorColor,
            }}
          />
        )}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            color: '#fff',
          }}
        >
          {leading ?? defaultMarker}
        </Box>
      </Box>

      <Box
        sx={[
          {
            flex: 1,
            minWidth: 0,
            borderRadius: '1rem',
            border: `1px solid ${stateStyles.borderColor}`,
            backgroundColor: stateStyles.backgroundColor,
            backdropFilter: 'blur(6px)',
          },
          ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
        ]}
      >
        <ButtonBase
          onClick={handleToggle}
          disabled={isDisabled}
          aria-expanded={hasBody ? isExpanded : undefined}
          aria-controls={hasBody ? bodyId : undefined}
          aria-label={
            ariaLabel ??
            (typeof title === 'string' || typeof title === 'number'
              ? String(title)
              : undefined)
          }
          sx={{
            width: '100%',
            px: '1rem',
            py: '0.875rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1,
            textAlign: 'left',
            borderRadius: 'inherit',
            color: 'inherit',
            '&.Mui-disabled': {
              color: 'inherit',
            },
          }}
        >
          <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography
              sx={{
                typography: 'h4',
                color: 'inherit',
                whiteSpace: 'normal',
                lineHeight: 1.2,
              }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                sx={{
                  typography: 'body2',
                  color: 'inherit',
                  opacity: 0.9,
                  whiteSpace: 'normal',
                }}
              >
                {description}
              </Typography>
            )}
            {helper && (
              <Typography
                sx={{
                  typography: 'body3',
                  color: 'inherit',
                  opacity: 0.75,
                  whiteSpace: 'normal',
                }}
              >
                {helper}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            {trailing}
            {hasBody && (
              <ArrowDown
                sx={{
                  width: 12,
                  height: 8,
                  color: 'inherit',
                  opacity: isDisabled ? 0.5 : 1,
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 160ms ease',
                }}
              />
            )}
          </Box>
        </ButtonBase>

        {hasBody && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box
              id={bodyId}
              sx={{
                px: '1rem',
                pb: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {children}
            </Box>
          </Collapse>
        )}
      </Box>
    </Box>
  )
}

const FlowNode = FlowNodeBase as FlowNodeComponent

FlowNode.flowNodeMarker = 'flow-node'

export default FlowNode
