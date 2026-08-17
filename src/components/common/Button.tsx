import React from 'react'
import { Button as BaseUIButton } from '@base-ui/react/button'

import {
  AppSxProps,
  AppTheme,
  Box,
  toSxArray,
} from '#/common/style/theme'
import {
  SHARED_CONTROL_BORDER_RADIUS,
  SHARED_CONTROL_INFINITE_BORDER_RADIUS,
} from '#/common/style/theme/constants'

type ButtonComponent = React.ElementType
type ButtonVariant = 'text' | 'contained' | 'outlined'
type ButtonColor = 'primary' | 'neutral' | 'inherit'
type ButtonSize = 'small' | 'medium' | 'large'
type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

type ButtonBaseNativeProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'color'
> &
  Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    | 'type'
    | 'form'
    | 'formAction'
    | 'formEncType'
    | 'formMethod'
    | 'formNoValidate'
    | 'formTarget'
    | 'name'
    | 'value'
  > &
  Pick<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    | 'download'
    | 'href'
    | 'hrefLang'
    | 'referrerPolicy'
    | 'rel'
    | 'target'
  >

export type ButtonBaseProps = ButtonBaseNativeProps & {
  component?: ButtonComponent
  disabled?: boolean
  disableRipple?: boolean
  focusableWhenDisabled?: boolean
  sx?: AppSxProps
}

export type ButtonProps = Omit<ButtonBaseProps, 'color'> & {
  color?: ButtonColor
  endIcon?: React.ReactNode
  fullWidth?: boolean
  size?: ButtonSize
  startIcon?: React.ReactNode
  variant?: ButtonVariant
}

export type IconButtonProps = Omit<ButtonBaseProps, 'color'> & {
  color?: ButtonColor | 'default'
  size?: ButtonSize
}

const disabledSelector = '&:disabled, &[data-disabled], &[aria-disabled="true"]'
const focusVisibleSelector = '&:focus-visible, &[data-focus-visible="true"]'
const activeSelector = '&:active, &[data-active="true"], &[aria-pressed="true"]'

const toButtonSxArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]

