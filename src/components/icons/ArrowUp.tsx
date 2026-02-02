import * as React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const ArrowUp = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={17}
    height={9}
    viewBox="0 0 17 9"
    fill="none"
    {...props}
  >
    <path
      d="M0.5 8.08594L7.79289 0.793044C8.18342 0.40252 8.81658 0.402521 9.20711 0.793045L16.5 8.08594"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </Box>
)

export default ArrowUp
