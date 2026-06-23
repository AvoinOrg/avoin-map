import type { ReactNode } from 'react'

import '#/start/configureMapLibreWorker'
import MapLayoutClient from 'map/layoutClient'

type Props = {
  children: ReactNode
}

const StartMapShell = ({ children }: Props) => (
  <MapLayoutClient>{children}</MapLayoutClient>
)

export default StartMapShell
