import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

const Line = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    width="24"
    height="24"
    viewBox="0 0 30 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="1"
      y="1"
      width="6.08806"
      height="6.08806"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="22.3086"
      y="19.7422"
      width="6.08806"
      height="6.08806"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M5.87109 6.30188L22.8711 20.3019"
      stroke="currentColor"
      strokeWidth="2"
    />
  </SharedSvgIcon>
)

export default Line
