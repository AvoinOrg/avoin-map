import type { SharedSvgIconProps } from './types'
import { MaterialSvgIcon } from './MaterialSvgIcon'

type Props = SharedSvgIconProps

const Done = (props: Props) => (
  <MaterialSvgIcon {...props}>
    <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
  </MaterialSvgIcon>
)

export default Done

