import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
  pandaStylePropsToCssStyle,
} from './pandaStyleProps'
import type { PandaStyleProp } from './panda'

describe('pandaStyleProps', () => {
  it('keeps object and array values for Panda class generation', () => {
    const first = { width: '1rem' }
    const second = { color: 'text.secondary' }

    expect(
      pandaStylePropsToArray([
        first,
        undefined,
        second,
      ] as unknown as PandaStyleProp)
    ).toEqual([first, second])
  })

  it('converts common flat sx overrides to rendered inline styles', () => {
    expect(
      pandaStylePropsToCssStyle([
        { width: '1rem', height: 22, color: 'text.secondary' },
        {
          mt: 2,
          px: 3,
          typography: 'body2',
          boxShadow: 'button',
          zIndex: 'modal',
        },
      ] as unknown as PandaStyleProp)
    ).toEqual(
      expect.objectContaining({
        width: '1rem',
        height: 22,
        color: 'var(--colors-text-secondary)',
        marginTop: '1rem',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        boxShadow: 'var(--shadows-button)',
        zIndex: 'var(--z-index-modal)',
        fontSize: '0.875rem',
        fontWeight: 400,
      })
    )
  })

  it('leaves raw CSS shadow and z-index values unchanged', () => {
    expect(
      pandaStylePropsToCssStyle({
        boxShadow: '0 2px 8px rgba(17, 17, 17, 0.18)',
        zIndex: 'auto',
      })
    ).toEqual({
      boxShadow: '0 2px 8px rgba(17, 17, 17, 0.18)',
      zIndex: 'auto',
    })
  })

  it('lets explicit style props override sx bridge styles', () => {
    expect(
      mergePandaStyleProps({
        sx: { color: 'neutral.dark', width: 10 },
        style: { color: 'rgb(1, 2, 3)' },
      })
    ).toEqual(
      expect.objectContaining({
        color: 'rgb(1, 2, 3)',
        width: 10,
      })
    )
  })

  it('leaves nested and responsive rules for Panda CSS classes', () => {
    expect(
      pandaStylePropsToCssStyle({
        '&:hover': { color: 'primary.main' },
        width: { mobile: '1rem', desktop: '2rem' },
        height: '1rem',
      })
    ).toEqual({ height: '1rem' })
  })
})
