import * as React from 'react'
import { Box } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

type Props = {
  sx?: SxProps<Theme>
}

const SvgDescending = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={24}
    fill="none"
    viewBox="0 0 23 24"
    {...props}
  >
    <path d="M0 1H23M0 21H10M0 10.4118H16.5" stroke="black" strokeWidth="2" />
  </Box>
)

export default SvgDescending
