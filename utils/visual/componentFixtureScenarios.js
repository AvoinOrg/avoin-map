const componentFixtureManifest = require('../../src/common/component-fixtures/manifest.json')

const COMPONENT_FIXTURE_APPLET = 'component-fixtures'
const COMPONENT_FIXTURE_SCENARIO_TAG = 'component-fixture'
const COMPONENT_FIXTURE_WAIT_FOR_SELECTOR =
  '[data-testid="component-fixture-ready"]'
const COMPONENT_FIXTURE_LOCALE = 'en'

const joinUrl = ({ baseUrl, path }) => {
  const normalizedBaseUrl = String(baseUrl || '').replace(/\/+$/, '')
  if (!normalizedBaseUrl) {
    return path
  }
  return `${normalizedBaseUrl}${path}`
}

const buildComponentFixtureScenarioId = ({ fixtureId, stateId }) =>
  `component-fixture-${fixtureId}-${stateId}`

const buildComponentFixtureVisualScenarios = ({ baseUrl = '' } = {}) =>
  componentFixtureManifest.flatMap((fixture) =>
    fixture.states.map((state) => {
      const path = `/${COMPONENT_FIXTURE_LOCALE}/dev/component-fixtures/${fixture.id}/${state.id}`

      return {
        id: buildComponentFixtureScenarioId({
          fixtureId: fixture.id,
          stateId: state.id,
        }),
        applet: COMPONENT_FIXTURE_APPLET,
        locale: COMPONENT_FIXTURE_LOCALE,
        path,
        url: joinUrl({ baseUrl, path }),
        requiresWebGL: false,
        waitFor:
          state.waitFor ||
          fixture.waitFor ||
          COMPONENT_FIXTURE_WAIT_FOR_SELECTOR,
        maskSelectors: [],
        minNonWhitePixels: 150,
        sourceGlobs: [...(fixture.sourceGlobs || [])],
        tags: [
          COMPONENT_FIXTURE_SCENARIO_TAG,
          `component:${fixture.id}`,
          `state:${state.id}`,
        ],
      }
    })
  )

module.exports = {
  COMPONENT_FIXTURE_APPLET,
  COMPONENT_FIXTURE_LOCALE,
  COMPONENT_FIXTURE_SCENARIO_TAG,
  buildComponentFixtureScenarioId,
  buildComponentFixtureVisualScenarios,
}
