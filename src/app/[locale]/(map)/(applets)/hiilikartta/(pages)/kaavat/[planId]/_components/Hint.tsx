import React from 'react'

import SimpleTooltip from '#/components/common/SimpleTooltip'
import type { PandaStyleProp } from '#/common/style/panda'

type HintSide = 'top' | 'right' | 'bottom' | 'left'
type HintAlign = 'start' | 'center' | 'end'

type HintProps = {
  title?: React.ReactNode
  side?: HintSide
  align?: HintAlign
  disabled?: boolean
  sideOffset?: number
  popupSx?: PandaStyleProp
  arrowSx?: PandaStyleProp
  children: React.ReactElement
}

const Hint = ({
  title,
  side = 'top',
  align = 'center',
  disabled,
  sideOffset = 11,
  popupSx,
  arrowSx,
  children,
}: HintProps) => {
  if (title == null || title === '' || disabled) {
    return children
  }

  return (
    <SimpleTooltip
      title={title}
      side={side}
      align={align}
      sideOffset={sideOffset}
      popupSx={popupSx}
      arrowSx={arrowSx}
    >
      {children}
    </SimpleTooltip>
  )
}

export default Hint
