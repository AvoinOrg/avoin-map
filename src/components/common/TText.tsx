import React from 'react'
import { T, TProps } from '@tolgee/react'

type Props = TProps

const lb = (_content: React.ReactNode) => <br />

const TText = (props: Props) => {
  return <T params={{ i: <i />, b: <b />, lb: lb }} {...props}></T>
}

export default TText
