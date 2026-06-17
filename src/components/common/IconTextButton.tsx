'use client'

import React, { useMemo, useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme'
import {
  Button,
  IconButton,
  type ButtonProps,
} from '#/components/common/Button'
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
          <Tooltip.Root
            open={isHelperOpen}
            disabled={isDisabled}
            onOpenChange={(open) => setIsHelperOpen(open)}
          >
            <Tooltip.Trigger
              delay={0}
              closeDelay={0}
              render={(triggerProps) => {
                const { color: ignoredColor, ...helperTriggerProps } =
                  triggerProps
                void ignoredColor

                return (
                  <IconButton
                    {...helperTriggerProps}
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
                )
              }}
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side="top" sideOffset={8}>
                <Tooltip.Popup
                  style={{
                    zIndex: 1500,
                  }}
                  render={(popupProps) => (
                    <Box
                      {...popupProps}
                      sx={{
                        maxWidth: 240,
                        px: 1.25,
                        py: 0.75,
                        borderRadius: '5px',
                        backgroundColor: '#111111',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        fontWeight: 400,
                        lineHeight: 1.35,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
                      }}
                    >
                      {helperText}
                      <Tooltip.Arrow
                        render={(arrowProps) => (
                          <Box
                            {...arrowProps}
                            sx={{
                              position: 'absolute',
                              width: 8,
                              height: 8,
                              backgroundColor: '#111111',
                              transform: 'rotate(45deg)',
                              bottom: -4,
                              left: 'calc(50% - 4px)',
                            }}
                          />
                        )}
                      />
                    </Box>
                  )}
                />
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Box>
      )}
    </Box>
  )
}

export default IconTextButton
