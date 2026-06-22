import { LOCALES } from '#/common/navigation/tolgee/shared'
import {
  RouteTree,
  Params,
  RouteForLinks,
  QueryParamRecord,
  SearchParamsLike,
} from '../types/routing'

export const compiledApplets = (process.env.NEXT_PUBLIC_COMPILED_APPLETS || '')
  .toLowerCase()
  .trim()
  .split(',')
  .filter(Boolean)

const normalizeDomain = (domain?: string | null) => {
  if (!domain) return undefined
  return domain.replace(/\/+$/, '')
}

const buildPathFromSegments = (segments: string[], domain?: string): string => {
  const normalizedDomain = normalizeDomain(domain)
  if (normalizedDomain) {
    return segments.length > 0
      ? `${normalizedDomain}/${segments.join('/')}`
      : normalizedDomain
  }
  if (segments.length === 0) {
    return '/'
  }
  return `/${segments.join('/')}`
}

const splitPathParts = (path: string) =>
  path
    .split('/')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)

export const isRouteObjectDynamicSegment = (part: string) =>
  part.startsWith('[') && part.endsWith(']')

export const isStartFileDynamicSegment = (part: string) =>
  part.startsWith('$') && part.length > 1

export const getDynamicSegmentParamName = (part: string) => {
  if (isRouteObjectDynamicSegment(part)) {
    return part.slice(1, -1)
  }

  if (isStartFileDynamicSegment(part)) {
    return part.slice(1)
  }

  return null
}

const isSearchParamsLike = (
  queryParams: Params['queryParams']
): queryParams is SearchParamsLike =>
  queryParams != null &&
  typeof queryParams === 'object' &&
  typeof queryParams.toString === 'function' &&
  (typeof queryParams.entries === 'function' ||
    typeof queryParams.forEach === 'function')

