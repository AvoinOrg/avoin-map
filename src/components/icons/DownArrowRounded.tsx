import * as React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const DownArrowRounded = ({ sx }: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={9}
    height={5}
    viewBox="0 0 9 5"
    fill="none"
    sx={[
      {
        display: 'block',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <path
      d="M8.5 0.5L5.20711 3.79289C4.81658 4.18342 4.18342 4.18342 3.79289 3.79289L0.5 0.5"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </Box>
)

export default DownArrowRounded
