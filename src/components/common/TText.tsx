import React from 'react'
import { T, TProps } from '@tolgee/react'

type Props = TProps

const TText = (props: Props) => {
  return <T params={{ i: <i />, b: <i />, br: <br /> }} {...props}></T>
}

export default TText
