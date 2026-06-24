import type { ReactNode } from 'react'

import '#/runtime/configureMapLibreWorker'
import MapLayoutClient from './layoutClient'

type Props = {
  children: ReactNode
}

const MapShell = ({ children }: Props) => (
  <MapLayoutClient>{children}</MapLayoutClient>
)

export default MapShell
