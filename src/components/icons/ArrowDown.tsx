import * as React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const ArrowDown = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={9}
    viewBox="0 0 9 4.58579"
    fill="none"
    {...props}
  >
    <path
      d="M0.5 0.5L3.79289 3.79289C4.18342 4.18342 4.81658 4.18342 5.20711 3.79289L8.5 0.5"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </Box>
)

export default ArrowDown
