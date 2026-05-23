import { createNavigation } from 'next-intl/navigation'
import { defineRouting, type Pathnames } from 'next-intl/routing'

import { DEFAULT_LOCALE, LOCALES } from '#/common/navigation/tolgee/shared'
import { generatePathNames } from '#/common/routing/routing'
import { RouteTree } from '#/common/types/routing'

const requireRouteTrees = (require as any).context('#/app', true, /routes\.ts$/)
const routeTrees: RouteTree[] = requireRouteTrees.keys().map((key: string) => {
  const module = requireRouteTrees(key)
  return module.routeTree
})

// Generate pathnames
const mainPathnames = { '/': '/' } satisfies Pathnames<typeof LOCALES>
const generatedPathnames = generatePathNames(routeTrees)
const pathnames = { ...mainPathnames, ...generatedPathnames }
const defaultRoutingLocale = LOCALES.includes(DEFAULT_LOCALE)
  ? DEFAULT_LOCALE
  : (LOCALES[0] ?? DEFAULT_LOCALE)

export { pathnames }

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: defaultRoutingLocale,
  pathnames,
})

export const {
  Link: NextIntlLink,
  redirect,
  usePathname,
  useRouter,
} = createNavigation(routing)
