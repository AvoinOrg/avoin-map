import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

const Upload = (props: Props) => (
  <SharedSvgIcon
    component={"svg"}
    width={16}
    height={22}
    viewBox="0 0 16 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g stroke="currentColor" strokeWidth={2}>
      <path d="M1 17v4h14v-4M8 17.5V1M1.5 8 8 1.5 14.5 8" />
    </g>
  </SharedSvgIcon>
)

export default Upload
