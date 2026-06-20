'use client'

import React from 'react'

import {
  Box,
  toSxArray,
} from '#/common/style/theme/system'
import type { AppSxProps, AppTheme } from '#/common/style/theme/system'
import { IconButton } from '#/components/common/Button'

import { SidebarPanelExtensionTooltip } from './SidebarPanelExtensionTooltip'

export type SidebarPanelExtensionDefaultTabIconProps = {
  sx?: AppSxProps
}

export type SidebarPanelExtensionTabIconButtonProps = {
  tabId: string
  tabName: React.ReactNode
  ariaLabel?: string
  icon?: React.ReactNode
  selected?: boolean
  buttonId?: string
  controlsId?: string
  onSelect?: (tabId: string) => void
  sx?: AppSxProps
  iconSx?: AppSxProps
}

export const getSidebarPanelExtensionTabAccessibleLabel = ({
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

export const SidebarPanelExtensionDefaultTabIcon = ({
  sx,
}: SidebarPanelExtensionDefaultTabIconProps) => {
  return (
    <Box
      aria-hidden="true"
      data-testid="sidebar-panel-extension-default-tab-icon"
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
        ...toSxArray(sx),
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

export const SidebarPanelExtensionTabIconButton = ({
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
}: SidebarPanelExtensionTabIconButtonProps) => {
  const accessibleLabel = getSidebarPanelExtensionTabAccessibleLabel({
    tabId,
    tabName,
    ariaLabel,
  })
  const tooltipTitle =
    tabName == null || tabName === '' ? accessibleLabel : tabName

  return (
    <SidebarPanelExtensionTooltip title={tooltipTitle}>
      {(tooltipTriggerProps) => (
      <IconButton
        {...tooltipTriggerProps}
        id={buttonId}
        aria-label={accessibleLabel}
        aria-selected={selected}
        aria-controls={controlsId}
        role="tab"
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect?.(tabId)}
        type="button"
        size="small"
        sx={[
          (theme: AppTheme) => ({
            width: '2.75rem',
            minWidth: '2.75rem',
            height: '2.75rem',
            p: 0,
            borderRadius: '0.625rem',
            color: '#111111',
            backgroundColor: selected ? '#e8e8e8' : '#ffffff',
            boxShadow: selected
              ? '0 8px 18px rgba(17, 17, 17, 0.14)'
              : '0 2px 8px rgba(17, 17, 17, 0.12)',
            border: `1px solid ${
              selected ? '#d8d8d8' : 'rgba(17, 17, 17, 0.08)'
            }`,
            transition:
              'background-color 160ms cubic-bezier(.2,0,.2,1), color 160ms cubic-bezier(.2,0,.2,1), transform 160ms cubic-bezier(.2,0,.2,1)',
            '&:hover': {
              color: '#111111',
              backgroundColor: selected ? '#f4f4f4' : '#f4f4f4',
              transform: 'translateY(-1px)',
            },
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
          }),
          ...toSxArray(sx),
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
            ...toSxArray(iconSx),
          ]}
        >
          {icon ?? <SidebarPanelExtensionDefaultTabIcon />}
        </Box>
      </IconButton>
      )}
    </SidebarPanelExtensionTooltip>
  )
}

export default SidebarPanelExtensionTabIconButton
