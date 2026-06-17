import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'
type Props = SharedSvgIconProps

const CheckboxChecked = (props: Props) => (
  <SharedSvgIcon
    component={'svg'}
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect
      x="1"
      y="1"
      width="22"
      height="22"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M6 11.5L11 17L19 8" stroke="currentColor" strokeWidth="2" />
  </SharedSvgIcon>
)

export default CheckboxChecked
