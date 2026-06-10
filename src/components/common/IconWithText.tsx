import * as React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

interface IconWithTextProps {
  icon: React.ReactElement<{ styleProps?: unknown }>
  onClick?: (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => void
  children?: React.ReactNode
  isIconOnRight?: boolean
  ariaLabel?: string
  styleProps?: PandaStyleProp
  iconSx?: PandaStyleProp
  textSx?: PandaStyleProp
  disabled?: boolean
}

const IconWithText = ({
  icon,
  onClick,
  children,
  isIconOnRight = false,
  ariaLabel,
  styleProps,
  iconSx,
  textSx,
  disabled = false,
}: IconWithTextProps) => {
  const textElement = (
    <span
      className={css(...pandaStylePropsToArray(textSx))}
      style={mergePandaStyleProps({ styleProps: textSx })}
    >
      {children}
    </span>
  )

  const iconWithStyles = React.cloneElement(icon, {
    styleProps: [
      isIconOnRight ? { ml: 1 } : { mr: 1 },
      ...pandaStylePropsToArray(iconSx),
    ],
  })

  const handleKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(event)
    }
  }

  const isInteractive = !!onClick && !disabled

  return (
    <span
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyPress : undefined}
      aria-label={
        isInteractive
          ? ariaLabel ??
            (typeof children === 'string' || typeof children === 'number'
              ? String(children)
              : undefined)
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : -1}
      aria-disabled={disabled}
      className={cx(
        css({
          display: 'inline-flex',
          flexDirection: 'row',
          alignItems: 'center',
          flex: 0,
          cursor: isInteractive
            ? 'pointer'
            : disabled && onClick
              ? 'not-allowed'
              : 'default',
          opacity: disabled && onClick ? 0.5 : 1,
          userSelect: 'none',
        }),
        css(...pandaStylePropsToArray(styleProps))
      )}
      style={mergePandaStyleProps({ styleProps })}
    >
      {isIconOnRight ? (
        <>
          {textElement}
          {iconWithStyles}
        </>
      ) : (
        <>
          {iconWithStyles}
          {textElement}
        </>
      )}
    </span>
  )
}

export default IconWithText
