import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const Sandwich = (props: Props) => (
  <Box
    component="svg"
    width="44"
    height="16"
    viewBox="0 0 44 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="44" height="6" fill="currentColor" />
    <rect y="10" width="44" height="6" fill="currentColor" />
  </Box>
)

export default Sandwich
