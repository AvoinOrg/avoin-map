import { useParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export const useLocaleFormatter = () => {
  const { locale } = useParams()
  const numberLocale = useMemo(() => {
    if (typeof locale !== 'string') {
      return undefined
    }

    return locale.toLowerCase() === 'en' ? 'en-FI' : locale
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
