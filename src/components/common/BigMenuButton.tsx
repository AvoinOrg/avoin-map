import * as React from 'react'

import { Button, type ButtonProps } from '#/components/common/Button'
import type { AppSxProps, AppTheme } from '#/common/style/theme'

type BigMenuButtonProps = ButtonProps & {
  children: React.ReactNode
  sx?: AppSxProps
}

const BigMenuButton = ({
  children,
  sx,
  'aria-label': ariaLabel,
  ...buttonProps
}: BigMenuButtonProps) => {
  return (
    <Button
      variant="contained"
      component="label"
      color="primary"
      aria-label={
        ariaLabel ??
        (typeof children === 'string' || typeof children === 'number'
          ? String(children)
          : undefined)
      }
      {...buttonProps} // This spreads all other props, allowing them to override defaults
      sx={[
        {
          typography: 'body1',
          width: '100%',
          height: '60px',
          margin: '0 0 0 0',
          justifyContent: 'space-between',
          borderRadius: '5px',
          backgroundColor: '#FBFBFB',
          border: (theme: AppTheme) =>
            `0.5px solid ${theme.palette.neutral.main}`,
          boxShadow: '1px 1px 7px 0px #EEECEC',
          pl: 3,
          pr: 3,
          outline: 'none !important',
          // Reset browser/MUI focus styles
          '&:focus': {
            outline: 'none !important',
            border: (theme: AppTheme) =>
              `0.5px solid ${theme.palette.neutral.main}`,
            boxShadow: '1px 1px 7px 0px #EEECEC',
          },
          '&:active': {
            outline: 'none !important',
            backgroundColor: (theme: AppTheme) => theme.palette.primary.light,
            boxShadow: '1px 1px 7px 0px #EEECEC',
          },
          '&:hover': {
            backgroundColor: (theme: AppTheme) => theme.palette.primary.lighter,
            borderColor: (theme: AppTheme) => theme.palette.primary.main,
          },
          '&[data-focus-visible="true"], &:focus-visible': {
            outline: 'none !important',
            border: (theme: AppTheme) =>
              `0.5px solid ${theme.palette.primary.main}`,
            boxShadow: '1px 1px 7px 0px #EEECEC',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Button>
  )
}

export default BigMenuButton
