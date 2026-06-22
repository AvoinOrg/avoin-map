import { Outlet, createFileRoute } from '@tanstack/react-router'

import { startRouteScaffoldLabel } from '../-helpers/scaffoldLabels'

const LocaleLayout = () => {
  const { locale } = Route.useParams()

  return (
    <main>
      <p>{startRouteScaffoldLabel}</p>
      <p>Locale scaffold: {locale}</p>
      <Outlet />
    </main>
  )
}

export const Route = createFileRoute('/$locale')({
  component: LocaleLayout,
})
