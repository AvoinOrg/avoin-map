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
    viewBox="0 0 17 9"
    fill="none"
    {...props}
  >
    <path
      d="M16.5 0.5L9.20711 7.79289C8.81658 8.18342 8.18342 8.18342 7.79289 7.79289L0.5 0.5"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </Box>
)

export default ArrowDown
