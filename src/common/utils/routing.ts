import { ReadonlyURLSearchParams } from 'next/navigation'

import { LOCALES } from '#/common/navigation/tolgee/shared'
import { RouteTree, RouteObject, Params, RouteForLinks } from '../types/routing'

const toQueryString = (queryParams: Params['queryParams']): string => {
  if (!queryParams) {
    return ''
  }

  // Handle URLSearchParams and ReadonlyURLSearchParams
  if (
    queryParams instanceof URLSearchParams ||
    queryParams instanceof ReadonlyURLSearchParams
  ) {
    return `?${queryParams.toString()}`
  }

  // Handle Record<string, string>
  const parts = Object.keys(queryParams as Record<string, string>).map(
    (key) => {
      const value = (queryParams as Record<string, string>)[key]
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    }
  )

  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

const getRouteChildren = (routeTree: RouteTree) => {
  const children = []
  for (const key in routeTree) {
    if (key.charAt(0) !== '_') {
      children.push(routeTree[key])
    }
  }

  return children
}

const getRouteWithoutChildren = (routeTree: RouteTree) => {
  const keys = []
  for (const key in routeTree) {
    if (key.charAt(0) === '_') {
      keys.push(key)
    }
  }

  const route: any = {}
  for (const key of keys) {
    route[key] = routeTree[key]
  }

  return route
}

const findRouteObjects = (
  route: RouteTree,
  routeTree: RouteTree,
  routeObjects: RouteObject[] = []
): any => {
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

export const getRouteNoStoreCheck = (
  route: RouteTree,
  routeTree: RouteTree,
  { routeParams = {}, queryParams = {} }: Params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0
) => {
  let routeObjects = findRouteObjects(route, routeTree)

  if (!routeObjects) {
    throw new Error('Route not found: ' + route + ' in ' + routeTree)
  }
  // Remove the last steps from the route, e.g. removeSteps = 1 will take the parent route
  routeObjects = routeObjects.slice(0, routeObjects.length - removeSteps)

  if (routeObjects.length === 0) {
    throw new Error('Route not found: ' + route + ' in ' + routeTree)
  }

  if (removeStepsFromRoot > 0) {
  }

  for (let i = 0; i < removeStepsFromRoot; i++) {
    routeObjects.shift()
  }

  let path = ''
  for (const routeObject of routeObjects) {
    if (routeObject._conf) {
      const pathParts: string[] = routeObject._conf.path.split('/')
      for (const pathPart of pathParts) {
        if (pathPart.length > 0) {
          if (pathPart.startsWith('[') && pathPart.endsWith(']')) {
            const paramName = pathPart.slice(1, -1) // Remove the brackets
            if (routeParams[paramName] == null) {
              throw new Error(
                `Not enough params provided for route: ${JSON.stringify(
                  route,
                  null,
                  2
                )} in ${JSON.stringify(
                  routeTree,
                  null,
                  2
                )} with params: ${JSON.stringify(routeParams, null, 2)}`
              )
            }
            path += `/${routeParams[paramName]}`
          } else {
            path += `/${pathPart}`
          }
        }
      }
    }
  }

  // check if the path is empty, if so, return the root path
  if (path === '') {
    path = '/'
  }

  return path + toQueryString(queryParams)
}

export const getRouteParent = (
  route: RouteTree,
  routeTree: RouteTree,
  params: Params = {}
) => {
  const path = getRouteNoStoreCheck(route, routeTree, params, 1)
  return path
}

export const getRoutesForPath = (
  path: string,
  routeTree: RouteTree
): RouteForLinks[] => {
  const pathWithoutQuery = path.split('?')[0]
  const subPaths = pathWithoutQuery
    .toLowerCase()
    .split('/')
    .filter((p) => p.length > 0)

  // remove the locale from the path
  if (subPaths.length > 0 && LOCALES.includes(subPaths[0].toLowerCase())) {
    subPaths.shift()
  }

  // ensure that the basePath only has a starting slash
  const basePath = '/' + routeTree._conf.path.replace(/^\/|\/$/g, '')
  const routes: RouteForLinks[] = [
    { name: routeTree._conf.name, path: basePath, routeTree: routeTree },
  ]

  if (basePath === '/' + subPaths[0]) {
    subPaths.shift()
  }

  const accumulatedParams: Record<string, string> = {}

  let currentPath = basePath.length > 1 ? basePath : ''

  let currentRouteTree = routeTree

  let i = 0

  while (i < subPaths.length) {
    let foundChild = false
    const children = getRouteChildren(currentRouteTree)
    const subPath = subPaths[i]

    for (const child of children) {
      if (child._conf && child._conf.path.includes(subPath)) {
        if (child._conf.path === subPath) {
          currentPath += `/${subPath}`

          const route: RouteForLinks = {
            name: child._conf.name,
            path: currentPath,
            routeTree: child,
          }

          if (Object.keys(accumulatedParams).length > 0) {
            route.params = { routeParams: { ...accumulatedParams } }
          }

          routes.push(route)

          currentRouteTree = child
          foundChild = true
          i++
          break
        } else {
          const splitPaths = child._conf.path
            .split('/')
            .filter((p: string) => p.length > 0)

          if (
            splitPaths[0] !== subPath &&
            !splitPaths[0].startsWith('[') &&
            !splitPaths[0].endsWith(']')
          ) {
            break
          }

          if (splitPaths.length > 0) {
            const max = splitPaths.length + i

            let splitIndex = 0
            while (i < max) {
              // get the used param if the path is dynamic
              if (
                splitPaths[splitIndex].startsWith('[') &&
                splitPaths[splitIndex].endsWith(']')
              ) {
                const paramName = splitPaths[splitIndex].slice(1, -1)
                accumulatedParams[paramName] = subPaths[i]
              }

              currentPath += `/${subPaths[i]}`
              i++
              splitIndex++
            }

            const route: RouteForLinks = {
              name: child._conf.name,
              path: currentPath,
              routeTree: child,
            }

            if (Object.keys(accumulatedParams).length > 0) {
              route.params = { routeParams: { ...accumulatedParams } }
            }

            routes.push(route)

            currentRouteTree = child
            foundChild = true
            break
          } else {
            throw new Error(
              'RouteTree contains invalid paths: ' + child + ' in ' + routeTree
            )
          }
        }
      } else if (
        child._conf.path.startsWith('[') &&
        child._conf.path.endsWith(']')
      ) {
        currentPath += `/${subPath}`
        const paramName = child._conf.path.slice(1, -1)
        accumulatedParams[paramName] = subPath

        routes.push({
          name: child._conf.name,
          params: { routeParams: { ...accumulatedParams } },
          path: currentPath,
          routeTree: child,
        })

        currentRouteTree = child
        foundChild = true
        i++
        break
      }
    }

    if (!foundChild) {
      throw new Error('Route not found: ' + path + ' in ' + routeTree)
    }
  }
  return routes
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
    if (key !== '_conf' && tree[key]._conf) {
      paths.push(...generatePaths(tree[key], currentPath))
    }
  }

  return paths
}

export const generatePathNames = (
  routeTrees: RouteTree[] | any
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
