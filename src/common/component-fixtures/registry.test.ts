import type { ReactNode } from 'react'

jest.mock('#/components/common/LayerToggleRow', () => ({
  LayerToggleRow: () => null,
  LayerToggleRowAccordion: ({ children }: { children: ReactNode }) => children,
}))

import { componentFixtureMetadata } from './metadata'
import { getComponentFixtures } from './registry'

describe('component fixture registry', () => {
  test('matches the visual manifest metadata', () => {
    const registeredMetadata = getComponentFixtures().map((fixture) => ({
      id: fixture.id,
      label: fixture.label,
      description: fixture.description,
      sourceGlobs: fixture.sourceGlobs,
      states: fixture.states.map((state) => ({
        id: state.id,
        label: state.label,
        description: state.description,
        ...(state.waitFor ? { waitFor: state.waitFor } : {}),
      })),
    }))

    expect(registeredMetadata).toEqual(componentFixtureMetadata)
  })
})
