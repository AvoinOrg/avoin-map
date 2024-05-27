import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation'

import { LOCALES } from '#/common/tolgee/shared'
import { generatePathNames } from '#/common/utils/routing'
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

export { pathnames }

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales: LOCALES, pathnames })
