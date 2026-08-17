import { useCallback, useMemo } from 'react'

import { useAppParams } from '#/common/navigation/navigation'

export const useLocaleFormatter = () => {
  const { locale } = useAppParams()
  const numberLocale = useMemo(() => {
    const localeValue = Array.isArray(locale) ? locale[0] : locale

    if (typeof localeValue !== 'string') {
      return undefined
    }

    return localeValue.toLowerCase() === 'en' ? 'en-FI' : localeValue
  }, [locale])

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      try {
        return value.toLocaleString(numberLocale, options)
      } catch (error) {
        console.error('Error formatting number with locale:', {
          locale,
          value,
          options,
          error,
        })
        // Fallback to default locale if the provided one is invalid
        return value.toLocaleString(undefined, options)
      }
    },
    [locale, numberLocale]
  )
  return { formatNumber, numberLocale }
}
