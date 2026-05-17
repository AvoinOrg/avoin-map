'use client'

import React from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'

export type PanelSidebarDefaultTabIconProps = {
  sx?: SxProps<Theme>
}

export type PanelSidebarTabIconButtonProps = {
  tabId: string
  tabName: React.ReactNode
  ariaLabel?: string
  icon?: React.ReactNode
  selected?: boolean
  buttonId?: string
  controlsId?: string
  onSelect?: (tabId: string) => void
  sx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
}

export const getPanelSidebarTabAccessibleLabel = ({
  tabId,
  tabName,
  ariaLabel,
}: {
  tabId: string
  tabName: React.ReactNode
  ariaLabel?: string
}) => {
  if (ariaLabel != null && ariaLabel.trim() !== '') {
    return ariaLabel
  }

  if (typeof tabName === 'string' && tabName.trim() !== '') {
    return tabName
  }

  return tabId
}

export const PanelSidebarDefaultTabIcon = ({
  sx,
}: PanelSidebarDefaultTabIconProps) => {
  return (
    <Box
      aria-hidden="true"
      data-testid="panel-sidebar-default-tab-icon"
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 0.375rem)',
          gridTemplateRows: 'repeat(2, 0.375rem)',
          gap: '0.1875rem',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'currentColor',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {[0, 1, 2, 3].map((index) => (
        <Box
          key={index}
          component="span"
          sx={{
            width: '0.375rem',
            height: '0.375rem',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }}
        />
      ))}
    </Box>
  )
}

export const PanelSidebarTabIconButton = ({
  tabId,
  tabName,
  ariaLabel,
  icon,
  selected = false,
  buttonId,
  controlsId,
  onSelect,
  sx,
  iconSx,
}: PanelSidebarTabIconButtonProps) => {
  const accessibleLabel = getPanelSidebarTabAccessibleLabel({
    tabId,
    tabName,
    ariaLabel,
  })
  const tooltipTitle =
    tabName == null || tabName === '' ? accessibleLabel : tabName

  return (
    <Tooltip title={tooltipTitle} placement="right" arrow disableInteractive>
      <IconButton
        id={buttonId}
        aria-label={accessibleLabel}
        aria-selected={selected}
        aria-controls={controlsId}
        role="tab"
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect?.(tabId)}
        size="small"
        sx={[
          (theme: Theme) => ({
            width: '2.75rem',
            minWidth: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.625rem',
            color: selected ? '#ffffff' : '#111111',
            backgroundColor: selected ? '#111111' : '#ffffff',
            boxShadow: selected
              ? '0 10px 24px rgba(17, 17, 17, 0.18)'
              : '0 2px 8px rgba(17, 17, 17, 0.12)',
            border: `1px solid ${
              selected ? '#111111' : 'rgba(17, 17, 17, 0.08)'
            }`,
            transition:
              'background-color 160ms cubic-bezier(.2,0,.2,1), color 160ms cubic-bezier(.2,0,.2,1), transform 160ms cubic-bezier(.2,0,.2,1)',
            '&:hover': {
              color: selected ? '#ffffff' : '#111111',
              backgroundColor: selected ? '#111111' : '#f4f4f4',
              transform: 'translateY(-1px)',
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Box
          component="span"
          sx={[
            {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.25rem',
              height: '1.25rem',
              '& svg': {
                width: '1.25rem',
                height: '1.25rem',
              },
            },
            ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
          ]}
        >
          {icon ?? <PanelSidebarDefaultTabIcon />}
        </Box>
      </IconButton>
    </Tooltip>
  )
}

export default PanelSidebarTabIconButton
