import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const Plus = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    {...props}
  >
    <path stroke="currentColor" strokeWidth={2} d="M0 9.73h20M10 0v20" />
  </Box>
)

export default Plus
