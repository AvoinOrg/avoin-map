import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation'
const requireRouteTrees = (require as any).context('#/app', true, /routes\.ts$/)
import { LOCALES } from '#/common/tolgee/shared'
import { generatePathNames } from '#/common/utils/routing'

const routeTrees = requireRouteTrees.keys().map(requireRouteTrees)

// Generate pathnames
const mainPathnames = { '/': '/' } satisfies Pathnames<typeof LOCALES>
const generatedPathnames = generatePathNames(routeTrees)
const pathnames = { ...mainPathnames, ...generatedPathnames }

export { pathnames }

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales: LOCALES, pathnames })
