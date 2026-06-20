import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'

type Props = SharedSvgIconProps

const Check = (props: Props) => (
  <SharedSvgIcon
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      d="M5 12.5 9.5 17 19 7"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SharedSvgIcon>
)

export default Check
