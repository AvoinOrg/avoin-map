import {
  createFileRoute,
  notFound,
  redirect,
} from '@tanstack/react-router'

import { ComponentFixtureFrame } from '#/common/component-fixtures/ComponentFixtureFrame'
import { resolveComponentFixtureRoute } from '../-guards'

const ComponentFixtureStateRoute = () => {
  const { fixtureId, stateId } = Route.useParams()

  return <ComponentFixtureFrame fixtureId={fixtureId} stateId={stateId} />
}

export const Route = createFileRoute(
  '/$locale/dev/component-fixtures/$fixtureId/$stateId'
)({
  beforeLoad: ({ params }) => {
    const result = resolveComponentFixtureRoute({
      locale: params.locale,
      fixtureId: params.fixtureId,
      stateId: params.stateId,
      nodeEnv: process.env.NODE_ENV,
    })

    if (result.status === 'notFound') {
      throw notFound()
    }

    if (result.status === 'redirect') {
      throw redirect({
        to: '/$locale/dev/component-fixtures/$fixtureId/$stateId',
        params: {
          locale: result.targetLocale,
          fixtureId: params.fixtureId,
          stateId: params.stateId,
        },
      })
    }
  },
  component: ComponentFixtureStateRoute,
})
