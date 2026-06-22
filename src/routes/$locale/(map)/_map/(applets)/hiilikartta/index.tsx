import { createFileRoute } from '@tanstack/react-router'

const HiilikarttaIndexRoute = () => {
  const { locale } = Route.useParams()

  return <h1>Hiilikartta placeholder for {locale}</h1>
}

export const Route = createFileRoute(
  '/$locale/(map)/_map/(applets)/hiilikartta/'
)({
  component: HiilikarttaIndexRoute,
})
