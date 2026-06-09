import React from 'react'
import { T } from '@tolgee/react'
import type { TProps } from '@tolgee/react'

// Repo-wide Tolgee ICU rich-text helpers for JSX-rendered translations.
const defaultParams = {
  lb: <br />,
  br: <br />,
  i: <i />,
  b: <b />,
}

type TTextProps = TProps
const TolgeeText = T as (props: TProps) => React.ReactElement

const TText = React.memo((props: TTextProps) => {
  const mergedParams = React.useMemo(
    () => ({ ...defaultParams, ...(props.params ?? {}) }),
    [props.params]
  )

  return <TolgeeText {...props} params={mergedParams} />
})
TText.displayName = 'TText'

export default TText
