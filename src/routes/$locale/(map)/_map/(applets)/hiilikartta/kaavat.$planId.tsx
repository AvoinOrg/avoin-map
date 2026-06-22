import { createFileRoute } from '@tanstack/react-router'

const HiilikarttaPlanRoute = () => {
  const { planId } = Route.useParams()

  return <h1>Hiilikartta plan placeholder: {planId}</h1>
}

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/kaavat/$planId'
)({
  component: HiilikarttaPlanRoute,
})
