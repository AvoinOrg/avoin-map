import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const ArrowNext = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={22}
    height={16}
    viewBox="0 0 22 16"
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={2}>
      <path d="M1 1v14M4.5 8H21M14 1.5 20.5 8 14 14.5" />
    </g>
  </Box>
)

export default ArrowNext
