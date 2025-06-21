import * as React from 'react'
import { Theme, Box, SxProps } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const Exclamation = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width="9"
    height="20"
    viewBox="0 0 9 20"
    fill="none"
    {...props}
  >
    <path d="M3 13.3158L1 1H8L6 13.3158H4.5H3Z" stroke="currentColor" />
    <path d="M3 19V15.6842H6V19H3Z" stroke="currentColor" />
  </Box>
)

export default Exclamation
