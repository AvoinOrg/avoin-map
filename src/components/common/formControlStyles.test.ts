import { sharedSelectTriggerFocusStyle } from './formControlStyles'

describe('shared select focus styles', () => {
  it('keeps a native focus-visible selector for visible keyboard focus', () => {
    expect(sharedSelectTriggerFocusStyle['&:focus-visible']).toEqual(
      expect.objectContaining({
        outline: '2px solid var(--colors-secondary-dark)',
        outlineOffset: '2px',
        borderColor: 'secondary.dark',
      })
    )
  })

  it('keeps the Base UI focus-visible data attribute fallback', () => {
    expect(sharedSelectTriggerFocusStyle['&[data-focus-visible]']).toEqual(
      expect.objectContaining({
        outline: '2px solid var(--colors-secondary-dark)',
        outlineOffset: '2px',
        borderColor: 'secondary.dark',
      })
    )
  })

  it('keeps Base UI focused state border styling as a fallback', () => {
    expect(sharedSelectTriggerFocusStyle['&[data-focused]']).toEqual({
      borderColor: 'secondary.dark',
    })
  })
})
