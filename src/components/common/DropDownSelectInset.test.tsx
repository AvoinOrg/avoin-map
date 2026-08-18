import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppThemeProvider } from '#/common/style/theme'
import {
  SHARED_CONTROL_BORDER_RADIUS,
  SHARED_CONTROL_INFINITE_BORDER_RADIUS,
  SHARED_PILL_HORIZONTAL_CONTENT_INSET,
} from '#/common/style/theme/constants'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelect from '#/components/common/DropDownSelect'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'

jest.mock('@tolgee/react', () => ({
  useTranslate: () => ({
    t: (keyName: string) => keyName,
  }),
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<AppThemeProvider>{ui}</AppThemeProvider>)
}

describe('DropDownSelectInset', () => {
  it('keeps outer, select wrapper, trigger, and side-label styles independent', () => {
    const { container } = renderWithTheme(
      <DropDownSelectInset
        value="1970"
        options={[{ value: '1970', label: '1970 - 1979' }]}
        onChange={() => {}}
        label="Rakennusvuosi"
        ariaLabel="Styled rakennusvuosi"
        sx={{ backgroundColor: 'rgb(240, 241, 242)' }}
        selectWrapperSx={{ width: '123px' }}
        selectSx={{ height: '27px' }}
        labelSx={{ color: 'rgb(12, 34, 56)' }}
      />
    )

    const outer = container.querySelector('[data-slot="inset-select-root"]')
    const selectWrapper = container.querySelector(
      '[data-slot="select-wrapper"]'
    )
    const trigger = screen.getByRole('combobox', {
      name: 'Styled rakennusvuosi',
    })
    const label = container.querySelector('[data-slot="inset-select-label"]')

    expect(outer).toHaveStyle({ backgroundColor: 'rgb(240, 241, 242)' })
    expect(selectWrapper).toHaveStyle({ width: '123px' })
    expect(trigger).toHaveStyle({ height: '27px' })
    expect(label).toHaveStyle({ color: 'rgb(12, 34, 56)' })
    expect(outer).not.toHaveStyle({ width: '123px' })
    expect(selectWrapper).not.toHaveStyle({ height: '27px' })
  })

  it('applies negative pill margins before caller trigger overrides', () => {
    renderWithTheme(
      <>
        <DropDownSelect
          value="heat"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          ariaLabel="Default geometry"
        />
        <DropDownSelect
          value="heat"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          ariaLabel="Negative geometry"
          applyNegativeMargins
        />
        <DropDownSelect
          value="heat"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          ariaLabel="Overridden geometry"
          applyNegativeMargins
          selectSx={[
            { mx: '-0.25rem' },
            { ml: '2rem', mr: '3rem', width: '80%' },
          ]}
        />
      </>
    )

    expect(
      screen.getByRole('combobox', { name: 'Default geometry' })
    ).toHaveStyle({
      margin: '0px',
      width: '100%',
    })
    expect(
      screen.getByRole('combobox', { name: 'Negative geometry' })
    ).toHaveStyle({
      marginLeft: '-1rem',
      marginRight: '-1rem',
      width: 'calc(100% + 2rem)',
    })
    expect(
      screen.getByRole('combobox', { name: 'Overridden geometry' })
    ).toHaveStyle({
      marginLeft: '2rem',
      marginRight: '3rem',
      width: '80%',
    })
  })

  it('forwards compact inset geometry and keeps caller selectSx last', () => {
    renderWithTheme(
      <>
        <DropDownSelectInset
          value="1970"
          options={[{ value: '1970', label: '1970 - 1979' }]}
          onChange={() => {}}
          label="Rakennusvuosi"
          ariaLabel="Inset geometry"
          applyNegativeMargins
        />
        <DropDownSelectInset
          value="1970"
          options={[{ value: '1970', label: '1970 - 1979' }]}
          onChange={() => {}}
          label="Rakennusvuosi override"
          ariaLabel="Inset geometry override"
          applyNegativeMargins
          selectSx={{ mx: '-0.25rem', width: '75%' }}
        />
      </>
    )

    expect(
      screen.getByRole('combobox', { name: 'Inset geometry' })
    ).toHaveStyle({
      marginLeft: '-1.125rem',
      marginRight: '-1rem',
      width: 'calc(100% + 2.125rem)',
    })
    expect(
      screen.getByRole('combobox', { name: 'Inset geometry override' })
    ).toHaveStyle({
      marginLeft: '-0.25rem',
      marginRight: '-0.25rem',
      width: '75%',
    })
  })

  it('applies minimal geometry only to the right-icon pill root', () => {
    const { container } = renderWithTheme(
      <>
        <DropDownSelectMinimal
          value="heat"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          ariaLabel="Right minimal geometry"
          applyNegativeMargins
          sx={{ mr: '-0.5rem' }}
        />
        <DropDownSelectMinimal
          value="heat"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          ariaLabel="Left minimal geometry"
          isIconOnTheRight={false}
          applyNegativeMargins
        />
      </>
    )

    const roots = container.querySelectorAll(
      '[data-slot="minimal-select-root"]'
    )
    const rightIcon = screen
      .getByRole('combobox', { name: 'Right minimal geometry' })
      .querySelector('[data-slot="icon"]')
    const leftIcon = screen
      .getByRole('combobox', { name: 'Left minimal geometry' })
      .querySelector('[data-slot="icon"]')

    expect(roots[0]).toHaveStyle({
      marginLeft: '-1rem',
      marginRight: '-0.5rem',
      width: 'fit-content',
    })
    expect(roots[1]).not.toHaveStyle({ marginLeft: '-1rem' })
    expect(rightIcon).toHaveStyle({
      right: SHARED_PILL_HORIZONTAL_CONTENT_INSET,
    })
    expect(leftIcon).toHaveStyle({ left: '1rem', right: 'auto' })
  })

  it('wraps the side label naturally by default', () => {
    const { container } = renderWithTheme(
      <DropDownSelectInset
        value="1970"
        options={[{ value: '1970', label: '1970 - 1979' }]}
        onChange={() => {}}
        label="Rakennusvuosi erittäin pitkällä selitteellä"
        ariaLabel="Wrapping rakennusvuosi"
      />
    )

    const label = container.querySelector('[data-slot="inset-select-label"]')

    expect(label).toHaveStyle({
      overflowWrap: 'anywhere',
      whiteSpace: 'normal',
    })
    expect(label).not.toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    })
  })

  it('renders the select before the visible side label', () => {
    renderWithTheme(
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

  it('passes a local event with target.value when selecting an option', async () => {
    const handleChange = jest.fn()

    renderWithTheme(
      <DropDownSelect
        value=""
        options={[
          { value: 'heat', label: 'Heat demand' },
          { value: 'solar', label: 'Solar potential' },
        ]}
        onChange={handleChange}
        placeholder="Choose layer"
        ariaLabel="Layer"
      />
    )

    fireEvent.click(screen.getByRole('combobox', { name: 'Layer' }))
    const option = await screen.findByRole('option', {
      name: 'Solar potential',
    })
    fireEvent.mouseMove(option)
    await waitFor(() => {
      expect(option.hasAttribute('data-highlighted')).toBe(true)
    })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { value: 'solar' },
      })
    )
  })

  it('allows a default-open empty selection menu to close', async () => {
    renderWithTheme(
      <DropDownSelect
        value=""
        options={[{ value: 'heat', label: 'Heat demand' }]}
        onChange={() => {}}
        allowEmpty
        defaultOpen
        placeholder="Choose layer"
        ariaLabel="Closable empty select"
      />
    )

    expect(
      await screen.findByRole('option', { name: 'Empty selection' })
    ).toBeTruthy()

    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' })

    await waitFor(() => {
      expect(
        screen
          .getByRole('combobox', { name: 'Closable empty select' })
          .getAttribute('aria-expanded')
      ).toBe('false')
    })
  })

  it('commits the highlighted option with Enter from the keyboard', async () => {
    const handleChange = jest.fn()

    const ControlledSelect = () => {
      const [value, setValue] = React.useState('heat')

      return (
        <DropDownSelect
          value={value}
          options={[
            { value: 'heat', label: 'Heat demand' },
            { value: 'solar', label: 'Solar potential' },
            { value: 'emissions', label: 'Emissions' },
          ]}
          onChange={(event) => {
            handleChange(event)
            setValue(event.target.value)
          }}
          ariaLabel="Keyboard layer"
        />
      )
    }

    renderWithTheme(<ControlledSelect />)

    const combobox = screen.getByRole('combobox', {
      name: 'Keyboard layer',
    })

    combobox.focus()
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    const heatOption = await screen.findByRole('option', {
      name: 'Heat demand',
    })
    const solarOption = await screen.findByRole('option', {
      name: 'Solar potential',
    })
    heatOption.focus()
    fireEvent.keyDown(heatOption, { key: 'ArrowDown' })

    await waitFor(() => {
      expect(solarOption.hasAttribute('data-highlighted')).toBe(true)
    })

    solarOption.focus()
    fireEvent.keyDown(solarOption, { key: 'Enter' })

    await waitFor(() => {
      expect(combobox.textContent).toContain('Solar potential')
    })
    expect(handleChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        target: { value: 'solar' },
      })
    )
  })

  it('renders placeholder, empty option, and invalid value states', async () => {
    const { rerender } = renderWithTheme(
      <DropDownSelect
        key="placeholder"
        value=""
        options={[{ value: 'heat', label: 'Heat demand' }]}
        onChange={() => {}}
        placeholder="Choose layer"
        allowEmpty
        ariaLabel="Layer state"
      />
    )

    expect(screen.getByText('Choose layer')).toBeTruthy()
    fireEvent.click(screen.getByRole('combobox', { name: 'Layer state' }))
    expect(
      await screen.findByRole('option', { name: 'Empty selection' })
    ).toBeTruthy()

    rerender(
      <AppThemeProvider>
        <DropDownSelect
          key="invalid"
          value="legacy"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          defaultOpen
          ariaLabel="Invalid state"
        />
      </AppThemeProvider>
    )

    expect(
      screen.getByRole('combobox', { name: 'Invalid state' }).textContent
    ).toContain('legacy')
    expect(
      await screen.findByRole('option', { name: 'Invalid value legacy' })
    ).toBeTruthy()
  })

  it('uses a pill radius for the closed trigger while keeping the popup moderate', async () => {
    renderWithTheme(
      <DropDownSelect
        value="heat"
        options={[
          { value: 'heat', label: 'Heat demand' },
          { value: 'solar', label: 'Solar potential' },
        ]}
        onChange={() => {}}
        ariaLabel="Radius layer"
      />
    )

    const trigger = screen.getByRole('combobox', { name: 'Radius layer' })
    const outline = trigger.querySelector('.MuiOutlinedInput-notchedOutline')

    expect(trigger).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })
    expect(outline).toHaveStyle({
      borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
    })

    fireEvent.click(trigger)
    expect(
      await screen.findByRole('option', { name: 'Solar potential' })
    ).toBeTruthy()

    const popup = document.querySelector('[data-slot="popup"]')
    const list = document.querySelector('[data-slot="list"]')
    const option = screen.getByRole('option', { name: 'Solar potential' })

    expect(popup).toHaveStyle({
      borderRadius: SHARED_CONTROL_BORDER_RADIUS,
      boxSizing: 'border-box',
      margin: '0px',
      overflow: 'hidden',
      padding: '0px',
      width: 'var(--anchor-width)',
    })
    expect(list?.parentElement).toBe(popup)
    expect(list).toHaveStyle({
      boxSizing: 'border-box',
      margin: '0px',
      maxHeight: 'min(18rem, calc(100vh - 2rem))',
      minWidth: '0',
      overflowY: 'auto',
      padding: '0px',
      width: '100%',
    })
    expect(option.parentElement).toBe(list)
    expect(option).toHaveStyle({
      boxSizing: 'border-box',
      minWidth: '0',
      width: '100%',
    })
  })

  it('uses stable visible-arrow geometry in closed and open states', async () => {
    const { rerender } = renderWithTheme(
      <DropDownSelect
        value="heat"
        options={[{ value: 'heat', label: 'Heat demand' }]}
        onChange={() => {}}
        ariaLabel="Arrow geometry"
        open={false}
      />
    )

    const closedIcon = screen
      .getByRole('combobox', { name: 'Arrow geometry' })
      .querySelector('[data-slot="icon"]')

    expect(closedIcon).toHaveStyle({
      height: '6px',
      right: SHARED_PILL_HORIZONTAL_CONTENT_INSET,
      top: '50%',
      transform: 'translateY(-50%)',
      width: '12px',
    })

    rerender(
      <AppThemeProvider>
        <DropDownSelect
          value="heat"
          options={[{ value: 'heat', label: 'Heat demand' }]}
          onChange={() => {}}
          ariaLabel="Arrow geometry"
          open
        />
      </AppThemeProvider>
    )

    expect(
      await screen.findByRole('option', { name: 'Heat demand' })
    ).toBeTruthy()
    expect(
      screen
        .getByRole('combobox', { name: 'Arrow geometry' })
        .querySelector('[data-slot="icon"]')
    ).toHaveStyle({
      right: SHARED_PILL_HORIZONTAL_CONTENT_INSET,
      transform: 'translateY(-50%) rotate(180deg)',
    })
  })
})
