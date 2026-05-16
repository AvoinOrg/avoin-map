import { resolveSidebarRootFallback } from './sidebarRootFallback'

const resolve = (
  input: Partial<Parameters<typeof resolveSidebarRootFallback>[0]>
) =>
  resolveSidebarRootFallback({
    pathnameWithoutLocale: '/',
    compiledApplets: ['main', 'hiilikartta', 'energiakartta', 'forests'],
    sidebarVariant: 'default',
    isMapLayoutSidebarDisabled: false,
    ...input,
  })

describe('resolveSidebarRootFallback', () => {
  it('uses the home shell for the main build root path', () => {
    expect(resolve({ pathnameWithoutLocale: '/' })).toBe('home')
  })

  it('uses compact floating for standalone Hiilikartta root', () => {
    expect(
      resolve({
        pathnameWithoutLocale: '/',
        compiledApplets: ['hiilikartta'],
      })
    ).toBe('floating-compact')
  })

  it('uses compact floating for the Hiilikartta root in the main build', () => {
    expect(resolve({ pathnameWithoutLocale: '/hiilikartta' })).toBe(
      'floating-compact'
    )
  })

  it('bypasses the root shell for Hiilikartta kaavat routes', () => {
    expect(resolve({ pathnameWithoutLocale: '/hiilikartta/kaavat' })).toBe(
      'none'
    )
    expect(
      resolve({
        pathnameWithoutLocale: '/kaavat',
        compiledApplets: ['hiilikartta'],
      })
    ).toBe('none')
  })

  it('bypasses the root shell for Energiakartta root routes', () => {
    expect(resolve({ pathnameWithoutLocale: '/energiakartta' })).toBe('none')
    expect(
      resolve({
        pathnameWithoutLocale: '/',
        compiledApplets: ['energiakartta'],
      })
    ).toBe('none')
  })

  it('bypasses the root shell for Forests root routes', () => {
    expect(resolve({ pathnameWithoutLocale: '/forests' })).toBe('none')
    expect(
      resolve({
        pathnameWithoutLocale: '/',
        compiledApplets: ['forests'],
      })
    ).toBe('none')
  })

  it('maps ordinary simple sidebar routes to the panel shell', () => {
    expect(
      resolve({
        pathnameWithoutLocale: '/luonnonmetsakartat',
        sidebarVariant: 'simple',
      })
    ).toBe('panel-simple')
  })

  it('uses default floating for ordinary applet routes', () => {
    expect(resolve({ pathnameWithoutLocale: '/luonnonmetsakartat' })).toBe(
      'floating-default'
    )
  })

  it('bypasses the root shell when the legacy map layout flag is disabled', () => {
    expect(
      resolve({
        pathnameWithoutLocale: '/luonnonmetsakartat',
        isMapLayoutSidebarDisabled: true,
      })
    ).toBe('none')
  })
})
