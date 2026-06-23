import { Outlet, createFileRoute } from '@tanstack/react-router'

const LocaleLayout = () => {
  const { locale } = Route.useParams()
  void locale

  return <Outlet />
}

export const Route = createFileRoute('/$locale')({
  component: LocaleLayout,
})
