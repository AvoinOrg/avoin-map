import { Outlet, createFileRoute, notFound } from '@tanstack/react-router'

import { isComponentFixtureRouteEnabled } from './-guards'

const ComponentFixturesLayout = () => <Outlet />

export const Route = createFileRoute('/$locale/dev/component-fixtures')({
  beforeLoad: () => {
    if (!isComponentFixtureRouteEnabled(process.env.NODE_ENV)) {
      throw notFound()
    }
  },
  component: ComponentFixturesLayout,
})
