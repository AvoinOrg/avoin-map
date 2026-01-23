import React from 'react'
import { T } from '@tolgee/react'

const defaultParams = {
  lb: (_content: React.ReactNode) => <br />,
  i: (content: React.ReactNode) => <i>{content}</i>,
  b: (content: React.ReactNode) => <b>{content}</b>,
}

type TTextProps = React.ComponentProps<typeof T>

export const TText = React.memo((props: TTextProps) => {
  const mergedParams = React.useMemo(
    () => ({ ...defaultParams, ...(props.params ?? {}) }),
    [props.params]
  )

  return <T {...props} params={mergedParams} />
})
