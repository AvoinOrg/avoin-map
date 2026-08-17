import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

const ArrowNextBig = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={33}
    height={25}
    viewBox="0 0 33 25" // Added viewBox for proper scaling
    fill="none"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={2}>
      <path d="M1 0v25M6.425 12.5H32M21.15.893 31.225 12.5 21.15 24.107" />
    </g>
  </SharedSvgIcon>
)
export default ArrowNextBig
