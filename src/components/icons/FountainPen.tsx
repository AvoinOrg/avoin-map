import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

const FountainPen = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeWidth={2}
      d="m2 2 14.535 4.262 2.623 3.825v5.246L22 18.284 18.066 22l-2.842-2.732-6.01-.437-3.498-3.498L2 2Zm0 0 10.273 10.273"
    />
  </Box>
)

export default FountainPen
