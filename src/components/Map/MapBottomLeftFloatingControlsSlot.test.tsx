import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT } from '#/common/constants/map'
import {
  IntoSlot,
  SlotsProvider,
} from '#/components/context/slotsContext'
import MapBottomLeftFloatingControlsSlot from './MapBottomLeftFloatingControlsSlot'

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<SlotsProvider>{ui}</SlotsProvider>)
}

describe('MapBottomLeftFloatingControlsSlot', () => {
  it('hosts portaled controls above the bottom-left map controls', () => {
    renderWithProviders(
      <>
        <MapBottomLeftFloatingControlsSlot />
        <IntoSlot name={MAP_BOTTOM_LEFT_FLOATING_CONTROLS_SLOT}>
          <button type="button">Floating control</button>
        </IntoSlot>
      </>
    )

    expect(
      screen.getByRole('button', { name: 'Floating control' })
    ).toBeInTheDocument()
    expect(
      document.querySelector('[data-map-bottom-left-floating-controls-slot]')
    ).toHaveStyle({
      position: 'absolute',
      left: '0.5rem',
      bottom: 'calc(100% + 2.5rem)',
      pointerEvents: 'none',
    })
  })

  it('renders an inert host without visible content when no applet provides content', () => {
    renderWithProviders(<MapBottomLeftFloatingControlsSlot />)

    const host = document.querySelector(
      '[data-map-bottom-left-floating-controls-slot]'
    )

    expect(host).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(host?.firstElementChild).toBeEmptyDOMElement()
  })
})
