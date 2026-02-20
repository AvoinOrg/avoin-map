import { Box, SxProps, Theme } from '@mui/material'

type Props = {
  sx?: SxProps<Theme>
}

// Figma node 2838:38811
// MCP asset refs: http://localhost:3845/assets/e52c85d6ea917fc353d5ccb3d25dfc5389398752.svg
// and http://localhost:3845/assets/61ff8979ae98a81496f16805dc8653bf5bde4243.svg
export const ATTRIBUTION_INFO_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <circle cx="8" cy="8" r="6.4" stroke="currentColor" stroke-width="1.2" />
  <path d="M8 4.8V8.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  <circle cx="8" cy="11" r="0.75" fill="currentColor" />
</svg>
`.trim()

const AttributionInfo = (props: Props) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M8 4.8V8.6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11" r="0.75" fill="currentColor" />
  </Box>
)

export default AttributionInfo
