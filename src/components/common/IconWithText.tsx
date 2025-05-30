import * as React from 'react'
import { Box, Typography, SxProps, Theme } from '@mui/material'

interface IconWithTextProps {
  icon: React.ReactElement
  onClick?: (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => void
  children?: React.ReactNode
  isIconOnRight?: boolean
  sx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
  textSx?: SxProps<Theme>
  disabled?: boolean
}

const IconWithText = ({
  icon,
  onClick,
  children,
  isIconOnRight = false,
  sx,
  iconSx,
  textSx,
  disabled = false,
}: IconWithTextProps) => {
  const textElement = (
    <Typography
      sx={[
        // Base styles for text can be added here if needed
        ...(Array.isArray(textSx) ? textSx : [textSx]),
      ]}
    >
      {children}
    </Typography>
  )

  const iconWithStyles = React.cloneElement(icon, {
    sx: [
      isIconOnRight ? { ml: 1 } : { mr: 1 }, // Default margin for spacing
      ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
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
    <Box
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyPress : undefined}
      role={onClick ? 'button' : undefined} // Role is button only if onClick is provided
      tabIndex={isInteractive ? 0 : -1}
      aria-disabled={disabled} // aria-disabled can still be relevant even if not interactive via onClick
      sx={[
        {
          display: 'inline-flex', // Makes the box only as wide as its content
          flexDirection: 'row',
          alignItems: 'center',
          flex: 0,
          cursor: isInteractive
            ? 'pointer'
            : disabled && onClick
            ? 'not-allowed'
            : 'default',
          opacity: disabled && onClick ? 0.5 : 1, // Opacity change only if it was meant to be clickable but is disabled
          userSelect: 'none',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
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
    </Box>
  )
}

export default IconWithText
