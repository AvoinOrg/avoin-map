'use client'

import { useMemo } from 'react'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { Button as BaseButton } from '@base-ui/react/button'
import { css } from 'styled-system/css'

import { useRouter } from '#/common/navigation/navigation'
import { Box } from '#/components/common/PandaBox'
import { getLocalesForApplet } from '#/common/navigation/tolgee/shared'
import { useUIStore } from '#/common/store'
import { getRoute } from '#/common/routing/routing-client'
import {
  compiledApplets,
  getPathnameWithoutLocale,
} from '#/common/routing/routing'
import {
  MAIN_NAMESPACE,
  mainRouteTree,
} from '#/common/routing/routes/main'
import {
  APPLET_NAMESPACE as ENERGIAKARTTA_NAMESPACE,
  routeTree as energiakarttaRouteTree,
} from '#/common/routing/routes/energiakartta'
import {
  APPLET_NAMESPACE as HIIILIKARTTA_NAMESPACE,
  routeTree as hiilikarttaRouteTree,
} from '#/common/routing/routes/hiilikartta'
import {
  APPLET_NAMESPACE as LUONNONMETSAKARTAT_NAMESPACE,
  routeTree as luonnonmetsakartatRouteTree,
} from '#/common/routing/routes/luonnonmetsakartat'
import { Home } from '#/components/icons'
import { MapButton } from './MapButton'
import { MapButtonMenu } from './MapButtonMenu'
import { MapLoginButton } from './MapLoginButton'

type Props = {
  isVertical: boolean
}

const APPLET_ROUTE_TREES = {
  [ENERGIAKARTTA_NAMESPACE]: energiakarttaRouteTree,
  [HIIILIKARTTA_NAMESPACE]: hiilikarttaRouteTree,
  [LUONNONMETSAKARTAT_NAMESPACE]: luonnonmetsakartatRouteTree,
} as const

type AppletNamespace = keyof typeof APPLET_ROUTE_TREES
type ActiveNamespace = typeof MAIN_NAMESPACE | AppletNamespace

const isAppletNamespace = (value: string): value is AppletNamespace =>
  value in APPLET_ROUTE_TREES

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

export const MapUserButtons = ({ isVertical }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()
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

    return firstSegment && isAppletNamespace(firstSegment)
      ? firstSegment
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
      : `/${activeNamespace}`

  const showHomeButton = pathnameWithoutLocale !== homePathWithoutLocale

  const homeRouteTree =
    activeNamespace === MAIN_NAMESPACE
      ? mainRouteTree
      : APPLET_ROUTE_TREES[activeNamespace]
  const homeHref = getRoute({
    routeNode: homeRouteTree,
    routeTree: homeRouteTree,
  })

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
          <Box styleProps={{ minWidth: '10rem' }}>
            <Box
              role="menu"
              aria-label={languageMenuLabel}
              styleProps={{ display: 'flex', flexDirection: 'column', py: 1 }}
            >
              {supportedLocales.map((supportedLocale) => (
                <BaseButton
                  key={supportedLocale}
                  type="button"
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
                  className={css({
                    px: 2.5,
                    py: 1.25,
                    border: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    textStyle: 'body1',
                    width: '100%',
                    backgroundColor:
                      supportedLocale === locale
                        ? 'neutral.main'
                        : 'transparent',
                    color: 'neutral.darker',
                    textAlign: 'left',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'neutral.main',
                    },
                    '&:focus-visible': {
                      outline: '2px solid var(--colors-secondary-dark)',
                      outlineOffset: '-2px',
                    },
                  })}
                >
                  <Box
                    component="span"
                    styleProps={{
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
                    styleProps={{
                      color: 'neutral.dark',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {supportedLocale}
                  </Box>
                </BaseButton>
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
      <MapLoginButton isVertical={isVertical} />
      <MapButtonMenu
        isVertical={isVertical}
        placement={isVertical ? 'left-start' : 'bottom-start'}
        menuContent={localeMenuContent}
        paperSx={{ p: 0, overflow: 'hidden' }}
      >
        <MapButton
          size="small"
          disabled={supportedLocales.length <= 1}
          tooltip={supportedLocales.length > 1 ? languageButtonLabel : undefined}
          aria-label={`${languageButtonLabel}: ${shownLocale}`}
          isVertical={isVertical}
          styleProps={{
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
