'use client'

import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css, cx } from 'styled-system/css'

import type { PandaStyleObject, PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { Box } from '#/components/common/PandaBox'
import SimpleTooltip from '#/components/common/SimpleTooltip'

export type SidebarPanelExtensionDefaultTabIconProps = {
  styleProps?: PandaStyleProp
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
  styleProps?: PandaStyleProp
  iconSx?: PandaStyleProp
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

const getTabIconButtonSx = (selected: boolean): PandaStyleObject => ({
  width: '2.75rem',
  minWidth: '2.75rem',
  height: '2.75rem',
  p: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
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
    backgroundColor: '#f4f4f4',
    transform: 'translateY(-1px)',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-primary-main)',
    outlineOffset: '2px',
  },
})

export const SidebarPanelExtensionDefaultTabIcon = ({
  styleProps,
}: SidebarPanelExtensionDefaultTabIconProps) => {
  return (
    <Box
      aria-hidden="true"
      data-testid="sidebar-panel-extension-default-tab-icon"
      styleProps={[
        {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 0.375rem)',
          gridTemplateRows: 'repeat(2, 0.375rem)',
          gap: '0.1875rem',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'currentColor',
        },
        ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
      ]}
    >
      {[0, 1, 2, 3].map((index) => (
        <Box
          key={index}
          component="span"
          styleProps={{
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
  styleProps,
  iconSx,
}: SidebarPanelExtensionTabIconButtonProps) => {
  const accessibleLabel = getSidebarPanelExtensionTabAccessibleLabel({
    tabId,
    tabName,
    ariaLabel,
  })
  const tooltipTitle =
    tabName == null || tabName === '' ? accessibleLabel : tabName
  const buttonSx = getTabIconButtonSx(selected)

  return (
    <SimpleTooltip title={tooltipTitle} side="right">
      <BaseButton
        type="button"
        id={buttonId}
        aria-label={accessibleLabel}
        aria-selected={selected}
        aria-controls={controlsId}
        role="tab"
        tabIndex={selected ? 0 : -1}
        onClick={() => onSelect?.(tabId)}
        className={cx(
          css(buttonSx, ...pandaStylePropsToArray(styleProps))
        )}
        style={mergePandaStyleProps({
          styleProps: [buttonSx, ...pandaStylePropsToArray(styleProps)],
        })}
      >
        <Box
          component="span"
          styleProps={[
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
            ...pandaStylePropsToArray(iconSx),
          ]}
        >
          {icon ?? <SidebarPanelExtensionDefaultTabIcon />}
        </Box>
      </BaseButton>
    </SimpleTooltip>
  )
}

export default SidebarPanelExtensionTabIconButton
