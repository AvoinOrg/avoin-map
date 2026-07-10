import React, { useMemo, useState } from 'react'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme'
import {
  Button,
  IconButton,
  type ButtonProps,
} from '#/components/common/Button'
import AppTooltip from '#/components/common/AppTooltip'
import QuestionCircleOutline from '#/components/icons/QuestionCircleOutline'

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
type IconElement = React.ReactElement<{ sx?: AppSxProps }>

type IconTextButtonProps = ButtonProps & {
  icon: IconElement
  text: React.ReactNode
  helperText?: React.ReactNode
  helperAriaLabel?: string
  textSx?: AppSxProps
  iconWrapperSx?: AppSxProps
}

type BaseUITriggerEvent = React.MouseEvent<HTMLElement> & {
  preventBaseUIHandler?: () => void
}

const toAppSxItemArray = (sx?: AppSxProps) =>
  toSxArray(sx) as AppSxItem[]

const IconTextButton = ({
  icon,
  text,
  helperText,
  helperAriaLabel,
  sx,
  textSx,
  iconWrapperSx,
  'aria-label': ariaLabel,
  color = 'inherit',
  ...buttonProps
}: IconTextButtonProps) => {
  const [isHelperOpen, setIsHelperOpen] = useState(false)
  const isDisabled = Boolean(buttonProps.disabled)

  const resolvedAriaLabel = useMemo(() => {
    if (ariaLabel) {
      return ariaLabel
    }

    if (typeof text === 'string' || typeof text === 'number') {
      return String(text)
    }

    return undefined
  }, [ariaLabel, text])

  const iconElement = React.cloneElement(icon, {
    sx: [
      {
        width: 14,
        height: 14,
        color: 'inherit',
      },
      ...toAppSxItemArray(icon.props.sx),
    ],
  })

  const mainButtonProps: ButtonProps = {
    ...buttonProps,
    color,
  }

  return (
    <Box
      sx={[
        {
          width: '100%',
          minHeight: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: isDisabled ? 'rgba(47,68,23,0.45)' : '#111111',
          ...(!isDisabled && {
            '&:hover': {
              color: '#0D6044',
            },
          }),
          '& [data-icon-text-helper-trigger][data-disabled], & [data-icon-text-helper-trigger]:disabled':
            {
              color: 'rgba(47,68,23,0.35)',
            },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Button
        {...mainButtonProps}
        aria-label={resolvedAriaLabel}
        sx={[
          {
            flex: 1,
            minWidth: 0,
            minHeight: '1.125rem',
            px: 0,
            py: 0,
            justifyContent: 'flex-start',
            alignItems: 'center',
            textTransform: 'none',
            borderRadius: 0,
            color: 'inherit',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'transparent',
              boxShadow: 'none',
            },
            '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
              color: 'inherit',
              opacity: 1,
            },
          },
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: 0,
            flex: 1,
          }}
        >
          <Box
            sx={[
              {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
                width: '1.125rem',
                minWidth: '1.125rem',
                height: '1.125rem',
                color: '#0D6044',
              },
              ...toAppSxItemArray(iconWrapperSx),
            ]}
          >
            {iconElement}
          </Box>
          <Box
            component="span"
            sx={[
              {
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'inherit',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: '1.125rem',
                letterSpacing: '0.1em',
                textTransform: 'none',
              },
              ...toAppSxItemArray(textSx),
            ]}
          >
            {text}
          </Box>
        </Box>
      </Button>

      {helperText && (
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1rem',
            minWidth: '1rem',
            height: '1.125rem',
          }}
        >
          <AppTooltip
            title={helperText}
            side="bottom"
            align="end"
            collisionAvoidance={{ side: 'none', align: 'shift' }}
            delay={0}
            closeDelay={0}
            open={isHelperOpen}
            disabled={isDisabled}
            onOpenChange={(open) => setIsHelperOpen(open)}
            popupSx={{ maxWidth: 'min(24rem, calc(100vw - 2rem))' }}
          >
            {({ ref, ...helperTriggerProps }) => (
              <IconButton
                {...helperTriggerProps}
                ref={ref as React.Ref<HTMLButtonElement>}
                data-icon-text-helper-trigger=""
                size="small"
                aria-label={helperAriaLabel ?? 'Show more information'}
                disabled={isDisabled}
                onClick={(event: BaseUITriggerEvent) => {
                  event.preventDefault()
                  event.stopPropagation()
                  event.preventBaseUIHandler?.()
                  setIsHelperOpen((prev) => !prev)
                }}
                sx={{
                  color: '#95a086',
                  p: 0,
                  width: '1rem',
                  minWidth: '1rem',
                  height: '1rem',
                  border: 0,
                  borderRadius: '50%',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#0D6044',
                  },
                }}
              >
                <QuestionCircleOutline sx={{ width: 16, height: 16 }} />
              </IconButton>
            )}
          </AppTooltip>
        </Box>
      )}
    </Box>
  )
}

export default IconTextButton