const toQueryString = (queryParams: Params['queryParams']): string => {
  if (!queryParams) {
    return ''
  }

  if (isSearchParamsLike(queryParams)) {
    const serialized = queryParams.toString()
    return serialized ? `?${serialized}` : ''
  }

  const parts = Object.keys(queryParams as QueryParamRecord)
    .map((key) => {
      const value = (queryParams as QueryParamRecord)[key]
      if (value == null) {
        return null
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    })
    .filter((part): part is string => part != null)

  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

const isRouteTreeChild = (child: unknown): child is RouteTree => {
  if (child == null || typeof child !== 'object' || !('_conf' in child)) {
    return false
  }

  const conf = (child as { _conf?: unknown })._conf
  return conf != null && typeof conf === 'object' && 'path' in conf
}

type RoutePathNode = Pick<RouteTree, '_conf'>

const getRouteChildren = (routeTree: RouteTree): RouteTree[] => {
  const children: RouteTree[] = []
  for (const key in routeTree) {
    const child = routeTree[key]
    if (key.charAt(0) !== '_' && isRouteTreeChild(child)) {
      children.push(child)
    }
  }

  return children
}

const getRouteWithoutChildren = (routeTree: RouteTree): RoutePathNode => ({
  _conf: routeTree._conf,
})

const findRouteObjects = (
  route: RouteTree,
  routeTree: RouteTree,
  routeObjects: RoutePathNode[] = []
): RoutePathNode[] | undefined => {
  const currentRoute = getRouteWithoutChildren(routeTree)
  const routeObjectsCopy = [...routeObjects]
  routeObjectsCopy.push(currentRoute)
  if (route === routeTree) {
    return routeObjectsCopy
  }

  for (const child of getRouteChildren(routeTree)) {
    const objects = findRouteObjects(route, child, routeObjectsCopy)
    if (objects) {
      return objects
    }
  }
}

/**
 * Creates a route from routeTree. For mutable links that work within domained
 * applets, use getRoute
 */

interface GetRouteNoStoreCheckParams extends Params {
  routeNode: RouteTree
  routeTree: RouteTree
  params?: Params
  removeSteps?: number
  removeStepsFromRoot?: number
}

export const getRouteNoStoreCheck = ({
  routeNode,
  routeTree,
  params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0,
}: GetRouteNoStoreCheckParams): string => {
  let routeObjects = findRouteObjects(routeNode, routeTree)
  const { routeParams = {}, queryParams = {} } = params

  if (!routeObjects) {
    throw new Error('Route not found: ' + routeNode + ' in ' + routeTree)
  }
  // Remove the last steps from the route, e.g. removeSteps = 1 will take the parent route
  routeObjects = routeObjects.slice(0, routeObjects.length - removeSteps)

  if (routeObjects.length === 0) {
    throw new Error('Route not found: ' + routeNode + ' in ' + routeTree)
  }

  if (removeStepsFromRoot > 0) {
  }

  for (let i = 0; i < removeStepsFromRoot; i++) {
    routeObjects.shift()
  }

  let pathSegments: string[] = []
  let currentDomain: string | undefined

  for (const routeObject of routeObjects) {
    if (!routeObject._conf) continue

    const { path: routePath, domain } = routeObject._conf
    const normalizedDomain = normalizeDomain(domain)
    if (normalizedDomain) {
      currentDomain = normalizedDomain
      pathSegments = []
    }

    const pathParts = splitPathParts(routePath)
    for (const part of pathParts) {
      const paramName = getDynamicSegmentParamName(part)
      if (paramName) {
        const paramValue = routeParams[paramName]
        if (paramValue == null) {
          throw new Error(
            `Not enough params provided for route: ${JSON.stringify(
              routeNode,
              null,
              2
            )} in ${JSON.stringify(
              routeTree,
              null,
              2
            )} with params: ${JSON.stringify(routeParams, null, 2)}`
          )
        }
        pathSegments.push(String(paramValue))
      } else {
        pathSegments.push(part)
      }
    }
  }

  const path = buildPathFromSegments(pathSegments, currentDomain)
  return path + toQueryString(queryParams)
}

export const getRouteParent = (
  route: RouteTree,
  routeTree: RouteTree,
  params: Params = {}
) => {
  const path = getRouteNoStoreCheck({
    routeNode: route,
    routeTree: routeTree,
    params: params,
    removeSteps: 1,
  })
  return path
}

type PathMatchResult = {
  matched: boolean
  nextIndex: number
  params: Record<string, string>
}

const matchPathParts = (
  routePath: string,
  segments: string[],
  startIndex: number,
  params: Record<string, string>
): PathMatchResult => {
  const parts = splitPathParts(routePath)
  let index = startIndex
  const updatedParams = { ...params }

  for (const part of parts) {
    if (index >= segments.length) {
      return { matched: false, nextIndex: startIndex, params }
    }

    const segment = segments[index]
    const paramName = getDynamicSegmentParamName(part)
    if (paramName) {
      updatedParams[paramName] = segment
    } else if (part.toLowerCase() !== segment.toLowerCase()) {
      return { matched: false, nextIndex: startIndex, params }
    }

    index++
  }

  return { matched: true, nextIndex: index, params: updatedParams }
}

type RouteMatch = {
  routes: RouteForLinks[]
  consumed: number
}

const matchRouteNode = (
  node: RouteTree,
  segments: string[],
  origin: string | undefined,
  domainContext: string | undefined,
  startIndex: number,
  params: Record<string, string>,
  root: RouteTree
): RouteMatch | null => {
  const conf = node._conf
  if (!conf) {
    return null
  }

  const ownDomain = normalizeDomain(conf.domain)
  const effectiveDomain = ownDomain ?? domainContext
  const hasOwnDomain = ownDomain != null
  const normalizedOrigin = origin

  const exploreChildren = (
    inheritedDomain: string | undefined,
    inheritedStartIndex: number,
    inheritedParams: Record<string, string>,
    requireDomainedChild: boolean
  ): RouteMatch | null => {
    let bestMatch: RouteMatch | null = null
    for (const child of getRouteChildren(node)) {
      if (requireDomainedChild && !normalizeDomain(child._conf?.domain)) {
        continue
      }

      const childMatch = matchRouteNode(
        child,
        segments,
        origin,
        inheritedDomain,
        inheritedStartIndex,
        { ...inheritedParams },
        root
      )
      if (!childMatch) {
        continue
      }

      if (!bestMatch || childMatch.consumed > bestMatch.consumed) {
        bestMatch = childMatch
      }

      if (childMatch.consumed === segments.length) {
        break
      }
    }
    return bestMatch
  }

  if (
    effectiveDomain &&
    normalizedOrigin &&
    effectiveDomain !== normalizedOrigin
  ) {
    return exploreChildren(domainContext, startIndex, params, true)
  }

  const matchStartIndex = hasOwnDomain ? 0 : startIndex
  let matchResult = matchPathParts(
    conf.path,
    segments,
    matchStartIndex,
    params
  )

  if (
    !matchResult.matched &&
    node === root &&
    conf.isAppletRoot &&
    splitPathParts(conf.path).length > 0
  ) {
    matchResult = matchPathParts('/', segments, matchStartIndex, params)
  }

  if (!matchResult.matched) {
    return exploreChildren(domainContext, startIndex, params, true)
  }

  const updatedParams = matchResult.params

  const routePath = getRouteNoStoreCheck({
    routeNode: node,
    routeTree: root,
    params: { routeParams: updatedParams },
  })

  const route: RouteForLinks = {
    name: conf.name,
    path: routePath,
    routeTree: node,
  }

  if (Object.keys(updatedParams).length > 0) {
    route.params = { routeParams: { ...updatedParams } }
  }

  const routes: RouteForLinks[] = [route]
  const nextDomainContext = effectiveDomain
  const nextStartIndex = matchResult.nextIndex

  const childMatch = exploreChildren(
    nextDomainContext,
    nextStartIndex,
    updatedParams,
    false
  )

  if (childMatch) {
    return {
      routes: routes.concat(childMatch.routes),
      consumed: childMatch.consumed,
    }
  }

  return {
    routes,
    consumed: nextStartIndex,
  }
}

const parsePathIntoSegments = (path: string) => {
  const [pathWithoutQuery] = path.split('?')
  let origin: string | undefined
  let pathname = pathWithoutQuery

  try {
    const url = new URL(pathWithoutQuery)
    origin = url.origin
    pathname = url.pathname
  } catch {
    if (pathWithoutQuery.startsWith('//')) {
      try {
        const url = new URL(`http:${pathWithoutQuery}`)
        origin = url.origin
        pathname = url.pathname
      } catch {
        // ignore invalid URL, treat as relative path
      }
    }
  }

  let segments = pathname
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)

  if (segments.length > 0 && LOCALES.includes(segments[0].toLowerCase())) {
    segments = segments.slice(1)
  }

  return {
    origin: normalizeDomain(origin),
    segments,
  }
}

export const getRoutesForPath = (
  path: string,
  routeTree: RouteTree
): RouteForLinks[] => {
  const { origin, segments } = parsePathIntoSegments(path)

  const match = matchRouteNode(
    routeTree,
    segments,
    origin,
    undefined,
    0,
    {},
    routeTree
  )

  if (!match) {
    throw new Error('Route not found: ' + path + ' in ' + routeTree)
  }

  if (segments.length > 0 && match.consumed < segments.length) {
    throw new Error('Route not found: ' + path + ' in ' + routeTree)
  }

  return match.routes
}

// export const getRoutesForPath = (
//   path: string,
//   routeTree: RouteTree
// ): RouteForLinks[] => {
//   const pathWithoutQuery = path.split('?')[0];
//   let subPaths = pathWithoutQuery
//     .toLowerCase()
//     .split('/')
//     .filter((p) => p.length > 0);

//   // Remove locale if present
//   if (subPaths.length > 0 && LOCALES.includes(subPaths[0].toLowerCase())) {
//     subPaths.shift();
//   }

//   let accumulatedParams: Record<string, string> = {};
//   const routes: RouteForLinks[] = [];

//   // --- Match the root routeTree._conf.path against the initial subPaths ---
//   const rootPathConf = routeTree._conf.path;
//   const rootPathConfSegments = rootPathConf.split('/').filter(p => p.length > 0);
//   let rootPathMatchedUrlSegments: string[] = [];
//   let rootPathConsumedUrlSegmentsCount = 0;

//   if (rootPathConfSegments.length > 0) {
//     if (subPaths.length < rootPathConfSegments.length) {
//       // This error means the input path is shorter than the defined root path of the routeTree
//       // e.g. routeTree expects "/app/[id]" but path is "/app"
//       throw new Error(
//         `Path "${path}" is too short to match root routeTree base path "${rootPathConf}". Remaining path segments: "${subPaths.join('/')}"`
//       );
//     }
//     for (let k = 0; k < rootPathConfSegments.length; k++) {
//       const confSegment = rootPathConfSegments[k];
//       const urlSegment = subPaths[k];
//       if (confSegment.startsWith('[') && confSegment.endsWith(']')) {
//         const paramName = confSegment.slice(1, -1);
//         accumulatedParams[paramName] = urlSegment;
//         rootPathMatchedUrlSegments.push(urlSegment);
//         rootPathConsumedUrlSegmentsCount++;
//       } else if (confSegment === urlSegment) {
//         rootPathMatchedUrlSegments.push(urlSegment);
//         rootPathConsumedUrlSegmentsCount++;
//       } else {
//         throw new Error(
//           `Path "${path}" does not match root routeTree base path "${rootPathConf}" at segment "${confSegment}" (expected) vs "${urlSegment}" (actual).`
//         );
//       }
//     }
//   }

//   const initialFullPath = ('/' + rootPathMatchedUrlSegments.join('/')).replace(/\/+/g, '/') || '/';
//   routes.push({
//     name: routeTree._conf.name,
//     path: initialFullPath,
//     routeTree: routeTree,
//     params: { ...accumulatedParams },
//   });

//   // Update subPaths to only contain segments not consumed by the root path match
//   subPaths = subPaths.slice(rootPathConsumedUrlSegmentsCount);

//   let currentRouteTree = routeTree;
//   let currentParentPath = initialFullPath;

//   // --- Loop through children to match remaining subPaths ---
//   while (subPaths.length > 0) {
//     let foundChild = false;
//     const children = getRouteChildren(currentRouteTree);

//     for (const child of children) {
//       if (!child._conf) continue;

//       const childDefinedPath = child._conf.path;
//       const childDefinedPathSegments = childDefinedPath.split('/').filter(p => p.length > 0);

//       if (childDefinedPathSegments.length === 0) continue; // Child path conf must have segments
//       if (subPaths.length < childDefinedPathSegments.length) continue; // Not enough remaining URL segments for this child

//       let tempProposedParams = { ...accumulatedParams }; // Inherit params from parent scope
//       let numUrlSegmentsConsumedByThisChild = 0;
//       let pathSegmentsForThisChildMatch: string[] = [];

//       let matchSuccessful = true;
//       for (let k = 0; k < childDefinedPathSegments.length; k++) {
//         const definedSegment = childDefinedPathSegments[k];
//         const urlSegmentToMatch = subPaths[k]; // Match against the current start of subPaths

//         if (definedSegment.startsWith('[') && definedSegment.endsWith(']')) {
//           const paramName = definedSegment.slice(1, -1);
//           tempProposedParams[paramName] = urlSegmentToMatch;
//           pathSegmentsForThisChildMatch.push(urlSegmentToMatch);
//           numUrlSegmentsConsumedByThisChild++;
//         } else if (definedSegment === urlSegmentToMatch) {
//           pathSegmentsForThisChildMatch.push(urlSegmentToMatch);
//           numUrlSegmentsConsumedByThisChild++;
//         } else {
//           matchSuccessful = false;
//           break;
//         }
//       }

//       if (matchSuccessful) {
//         // Construct the full path for this matched child
//         let nextFullPath = currentParentPath;
//         if (pathSegmentsForThisChildMatch.length > 0) {
//           if (nextFullPath === '/') { // Avoid double slash at root
//             nextFullPath = '/' + pathSegmentsForThisChildMatch.join('/');
//           } else {
//             nextFullPath += '/' + pathSegmentsForThisChildMatch.join('/');
//           }
//         }
//         nextFullPath = nextFullPath.replace(/\/+/g, '/') || '/'; // Normalize and ensure root is '/'

//         accumulatedParams = tempProposedParams; // Update the main accumulatedParams for subsequent children/levels

//         routes.push({
//           name: child._conf.name,
//           path: nextFullPath,
//           routeTree: child,
//           params: { ...accumulatedParams }, // Store a snapshot of all params up to this point
//         });

//         currentRouteTree = child;
//         currentParentPath = nextFullPath;
//         foundChild = true;
//         subPaths = subPaths.slice(numUrlSegmentsConsumedByThisChild); // Consume matched segments
//         break; // Move to match children of this newly matched child
//       }
//     } // End for (child of children)

//     if (!foundChild) {
//       // If subPaths still has items, but no child matched them
//       throw new Error(
//         `Route not found. Could not match remaining segments "${subPaths.join('/')}" from original path "${path}". Last successful path: "${currentParentPath}".`
//       );
//     }
//   } // End while (subPaths.length > 0)

//   return routes;
// };

export const getBaseUrl = () => {
  let baseUrl = ''
  if (process.env.URL != null) {
    baseUrl = `${process.env.URL}`
  } else if (process.env.DOMAIN != null) {
    baseUrl = `${process.env.DOMAIN}`
  } else if (process.env.REACT_APP_URL != null) {
    baseUrl = `${process.env.REACT_APP_URL}`
  } else if (process.env.REACT_APP_DOMAIN != null) {
    baseUrl = `${process.env.REACT_APP_DOMAIN}`
  } else if (process.env.NEXT_PUBLIC_URL != null) {
    baseUrl = `${process.env.NEXT_PUBLIC_URL}`
  } else if (process.env.NEXT_PUBLIC_DOMAIN != null) {
    baseUrl = `${process.env.NEXT_PUBLIC_DOMAIN}`
  } else if (process.env.VERCEL_URL != null) {
    baseUrl = `${process.env.VERCEL_URL}`
  } else if (process.env.VERCEL_DOMAIN != null) {
    baseUrl = `${process.env.VERCEL_DOMAIN}`
  } else if (typeof window !== 'undefined') {
    baseUrl = `${window.location.protocol}//${window.location.host}`
  } else {
    baseUrl = 'http://localhost'
    if (process.env.PORT) {
      baseUrl += `:${process.env.PORT}`
    } else if (process.env.DEV_PORT) {
      baseUrl += `:${process.env.DEV_PORT}`
    }
  }

  if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://')) {
    if (baseUrl.includes('localhost')) {
      baseUrl = `http://${baseUrl}`
    } else {
      baseUrl = `https://${baseUrl}`
    }
  }

  return baseUrl
}