const baseResetSx = {
  m: 0,
  p: 0,
  border: 0,
  boxSizing: 'border-box',
  appearance: 'none',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  textAlign: 'inherit',
  textDecoration: 'none',
  WebkitTapHighlightColor: 'transparent',
  userSelect: 'none',
  '&::-moz-focus-inner': {
    borderStyle: 'none',
  },
  [focusVisibleSelector]: {
    outline: (theme: AppTheme) =>
      `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2,
  },
  [disabledSelector]: {
    cursor: 'default',
    opacity: 0.5,
    pointerEvents: 'none',
  },
} satisfies AppSxItem

const buttonSizeSx: Record<ButtonSize, AppSxItem> = {
  small: {
    minHeight: 30,
    px: 1.25,
    py: 0.5,
    fontSize: '0.8125rem',
    lineHeight: 1.35,
  },
  medium: {
    minHeight: 36,
    px: 1.75,
    py: 0.75,
    fontSize: '0.875rem',
    lineHeight: 1.4,
  },
  large: {
    minHeight: 44,
    px: 2.25,
    py: 1,
    fontSize: '1rem',
    lineHeight: 1.45,
  },
}

const iconButtonSizeSx: Record<ButtonSize, AppSxItem> = {
  small: {
    width: 32,
    minWidth: 32,
    height: 32,
    fontSize: '1rem',
  },
  medium: {
    width: 40,
    minWidth: 40,
    height: 40,
    fontSize: '1.125rem',
  },
  large: {
    width: 48,
    minWidth: 48,
    height: 48,
    fontSize: '1.25rem',
  },
}

const getButtonVariantSx =
  ({
    color,
    variant,
  }: {
    color: ButtonColor
    variant: ButtonVariant
  }): AppSxItem =>
  (theme: AppTheme) => {
    const neutral = theme.palette.neutral
    const primary = theme.palette.primary
    const actionHover = theme.palette.action.hover
    const actionSelected = theme.palette.action.selected
    const disabledColor = theme.palette.text.disabled

    const colorTokens = {
      inherit: {
        text: 'inherit',
        border: 'currentColor',
        containedBackground: 'transparent',
        hoverBackground: actionHover,
        activeBackground: actionSelected,
      },
      neutral: {
        text: neutral.darker,
        border: neutral.main,
        containedBackground: neutral.light,
        hoverBackground: neutral.main,
        activeBackground: neutral.dark,
      },
      primary: {
        text: neutral.darker,
        border: primary.dark,
        containedBackground: primary.light,
        hoverBackground: primary.lighter,
        activeBackground: primary.main,
      },
    }[color]

    if (variant === 'text') {
      return {
        color: colorTokens.text,
        border: '1px solid transparent',
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: colorTokens.hoverBackground,
        },
        [activeSelector]: {
          backgroundColor: colorTokens.activeBackground,
        },
        [disabledSelector]: {
          color: disabledColor,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
      }
    }

    if (variant === 'outlined') {
      return {
        color: colorTokens.text,
        border: '1px solid',
        borderColor: colorTokens.border,
        backgroundColor: 'transparent',
        boxShadow: '1px 1px 7px 0px #EEECEC',
        '&:hover': {
          backgroundColor: colorTokens.hoverBackground,
        },
        [activeSelector]: {
          backgroundColor: colorTokens.activeBackground,
        },
        [disabledSelector]: {
          color: disabledColor,
          backgroundColor: 'transparent',
          borderColor: neutral.main,
          boxShadow: 'none',
        },
      }
    }

    return {
      color: colorTokens.text,
      border: '1px solid',
      borderColor: colorTokens.border,
      backgroundColor: colorTokens.containedBackground,
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: colorTokens.hoverBackground,
      },
      [activeSelector]: {
        backgroundColor: colorTokens.activeBackground,
      },
      [disabledSelector]: {
        color: disabledColor,
        backgroundColor: neutral.light,
        borderColor: neutral.main,
        boxShadow: 'none',
      },
    }
  }

const iconButtonColorSx =
  (color: IconButtonProps['color']): AppSxItem =>
  (theme: AppTheme) => {
    const resolvedColor = color === 'default' ? 'neutral' : color

    return {
      color:
        resolvedColor === 'primary'
          ? theme.palette.primary.dark
          : resolvedColor === 'neutral'
            ? theme.palette.neutral.darker
            : 'inherit',
      backgroundColor: 'transparent',
      border: '1px solid transparent',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      [activeSelector]: {
        backgroundColor: theme.palette.action.selected,
      },
      [disabledSelector]: {
        color: theme.palette.text.disabled,
        backgroundColor: 'transparent',
      },
    }
  }

const iconSlotSx = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  lineHeight: 0,
} satisfies AppSxItem

const isNativeButtonComponent = ({
  component,
  href,
}: {
  component?: ButtonComponent
  href?: ButtonBaseProps['href']
}) => (component == null && href == null) || component === 'button'

const isAnchorLikeComponent = ({
  component,
  href,
}: {
  component?: ButtonComponent
  href?: ButtonBaseProps['href']
}) => component === 'a' || href != null

export const ButtonBase = React.forwardRef<HTMLElement, ButtonBaseProps>(
  function ButtonBase(
    {
      component,
      disableRipple,
      href,
      role,
      sx,
      ...props
    },
    ref
  ) {
    void disableRipple

    const nativeButton = isNativeButtonComponent({ component, href })
    const anchorLike = isAnchorLikeComponent({ component, href })
    const renderedComponent = component ?? (anchorLike ? 'a' : 'button')
    const roleProps =
      role !== undefined ? { role } : anchorLike ? { role: undefined } : {}
    const baseButtonProps = {
      ...props,
      ...roleProps,
      href,
      nativeButton,
      ref,
      render: (
        renderProps: React.HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<HTMLElement>
        }
      ) => (
        <Box
          {...renderProps}
          component={renderedComponent}
          sx={[baseResetSx, ...toButtonSxArray(sx)]}
        />
      ),
    } as React.ComponentPropsWithoutRef<typeof BaseUIButton> & {
      href?: ButtonBaseProps['href']
      ref: React.Ref<HTMLElement>
    }

    return React.createElement(BaseUIButton, baseButtonProps)
  }
)

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      color = 'primary',
      endIcon,
      fullWidth = false,
      size = 'medium',
      startIcon,
      sx,
      variant = 'text',
      ...props
    },
    ref
  ) {
    return (
      <ButtonBase
        {...props}
        ref={ref as React.Ref<HTMLElement>}
        sx={[
          {
            width: fullWidth ? '100%' : 'auto',
            minWidth: 64,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
            fontWeight: 500,
            letterSpacing: 0,
            textAlign: 'center',
            textTransform: 'none',
            verticalAlign: 'middle',
            transition:
              'background-color 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease',
          },
          buttonSizeSx[size],
          getButtonVariantSx({ color, variant }),
          ...toButtonSxArray(sx),
        ]}
      >
        {startIcon && (
          <Box component="span" sx={iconSlotSx}>
            {startIcon}
          </Box>
        )}
        {children}
        {endIcon && (
          <Box component="span" sx={iconSlotSx}>
            {endIcon}
          </Box>
        )}
      </ButtonBase>
    )
  }
)

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      children,
      color = 'default',
      size = 'medium',
      sx,
      ...props
    },
    ref
  ) {
    return (
      <ButtonBase
        {...props}
        ref={ref as React.Ref<HTMLElement>}
        sx={[
          {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: SHARED_CONTROL_BORDER_RADIUS,
            lineHeight: 1,
            textAlign: 'center',
            transition:
              'background-color 120ms ease, border-color 120ms ease, color 120ms ease, box-shadow 120ms ease',
          },
          iconButtonSizeSx[size],
          iconButtonColorSx(color),
          ...toButtonSxArray(sx),
        ]}
      >
        {children}
      </ButtonBase>
    )
  }
)
