import type { SharedSvgIconProps } from './types'
import { SharedSvgIcon } from './types'

type Props = SharedSvgIconProps

const FolderCopy = (props: Props) => (
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
      d="M3 19h17v2H3c-1.1 0-2-.9-2-2V6h2v13Zm20-13v9c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2l.01-11C5.01 2.9 5.9 2 7 2h5l2 2h7c1.1 0 2 .9 2 2ZM7 15h14V6h-7.83l-2-2H7v11Z"
    />
  </SharedSvgIcon>
)

export default FolderCopy
