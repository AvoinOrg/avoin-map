import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const Ascending = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={24}
    fill="none"
    viewBox="0 0 23 24"
    {...props}
  >
    <path d="M0 21H23M0 1H10M0 10.4118H16.5" stroke="currentColor" strokeWidth="2" />
  </Box>
)

export default Ascending
