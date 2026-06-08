import '#/test/baseUiTestPolyfills'
import React from 'react'
import { render, screen } from '@testing-library/react'

import DropDownSelectInset from '#/components/common/DropDownSelectInset'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}))

describe('DropDownSelectInset', () => {
  it('renders the select before the visible side label', () => {
    render(
      <DropDownSelectInset
        value="1970"
        options={[{ value: '1970', label: '1970 - 1979' }]}
        onChange={() => {}}
        label="Rakennusvuosi"
        ariaLabel="Valitse rakennusvuosi"
      />
    )

    const select = screen.getByRole('combobox', {
      name: 'Valitse rakennusvuosi',
    })
    const label = screen.getByText('Rakennusvuosi')

    expect(select.compareDocumentPosition(label)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(screen.getByText('1970 - 1979')).toBeTruthy()
  })
})
