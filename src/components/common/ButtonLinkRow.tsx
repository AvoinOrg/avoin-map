'use client'

import React from 'react'

import {
  AppRouteLink,
  type AppRouteLinkProps,
} from '#/common/navigation/appRouteLinks'
import {
  AppSxProps,
  AppTheme,
  Box,
  toSxArray,
} from '#/common/style/theme'
import { SHARED_CONTROL_BORDER_RADIUS } from '#/common/style/theme/constants'
import { CircleArrowRight } from '#/components/icons'

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

export type ButtonLinkRowProps = Omit<
  AppRouteLinkProps,
  'children' | 'sx'
> & {
  label: React.ReactNode
  sx?: AppSxProps
  labelSx?: AppSxProps
  iconSx?: AppSxProps
}

const toButtonLinkRowSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as AppSxItem[]

const BASE_ROW_SX = {
  width: '100%',
  minHeight: '2.5rem',
  boxSizing: 'border-box',
  px: '1rem',
  py: '0.625rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  border: '1px solid',
  borderColor: (theme: AppTheme) => theme.palette.neutral.main,
  borderRadius: SHARED_CONTROL_BORDER_RADIUS,
  backgroundColor: (theme: AppTheme) =>
    theme.palette.neutral.lighter ?? theme.palette.common.white,
  color: (theme: AppTheme) => theme.palette.neutral.darker ?? '#111111',
  textAlign: 'left',
  textDecoration: 'none',
  WebkitTapHighlightColor: 'transparent',
  transition:
    'background-color 120ms ease, border-color 120ms ease, color 120ms ease',
  '&:hover': {
    backgroundColor: (theme: AppTheme) => theme.palette.primary.lighter,
    borderColor: (theme: AppTheme) => theme.palette.primary.dark,
    color: (theme: AppTheme) => theme.palette.neutral.darker ?? '#111111',
    textDecoration: 'none',
  },
  '&:focus-visible, &[data-focus-visible="true"]': {
    outline: (theme: AppTheme) =>
      `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2,
  },
} satisfies AppSxItem

const LABEL_SX = {
  flexGrow: 1,
  minWidth: 0,
  color: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: 1.35,
  letterSpacing: 0,
  overflowWrap: 'anywhere',
  whiteSpace: 'normal',
} satisfies AppSxItem

const ICON_SX = {
  width: '1.5rem',
  height: '1.5rem',
  color: 'currentColor',
  flexShrink: 0,
} satisfies AppSxItem

export const ButtonLinkRow = React.forwardRef<
  HTMLAnchorElement,
  ButtonLinkRowProps
>(({ label, sx, labelSx, iconSx, ...linkProps }, ref) => {
  return (
    <AppRouteLink
      {...linkProps}
      ref={ref}
      sx={[BASE_ROW_SX, ...toButtonLinkRowSxArray(sx)]}
    >
      <Box
        component="span"
        sx={[LABEL_SX, ...toButtonLinkRowSxArray(labelSx)]}
      >
        {label}
      </Box>
      <CircleArrowRight
        aria-hidden="true"
        sx={[ICON_SX, ...toButtonLinkRowSxArray(iconSx)]}
      />
    </AppRouteLink>
  )
})

ButtonLinkRow.displayName = 'ButtonLinkRow'
