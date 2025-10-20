import { useParams } from 'next/navigation'
import { useCallback } from 'react'

export const useLocaleFormatter = () => {
  const { locale } = useParams()

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions): string => {
      const localeValue =
        typeof locale === 'string'
          ? locale.toLowerCase() === 'en'
            ? 'en-FI'
            : locale
          : undefined

      try {
        return value.toLocaleString(localeValue, options)
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
    [locale]
  )
  return { formatNumber }
}