const generatePaths = (tree: RouteTree, basePath = ''): string[] => {
  const paths = []
  const currentPath = `${basePath}/${tree._conf.path}`.replace(/\/+/g, '/')
  paths.push(currentPath)

  for (const key in tree) {
    const child = tree[key]
    if (key !== '_conf' && isRouteTreeChild(child)) {
      paths.push(...generatePaths(child, currentPath))
    }
  }

  return paths
}

export const generatePathNames = (
  routeTrees: RouteTree[]
): Record<string, string> => {
  const pathnames = routeTrees.reduce(
    (acc: Record<string, string>, routeTree: RouteTree) => {
      const paths = generatePaths(routeTree)
      paths.forEach((path) => {
        acc[path] = path
      })
      return acc
    },
    {}
  )

  return pathnames
}

export const getPathnameWithoutLocale = (
  pathname: string,
  locale: string | string[] | null
): string => {
  if (!pathname) return '/'
  if (!locale) return pathname

  if (Array.isArray(locale)) {
    if (locale.length === 0) {
      return pathname
    }

    locale = locale[0]
  }

  const pattern = new RegExp(`^/${locale}($|/)`)
  // Replace /locale at the start with "/"
  const cleaned = pathname.replace(pattern, '/').replace(/\/+$/, '')
  return cleaned === '' ? '/' : cleaned
}

export const getAppletRouteConfs = (namespace: string) => {
  const appletDomain =
    process.env['NEXT_PUBLIC_APPLET_' + namespace.toUpperCase() + '_DOMAIN']

  let basePath = namespace
  if (
    compiledApplets.length === 1 &&
    compiledApplets.includes(namespace.toLowerCase())
  ) {
    basePath = ''
  }

  return {
    path: basePath,
    isAppletRoot: true,
    ...(appletDomain != null && appletDomain != '' && { domain: appletDomain }),
  }
}
