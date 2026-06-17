import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

const Checkcircle = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={23}
    height={23}
    viewBox="0 0 23 23"
    fill="none"
    {...props}
  >
    <circle cx={11.5} cy={11.5} r={10.5} stroke="currentColor" strokeWidth={2} />
  </SharedSvgIcon>
)

export default Checkcircle
