import appletConf from '../../../appletConf.json'
import { createPublicRouteContract } from './publicRouteContract/index.js'
import type { PublicRouteContract } from './publicRouteContract/index.js'

type AppletConfManifest = typeof appletConf

export type PublicAppletNamespace = {
  [Namespace in keyof AppletConfManifest]: AppletConfManifest[Namespace] extends {
    publicRoute: unknown
  }
    ? Namespace
    : never
}[keyof AppletConfManifest]

export type {
  AppletRouteSlugInfo,
  LegacySubpathRedirect,
  PublicAppletRouteFact,
  PublicRouteContract,
} from './publicRouteContract/index.js'
export { createPublicRouteContract } from './publicRouteContract/index.js'

const contract = createPublicRouteContract<PublicAppletNamespace>(appletConf)

export const {
  PUBLIC_APPLET_NAMESPACES,
  PUBLIC_APPLET_ROUTE_FACTS,
  getAppletNamespaceForLegacyRouteSlug,
  getAppletNamespaceForPublicRouteSlug,
  getAppletNamespaceForRouteSlug,
  getAppletRouteSlugInfo,
  getLegacySubpathRedirects,
  getPublicAppletRouteSlug,
  getPublicRouteFact,
  getRouteFolderForApplet,
  isPublicAppletNamespace,
  normalizeLegacyAppletRootSubpathSegments,
  normalizeLegacyAppletSubpathSegments,
}: PublicRouteContract<PublicAppletNamespace> = contract
