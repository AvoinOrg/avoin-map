'use client'

import { useMemo } from 'react'

import { AppSxProps, Box } from '#/common/style/theme'
import {
  useAppParams,
  useAppPathname,
  useAppRouter,
  useAppSearchParams,
} from '#/common/navigation/navigation'
import { getLocalesForApplet } from '#/common/navigation/tolgee/shared'
import { useUIStore } from '#/common/store'
import {
  compiledApplets,
  getPathnameWithoutLocale,
} from '#/common/routing/appletBuildMode'
import {
  getAppletNamespaceForRouteSlug,
  getPublicAppletRouteSlug,
} from '#/common/routing/publicRoutes'
import { Home } from '#/components/icons'
import { MapButton } from './MapButton'
import { MapButtonMenu } from './MapButtonMenu'
import { MapLoginButton } from './MapLoginButton'

type Props = {
  isVertical: boolean
  loginDefaultMenuOpen?: boolean
  languageDefaultMenuOpen?: boolean
}

const localeMenuItemSx = {
  width: '100%',
  px: 2.5,
  py: 1.25,
  m: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
  textAlign: 'left',
  font: 'inherit',
  typography: 'body1',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
  '&:focus-visible': {
    outline: (theme) => `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: -2,
  },
  '&[aria-current="true"]': {
    backgroundColor: 'action.selected',
  },
} satisfies AppSxProps

const buttonTypeProps = { type: 'button' } as const

const MAIN_NAMESPACE = 'main'
const APPLET_NAMESPACES = [
  'energiakartta',
  'hiilikartta',
  'luonnonmetsakartat',
] as const

type AppletNamespace = (typeof APPLET_NAMESPACES)[number]
type ActiveNamespace = typeof MAIN_NAMESPACE | AppletNamespace

const isAppletNamespace = (value: string): value is AppletNamespace =>
  APPLET_NAMESPACES.includes(value as AppletNamespace)

const getStandaloneAppletNamespace = (): ActiveNamespace | null => {
  if (compiledApplets.length !== 1 || compiledApplets[0] === MAIN_NAMESPACE) {
    return null
  }

  const [namespace] = compiledApplets
  return isAppletNamespace(namespace) ? namespace : null
}

const getLocalizedLabel = ({
  locale,
  fi,
  en,
}: {
  locale: string
  fi: string
  en: string
}) => (locale.toLowerCase() === 'fi' ? fi : en)

const capitalizeFirst = (value: string) =>
  value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value

const getLocaleName = ({
  localeCode,
  displayLocale,
}: {
  localeCode: string
  displayLocale: string
}) => {
  try {
    const displayNames = new Intl.DisplayNames([displayLocale], {
      type: 'language',
    })
    const name = displayNames.of(localeCode)
    return name ? capitalizeFirst(name) : localeCode.toUpperCase()
  } catch {
    return localeCode.toUpperCase()
  }
}

export const MapUserButtons = ({
  isVertical,
  loginDefaultMenuOpen,
  languageDefaultMenuOpen,
}: Props) => {
  const router = useAppRouter()
  const pathname = useAppPathname()
  const searchParams = useAppSearchParams()
  const params = useAppParams()
  const isBaseDomainForApplet = useUIStore(
    (state) => state.isBaseDomainForApplet
  )

  const localeParam = params.locale
  const locale =
    typeof localeParam === 'string'
      ? localeParam
      : Array.isArray(localeParam)
        ? (localeParam[0] ?? 'en')
        : 'en'

  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname, locale)
  const standaloneAppletNamespace = getStandaloneAppletNamespace()

  const activeNamespace = useMemo<ActiveNamespace>(() => {
    if (standaloneAppletNamespace) {
      return standaloneAppletNamespace
    }

    const [firstSegment] = pathnameWithoutLocale
      .split('/')
      .filter((segment) => segment.length > 0)

    const appletNamespace = getAppletNamespaceForRouteSlug(firstSegment)

    return appletNamespace && isAppletNamespace(appletNamespace)
      ? appletNamespace
      : MAIN_NAMESPACE
  }, [pathnameWithoutLocale, standaloneAppletNamespace])

  const supportedLocales = useMemo(() => {
    const locales = getLocalesForApplet(activeNamespace)
    if (locales.length > 0) {
      return locales
    }
    return getLocalesForApplet(MAIN_NAMESPACE)
  }, [activeNamespace])

  const shownLocale = (
    supportedLocales.includes(locale) ? locale : (supportedLocales[0] ?? locale)
  ).toUpperCase()

  const homePathWithoutLocale =
    activeNamespace === MAIN_NAMESPACE ||
    standaloneAppletNamespace != null ||
    isBaseDomainForApplet
      ? '/'
      : `/${getPublicAppletRouteSlug(activeNamespace)}`

  const showHomeButton = pathnameWithoutLocale !== homePathWithoutLocale

  const homeHref = homePathWithoutLocale

  const queryString = searchParams.toString()
  const currentHref =
    pathnameWithoutLocale === '/'
      ? `/${queryString ? `?${queryString}` : ''}`.replace(/\/\?/, '/?')
      : `${pathnameWithoutLocale}${queryString ? `?${queryString}` : ''}`

  const homeButtonLabel = getLocalizedLabel({
    locale,
    fi: 'Siirry etusivulle',
    en: 'Go to home page',
  })
  const languageButtonLabel = getLocalizedLabel({
    locale,
    fi: 'Vaihda kieltä',
    en: 'Change language',
  })
  const languageMenuLabel = getLocalizedLabel({
    locale,
    fi: 'Kielivalikko',
    en: 'Language menu',
  })

  const localeMenuContent =
    supportedLocales.length > 1
      ? ({ closeMenu }: { closeMenu: () => void }) => (
          <Box key="language-menu-content" sx={{ minWidth: '10rem' }}>
            <Box role="menu" aria-label={languageMenuLabel} sx={{ py: 1 }}>
              {supportedLocales.map((supportedLocale) => (
                <Box
                  key={supportedLocale}
                  component="button"
                  {...buttonTypeProps}
                  role="menuitem"
                  aria-current={supportedLocale === locale ? 'true' : undefined}
                  aria-label={getLocaleName({
                    localeCode: supportedLocale,
                    displayLocale: locale,
                  })}
                  onClick={() => {
                    closeMenu()
                    if (supportedLocale !== locale) {
                      router.replace(currentHref as never, {
                        locale: supportedLocale,
                      })
                    }
                  }}
                  sx={localeMenuItemSx}
                >
                  <Box
                    component="span"
                    sx={{
                      fontWeight: supportedLocale === locale ? 600 : 400,
                    }}
                  >
                    {getLocaleName({
                      localeCode: supportedLocale,
                      displayLocale: locale,
                    })}
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {supportedLocale}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )
      : undefined

  return (
    <>
      {showHomeButton && (
        <MapButton
          size="small"
          tooltip={homeButtonLabel}
          aria-label={homeButtonLabel}
          isVertical={isVertical}
          onClick={() => router.push(homeHref as never)}
        >
          <Home />
        </MapButton>
      )}
      <MapLoginButton
        isVertical={isVertical}
        defaultMenuOpen={loginDefaultMenuOpen}
      />
      <MapButtonMenu
        isVertical={isVertical}
        placement={isVertical ? 'left-start' : 'bottom-start'}
        menuContent={localeMenuContent}
        paperSx={{ p: 0, overflow: 'hidden' }}
        defaultOpen={languageDefaultMenuOpen}
      >
        <MapButton
          size="small"
          disabled={supportedLocales.length <= 1}
          tooltip={supportedLocales.length > 1 ? languageButtonLabel : undefined}
          aria-label={`${languageButtonLabel}: ${shownLocale}`}
          isVertical={isVertical}
          sx={{
            fontSize: '0.95rem',
            fontWeight: 500,
            letterSpacing: '0.04em',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          {shownLocale}
        </MapButton>
      </MapButtonMenu>
    </>
  )
}
