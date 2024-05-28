import { Pathnames } from 'next-intl/navigation'
import { ReadonlyURLSearchParams } from 'next/navigation'

import { LOCALES } from '../tolgee/shared'
import { useUIStore } from '../store'
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
 * Creates a route from routeTree. Note that if used within an applet, the function might get called before the
 * isBaseDomainForApplet is properly set, resulting in an incorrect path, depending on whether the applet
 * is the root of the domain or not.
 */
export const getRoute = (
  route: RouteTree,
  routeTree: RouteTree,
  { routeParams = {}, queryParams = {} }: Params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0
) => {
  const isBaseDomainForApplet = useUIStore.getState().isBaseDomainForApplet

  if (
    removeStepsFromRoot === 0 &&
    routeTree._conf.isAppletRoot &&
    isBaseDomainForApplet
  ) {
    removeStepsFromRoot = 1
  }

  return getRouteNoStoreCheck(
    route,
    routeTree,
    { routeParams, queryParams },
    removeSteps,
    removeStepsFromRoot
  )
}

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
                `Not enough params provided for route: ${route} in ${routeTree} with params: ${routeParams}`
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
  const path = getRoute(route, routeTree, params, 1)
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
  const routes = [
    { name: routeTree._conf.name, path: basePath, routeTree: routeTree },
  ]

  if (basePath === '/' + subPaths[0]) {
    subPaths.shift()
  }

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

          routes.push({
            name: child._conf.name,
            path: currentPath,
            routeTree: child,
          })
          currentRouteTree = child
          foundChild = true
          i++
          break
        } else {
          const childPaths = child._conf.path
            .split('/')
            .filter((p: string) => p.length > 0)
          if (
            childPaths[0] !== subPath &&
            !childPaths[0].startsWith('[') &&
            !childPaths[0].endsWith(']')
          ) {
            break
          }

          if (childPaths.length > 0) {
            const max = childPaths.length + i
            while (i < max) {
              currentPath += `/${subPaths[i]}`
              i++
            }

            routes.push({
              name: child._conf.name,
              path: currentPath,
              routeTree: child,
            })
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

        routes.push({
          name: child._conf.name,
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
