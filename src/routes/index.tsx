import { createFileRoute } from '@tanstack/react-router'

import { startBootstrapHeading } from '#/startBootstrapMarker'

const IndexRoute = () => <h1>{startBootstrapHeading}</h1>

export const Route = createFileRoute('/')({
  component: IndexRoute,
})
