import React from 'react'
import '#/test/baseUiTestPolyfills'
import { fireEvent, render, screen } from '@testing-library/react'

import MapFloatingPanel from './MapFloatingPanel'

describe('MapFloatingPanel', () => {
  let anchor: HTMLButtonElement

  beforeEach(() => {
    anchor = document.createElement('button')
    document.body.appendChild(anchor)
  })

  afterEach(() => {
    anchor.remove()
  })

  it('ignores outside pointer-downs from matching external popups', () => {
    const onClose = jest.fn()
    const externalPopup = document.createElement('div')
    externalPopup.setAttribute('data-dropdown-select-popup', '')
    document.body.appendChild(externalPopup)

    render(
      <MapFloatingPanel
        open
        anchor={anchor}
        onClose={onClose}
        ignoreOutsideClickSelectors={['[data-dropdown-select-popup]']}
      >
        <div>Layer menu</div>
      </MapFloatingPanel>
    )

    expect(screen.getByText('Layer menu')).toBeInTheDocument()

    fireEvent.pointerDown(externalPopup)
    expect(onClose).not.toHaveBeenCalled()

    fireEvent.pointerDown(document.body)
    expect(onClose).toHaveBeenCalledTimes(1)

    externalPopup.remove()
  })

  it('ignores Escape while a matching external popup is mounted', () => {
    const onClose = jest.fn()
    const externalPopup = document.createElement('div')
    externalPopup.setAttribute('data-dropdown-select-popup', '')
    document.body.appendChild(externalPopup)

    render(
      <MapFloatingPanel
        open
        anchor={anchor}
        onClose={onClose}
        ignoreOutsideClickSelectors={['[data-dropdown-select-popup]']}
      >
        <div>Layer menu</div>
      </MapFloatingPanel>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()

    externalPopup.remove()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
