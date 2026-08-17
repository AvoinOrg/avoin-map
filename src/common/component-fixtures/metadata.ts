import manifest from './manifest.json'
import type {
  ComponentFixtureMetadata,
  ComponentFixtureStateMetadata,
} from './types'

export const componentFixtureMetadata =
  manifest as ComponentFixtureMetadata[]

export const getComponentFixtureMetadata = (
  fixtureId: string
): ComponentFixtureMetadata | undefined =>
  componentFixtureMetadata.find((fixture) => fixture.id === fixtureId)

export const getComponentFixtureStateMetadata = ({
  fixtureId,
  stateId,
}: {
  fixtureId: string
  stateId: string
}): ComponentFixtureStateMetadata | undefined =>
  getComponentFixtureMetadata(fixtureId)?.states.find(
    (state) => state.id === stateId
  )
