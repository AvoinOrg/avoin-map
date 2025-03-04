import * as React from 'react'
import { Button, SxProps, Theme, useTheme, ButtonProps } from '@mui/material'

type BigMenuButtonProps = ButtonProps & {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

const BigMenuButton = ({
  children,
  sx,
  ...buttonProps
}: BigMenuButtonProps) => {
  const theme = useTheme()

  return (
    <Button
      variant="contained"
      component="label"
      color="primary"
      {...buttonProps} // This spreads all other props, allowing them to override defaults
      sx={[
        {
          width: '100%',
          height: '60px',
          margin: '0 0 0 0',
          justifyContent: 'space-between',
          borderRadius: '5px',
          backgroundColor: '#FBFBFB',
          border: `0.5px solid ${theme.palette.neutral.main}`,
          boxShadow: '1px 1px 7px 0px #EEECEC',
          pl: 3,
          pr: 3,
          outline: 'none !important',
          // Reset browser/MUI focus styles
          '&:focus': {
            outline: 'none !important',
            border: `0.5px solid ${theme.palette.neutral.main}`,
            boxShadow: '1px 1px 7px 0px #EEECEC',
          },
          '&:active': {
            outline: 'none !important',
            backgroundColor: theme.palette.primary.light,
            boxShadow: '1px 1px 7px 0px #EEECEC',
          },
          '&:hover': {
            backgroundColor: theme.palette.primary.lighter,
            borderColor: theme.palette.primary.main,
          },
          // Override all MUI focus-related classes
          '&.Mui-focusVisible, &.Mui-focused, &:focus-visible': {
            outline: 'none !important',
            border: `0.5px solid ${theme.palette.primary.main}`,
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
