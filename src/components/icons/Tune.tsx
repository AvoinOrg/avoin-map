import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'

type Props = SharedSvgIconProps

const Tune = (props: Props) => (
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
      fill="currentColor"
      d="M3 17v2h6v-2H3Zm0-6v2h4v-2H3Zm0-6v2h10V5H3Zm8 16h2v-2h8v-2h-8v-2h-2v6Zm-4-6h2V9H7v2H3v2h4v2Zm8-6h2V7h4V5h-4V3h-2v6Zm-4 4h10v-2H11v2Z"
    />
  </SharedSvgIcon>
)

export default Tune
