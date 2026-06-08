import React from 'react'
import { css, cx } from 'styled-system/css'

import { EyeClosed, EyeOpen } from '#/components/icons'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { getContrastColor } from '#/common/utils/styling'
import { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

interface EyeButtonProps {
  onClick: (e: React.MouseEvent) => void
  color: string
  status: LayerGroupStatus
  ariaLabel?: string
  sx?: PandaStyleProp
}

const iconFrameClassName = css({
  width: '32px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const EyeButton = ({
  onClick,
  color,
  status,
  ariaLabel,
  sx,
}: EyeButtonProps) => {
  const contrastColor = getContrastColor(color)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? 'Toggle layer visibility'}
      className={cx(
        css({
          mr: 1,
          p: '8px',
          border: 0,
          borderRadius: '50%',
          backgroundColor: 'transparent',
          color: 'inherit',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          appearance: 'none',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          '&:focus-visible': {
            outline: '2px solid rgba(17,17,17,0.4)',
            outlineOffset: '2px',
          },
        }),
        css(...pandaStylePropsToArray(sx))
      )}
      style={mergePandaStyleProps({ sx })}
    >
      {status === 'processing' && (
        <span className={iconFrameClassName}>
          <LoadingHorizontal sx={{ width: '24px', height: '24px' }} />
        </span>
      )}
      {status === 'hidden' && (
        <span className={iconFrameClassName}>
          <EyeClosed sx={{ width: '24px', height: '24px' }} />
        </span>
      )}
      {status === 'visible' && (
        <span
          className={css({
            width: 32,
            height: 24,
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: contrastColor,
          })}
        >
          <EyeOpen
            sx={{
              width: 24,
              height: 24,
              color: contrastColor,
            }}
          />
        </span>
      )}
    </button>
  )
}
