'use client'

import { buttonPrimitivesFixture } from './fixtures/ButtonPrimitivesFixture'
import { layerToggleRowFixture } from './fixtures/LayerToggleRowFixture'
import type {
  ComponentFixture,
  ComponentFixtureStateLookup,
} from './types'

const componentFixtures: ComponentFixture[] = [
  layerToggleRowFixture,
  buttonPrimitivesFixture,
]

export const getComponentFixtures = () => componentFixtures

export const getComponentFixture = (
  fixtureId: string
): ComponentFixture | undefined =>
  componentFixtures.find((fixture) => fixture.id === fixtureId)

export const getComponentFixtureState = ({
  fixtureId,
  stateId,
}: {
  fixtureId: string
  stateId: string
}): ComponentFixtureStateLookup | undefined => {
  const fixture = getComponentFixture(fixtureId)
  const state = fixture?.states.find((candidate) => candidate.id === stateId)

  if (!fixture || !state) {
    return undefined
  }

  return { fixture, state }
}
