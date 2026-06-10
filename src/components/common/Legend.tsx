import React from 'react'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

interface LegendProps {
  children: React.ReactNode
  styleProps?: PandaStyleProp
}

const rootClass = css({
  pt: 2,
})

const titleClass = css({
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
})

const legendClass = css({
  display: 'flex',
  flexDirection: 'column',
  pt: 1,
})

export const Legend = ({ children, styleProps }: LegendProps) => {
  const { t } = useTranslate('avoin-map')

  return (
    <div
      className={cx(rootClass, css(...pandaStylePropsToArray(styleProps)))}
      style={mergePandaStyleProps({ styleProps })}
    >
      <div className={titleClass}>{t('sidebar.legend.title')}</div>
      <legend className={legendClass}>{children}</legend>
    </div>
  )
}
