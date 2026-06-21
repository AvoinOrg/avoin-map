import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'

type Props = SharedSvgIconProps

const Save = (props: Props) => (
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
      d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4Zm2 16H5V5h11.17L19 7.83V19Zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3ZM6 6h9v4H6V6Z"
    />
  </SharedSvgIcon>
)

export default Save
