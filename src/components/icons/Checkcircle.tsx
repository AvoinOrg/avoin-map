import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const Checkcircle = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={23}
    viewBox="0 0 23 23"
    fill="none"
    {...props}
  >
    <circle cx={11.5} cy={11.5} r={10.5} stroke="currentColor" strokeWidth={2} />
  </Box>
)

export default Checkcircle
