import * as React from 'react'
import { Box } from '@mui/system'

type Props = {
  sx?: any
}

const SvgAscending = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={22}
    fill="none"
    viewBox="0 0 23 22"
    {...props}
  >
    <path d="M0 21H23M0 1H10M0 10.4118H16.5" stroke="black" strokeWidth="2" />
  </Box>
)

export default SvgAscending
