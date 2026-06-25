export const compiledApplets = (process.env.NEXT_PUBLIC_COMPILED_APPLETS || '')
  .toLowerCase()
  .trim()
  .split(',')
  .filter(Boolean)

export const getPathnameWithoutLocale = (
  pathname: string,
  locale: string | string[] | null
): string => {
  if (!pathname) return '/'
  if (!locale) return pathname

  const localeValue = Array.isArray(locale) ? locale[0] : locale
  if (!localeValue) return pathname

  const pattern = new RegExp(`^/${localeValue}($|/)`)
  const cleaned = pathname.replace(pattern, '/').replace(/\/+$/, '')
  return cleaned === '' ? '/' : cleaned
}
