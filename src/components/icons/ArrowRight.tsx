import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const ArrowRight = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={20}
    viewBox="0 0 13 20"
    fill="none"
    {...props}
  >
    <path stroke="currentColor" strokeWidth={2} d="m1 1 10 9-10 9" />
  </Box>
)

export default ArrowRight
