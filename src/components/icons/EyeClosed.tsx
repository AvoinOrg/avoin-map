import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const EyeClosed = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={15}
    viewBox="0 0 26 15"
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeLinecap="square" strokeLinejoin="round" strokeWidth={2}>
      <path d="M2 2s2.852 5 11 5 11-5 11-5M13.5 10.889V14m6.177-4L21 12.667M7.765 10 6 12.667" />
    </g>
  </Box>
)

export default EyeClosed
