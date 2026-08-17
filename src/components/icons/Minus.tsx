import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

const Minus = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={3}
    viewBox="0 0 19 3"
    fill="none"
    {...props}
  >
    <path stroke="currentColor" strokeWidth={3} d="M.5 1h20" />
  </SharedSvgIcon>
)

export default Minus
