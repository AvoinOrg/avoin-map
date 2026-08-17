import {
  getComponentFixtureMetadata,
  getComponentFixtureStateMetadata,
} from '#/common/component-fixtures/metadata'

export type ComponentFixtureRouteResolution =
  | { status: 'ok' }
  | { status: 'notFound' }
  | { status: 'redirect'; targetLocale: string }

type ResolveComponentFixtureRouteParams = {
  locale: string
  fixtureId: string
  stateId: string
  nodeEnv?: string
}

export const isComponentFixtureRouteEnabled = (nodeEnv?: string) =>
  nodeEnv !== 'production'

export const resolveComponentFixtureRoute = ({
  locale,
  fixtureId,
  stateId,
  nodeEnv = process.env.NODE_ENV,
}: ResolveComponentFixtureRouteParams): ComponentFixtureRouteResolution => {
  if (!isComponentFixtureRouteEnabled(nodeEnv)) {
    return { status: 'notFound' }
  }

  const fixture = getComponentFixtureMetadata(fixtureId)
  const state = getComponentFixtureStateMetadata({ fixtureId, stateId })

  if (!fixture || !state) {
    return { status: 'notFound' }
  }

  if (fixture.locale && fixture.locale !== locale) {
    return { status: 'redirect', targetLocale: fixture.locale }
  }

  return { status: 'ok' }
}
