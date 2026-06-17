import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

// Figma node 2838:38812
// MCP asset refs: http://localhost:3845/assets/8208f4e1c959724cca9a8722b01a00c61e4ab34a.svg
// and the polygon assets in the same node.
export const COOKIE_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" fill="none" aria-hidden="true" focusable="false">
  <circle cx="13" cy="13" r="8.8" stroke="currentColor" stroke-width="1.4" />
  <circle cx="8.8" cy="8.6" r="1.15" fill="currentColor" />
  <circle cx="13" cy="6.8" r="0.95" fill="currentColor" />
  <circle cx="17.2" cy="9.3" r="1.05" fill="currentColor" />
  <circle cx="9.3" cy="14.3" r="1.2" fill="currentColor" />
  <circle cx="14.6" cy="13.2" r="0.95" fill="currentColor" />
  <circle cx="11.7" cy="18.2" r="1.1" fill="currentColor" />
  <circle cx="17.6" cy="16.5" r="0.9" fill="currentColor" />
</svg>
`.trim()

const Cookie = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={26}
    height={26}
    fill="none"
    viewBox="0 0 26 26"
    {...props}
  >
    <circle cx="13" cy="13" r="8.8" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="8.8" cy="8.6" r="1.15" fill="currentColor" />
    <circle cx="13" cy="6.8" r="0.95" fill="currentColor" />
    <circle cx="17.2" cy="9.3" r="1.05" fill="currentColor" />
    <circle cx="9.3" cy="14.3" r="1.2" fill="currentColor" />
    <circle cx="14.6" cy="13.2" r="0.95" fill="currentColor" />
    <circle cx="11.7" cy="18.2" r="1.1" fill="currentColor" />
    <circle cx="17.6" cy="16.5" r="0.9" fill="currentColor" />
  </SharedSvgIcon>
)

export default Cookie
