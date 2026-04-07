import React from 'react'
import { T } from '@tolgee/react'

// Repo-wide Tolgee ICU rich-text helpers for JSX-rendered translations.
const defaultParams = {
  lb: <br />,
  br: <br />,
  i: <i />,
  b: <b />,
}

type TTextProps = React.ComponentProps<typeof T>

const TText = React.memo((props: TTextProps) => {
  const mergedParams = React.useMemo(
    () => ({ ...defaultParams, ...(props.params ?? {}) }),
    [props.params]
  )

  return <T {...props} params={mergedParams} />
})

export default TText
