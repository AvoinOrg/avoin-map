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
    viewBox="0 0 9 4.58579"
    fill="none"
    {...props}
  >
    <path
      d="M0.5 4.08579L3.79289 0.792896C4.18342 0.40237 4.81658 0.40237 5.20711 0.792896L8.5 4.08579"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </Box>
)

export default ArrowUp
