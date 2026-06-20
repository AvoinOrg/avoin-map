import React from 'react'
import { T } from '@tolgee/react'

// Repo-wide Tolgee ICU rich-text helpers for JSX-rendered translations.
const defaultParams = {
  lb: <br />,
  br: <br />,
  i: <i />,
  b: <b />,
}

type TTextProps = {
  keyName?: string
  children?: string
  params?: Record<string, unknown>
  noWrap?: boolean
  ns?: string | string[]
  defaultValue?: string
  language?: string
}

const TolgeeText = T as React.ComponentType<TTextProps>

const TText = React.memo((props: TTextProps) => {
  const mergedParams = React.useMemo(
    () => ({ ...defaultParams, ...(props.params ?? {}) }),
    [props.params]
  )

  return React.createElement(TolgeeText, { ...props, params: mergedParams })
})
TText.displayName = 'TText'

export default TText
