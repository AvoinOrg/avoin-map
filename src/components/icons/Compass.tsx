import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'

type Props = SharedSvgIconProps

const Compass = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={2} />
    <path
      d="m14.9 6.8-1.5 6.6-6.3 3.8 1.5-6.6 6.3-3.8Z"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <path
      d="m13.4 13.4-4.8-2.8"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </SharedSvgIcon>
)

export default Compass
