'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { Tooltip } from '@base-ui/react/tooltip'
import { css, cx } from 'styled-system/css'

import QuestionCircleOutline from '#/components/icons/QuestionCircleOutline'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type BaseButtonProps = React.ComponentProps<typeof BaseButton>
type TooltipOpenChangeHandler = NonNullable<
  React.ComponentProps<typeof Tooltip.Root>['onOpenChange']
>
type HelperOpenState = 'closed' | 'hover' | 'focus' | 'pinned'

type IconTextButtonProps = Omit<
  BaseButtonProps,
  'children' | 'className' | 'style' | 'color'
> & {
  icon: React.ReactElement<{ styleProps?: unknown }>
  text: React.ReactNode
  helperText?: React.ReactNode
  helperAriaLabel?: string
  styleProps?: PandaStyleProp
  textSx?: PandaStyleProp
  iconWrapperSx?: PandaStyleProp
}

const tooltipPopupClassName = css({
  zIndex: 'popup',
  maxWidth: 'min(18.75rem, calc(100vw - 1rem))',
  borderRadius: '4px',
  backgroundColor: 'rgba(97, 97, 97, 0.92)',
  color: 'common.white',
  px: '0.5rem',
  py: '0.25rem',
  fontSize: '0.6875rem',
  lineHeight: 1.4,
  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.18)',
})

const tooltipPositionerClassName = css({
  zIndex: 'popup',
})

const tooltipArrowClassName = css({
  width: '0.5rem',
  height: '0.5rem',
  backgroundColor: 'rgba(97, 97, 97, 0.92)',
  transform: 'rotate(45deg)',
})

const IconTextButton = ({
  icon,
  text,
  helperText,
  helperAriaLabel,
  styleProps,
  textSx,
  iconWrapperSx,
  'aria-label': ariaLabel,
  ...buttonProps
}: IconTextButtonProps) => {
  const [helperOpenState, setHelperOpenState] =
    useState<HelperOpenState>('closed')
  const helperTriggerRef = useRef<HTMLButtonElement | null>(null)
  const helperPopupRef = useRef<HTMLDivElement | null>(null)
  const isDisabled = Boolean(buttonProps.disabled)
  const isHelperOpen = !isDisabled && helperOpenState !== 'closed'

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
    styleProps: [
      {
        width: 14,
        height: 14,
        color: 'inherit',
      },
      ...pandaStylePropsToArray(icon.props.styleProps as PandaStyleProp),
    ],
  })

  const handleHelperOpenChange: TooltipOpenChangeHandler = useCallback(
    (open, eventDetails) => {
      if (isDisabled) {
        setHelperOpenState('closed')
        return
      }

      if (eventDetails.reason === 'trigger-press') {
        return
      }

      if (
        eventDetails.reason === 'outside-press' ||
        eventDetails.reason === 'escape-key' ||
        eventDetails.reason === 'disabled'
      ) {
        setHelperOpenState('closed')
        return
      }

      setHelperOpenState((currentState) => {
        if (currentState === 'pinned') {
          return currentState
        }

        if (!open) {
          return 'closed'
        }

        if (eventDetails.reason === 'trigger-focus') {
          return 'focus'
        }

        return 'hover'
      })
    },
    [isDisabled]
  )

  useEffect(() => {
    if (!isHelperOpen) {
      return
    }

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        helperTriggerRef.current?.contains(target) ||
        helperPopupRef.current?.contains(target)
      ) {
        return
      }

      setHelperOpenState('closed')
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHelperOpenState('closed')
      }
    }

    document.addEventListener('pointerdown', closeOnOutsidePointerDown, true)
    document.addEventListener('keydown', closeOnEscape, true)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointerDown, true)
      document.removeEventListener('keydown', closeOnEscape, true)
    }
  }, [isHelperOpen])

  return (
    <div
      className={cx(
        css({
          width: '100%',
          minHeight: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: isDisabled ? 'rgba(47,68,23,0.45)' : '#111111',
          '&:hover': !isDisabled
            ? {
                color: '#0D6044',
              }
            : undefined,
          '& [data-helper-trigger][disabled]': {
            color: 'rgba(47,68,23,0.35)',
          },
        }),
        css(...pandaStylePropsToArray(styleProps))
      )}
      style={mergePandaStyleProps({ styleProps })}
    >
      <BaseButton
        aria-label={resolvedAriaLabel}
        {...buttonProps}
        className={css({
          flex: 1,
          minWidth: 0,
          minHeight: '1.125rem',
          px: 0,
          py: 0,
          border: 0,
          display: 'inline-flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          textTransform: 'none',
          borderRadius: 0,
          color: 'inherit',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          font: 'inherit',
          cursor: isDisabled ? 'default' : 'pointer',
          '&:hover': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          '&:disabled': {
            color: 'inherit',
            cursor: 'default',
          },
          '&:focus-visible': {
            outline: '2px solid rgba(17,17,17,0.4)',
            outlineOffset: '2px',
          },
        })}
      >
        <span
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            minWidth: 0,
            flex: 1,
          })}
        >
          <span
            className={cx(
              css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
                width: '1.125rem',
                minWidth: '1.125rem',
                height: '1.125rem',
                color: '#0D6044',
              }),
              css(...pandaStylePropsToArray(iconWrapperSx))
            )}
            style={mergePandaStyleProps({ styleProps: iconWrapperSx })}
          >
            {iconElement}
          </span>
          <span
            className={cx(
              css({
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'inherit',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: '1.125rem',
                letterSpacing: '0.1em',
                textTransform: 'none',
              }),
              css(...pandaStylePropsToArray(textSx))
            )}
            style={mergePandaStyleProps({ styleProps: textSx })}
          >
            {text}
          </span>
        </span>
      </BaseButton>

      {helperText && (
        <span
          className={css({
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1rem',
            minWidth: '1rem',
            height: '1.125rem',
          })}
        >
          <Tooltip.Root
            open={isHelperOpen}
            onOpenChange={handleHelperOpenChange}
            disabled={isDisabled}
          >
            <Tooltip.Trigger
              ref={helperTriggerRef}
              data-helper-trigger
              type="button"
              aria-label={helperAriaLabel ?? 'Show more information'}
              disabled={isDisabled}
              delay={0}
              closeDelay={0}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setHelperOpenState((currentState) =>
                  currentState === 'pinned' ? 'closed' : 'pinned'
                )
              }}
              className={css({
                color: '#95a086',
                p: 0,
                width: '1rem',
                height: '1rem',
                border: 0,
                borderRadius: '50%',
                backgroundColor: 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDisabled ? 'default' : 'pointer',
                '&:focus-visible': {
                  outline: '2px solid rgba(17,17,17,0.4)',
                  outlineOffset: '2px',
                },
              })}
            >
              <QuestionCircleOutline styleProps={{ width: 16, height: 16 }} />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner
                side="top"
                positionMethod="fixed"
                sideOffset={6}
                collisionPadding={8}
                className={tooltipPositionerClassName}
              >
                <Tooltip.Popup
                  ref={helperPopupRef}
                  className={tooltipPopupClassName}
                >
                  {helperText}
                  <Tooltip.Arrow className={tooltipArrowClassName} />
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </span>
      )}
    </div>
  )
}

export default IconTextButton
