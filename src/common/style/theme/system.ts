import React from 'react'
import { Box as MuiSystemBox } from '@mui/system'
import type { BoxProps as MuiSystemBoxProps, SxProps } from '@mui/system'
import type { Theme as MuiTheme } from '@mui/material/styles'
export { useTheme } from '@mui/system'

export type AppTheme = MuiTheme
export type AppSxProps = SxProps<AppTheme>
export type AppSystemStyleObject = AppSxProps
export type AppBoxProps = Omit<MuiSystemBoxProps, 'sx'> & { sx?: AppSxProps }

export const Box = React.forwardRef<HTMLElement, AppBoxProps>(function Box(
  {
    sx,
    ...props
  },
  ref
) {
  const systemProps = props as MuiSystemBoxProps
  const systemSx = sx as MuiSystemBoxProps['sx']

  return React.createElement(MuiSystemBox, {
    ...systemProps,
    ref,
    sx: systemSx,
  })
})

export const toSxArray = (sx?: AppSxProps): AppSxProps[] => {
  if (sx == null) {
    return []
  }

  return Array.isArray(sx) ? sx : [sx]
}
