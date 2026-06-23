import { describe, expect, test } from '@jest/globals'

import {
  isComponentFixtureRouteEnabled,
  resolveComponentFixtureRoute,
} from './-guards'

describe('component fixture route guards', () => {
  test('allows a valid fixture state outside production', () => {
    expect(
      resolveComponentFixtureRoute({
        locale: 'en',
        fixtureId: 'shared-svg-icons',
        stateId: 'all-icons-default',
        nodeEnv: 'test',
      })
    ).toEqual({ status: 'ok' })
  })

  test('returns notFound for an invalid fixture ID', () => {
    expect(
      resolveComponentFixtureRoute({
        locale: 'en',
        fixtureId: 'missing-fixture',
        stateId: 'all-icons-default',
        nodeEnv: 'test',
      })
    ).toEqual({ status: 'notFound' })
  })

  test('returns notFound for an invalid state ID', () => {
    expect(
      resolveComponentFixtureRoute({
        locale: 'en',
        fixtureId: 'shared-svg-icons',
        stateId: 'missing-state',
        nodeEnv: 'test',
      })
    ).toEqual({ status: 'notFound' })
  })

  test('disables fixture routes in production', () => {
    expect(isComponentFixtureRouteEnabled('production')).toBe(false)
    expect(
      resolveComponentFixtureRoute({
        locale: 'en',
        fixtureId: 'shared-svg-icons',
        stateId: 'all-icons-default',
        nodeEnv: 'production',
      })
    ).toEqual({ status: 'notFound' })
  })

  test('redirects locale-specific fixtures to their required locale', () => {
    expect(
      resolveComponentFixtureRoute({
        locale: 'en',
        fixtureId: 'luonnonmetsakartat-area-modal',
        stateId: 'with-pictures',
        nodeEnv: 'test',
      })
    ).toEqual({ status: 'redirect', targetLocale: 'fi' })
  })
})
