export const PUBLIC_GEOSERVER_URL_ENV = 'PUBLIC_GEOSERVER_URL'
export const PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE_ENV =
  'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE'
export const LEGACY_PUBLIC_GEOSERVER_URL_ENV = 'NEXT_PUBLIC_GEOSERVER_URL'
export const LEGACY_PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE_ENV =
  'NEXT_PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE'

export type PublicGeoServerEnv = {
  PUBLIC_GEOSERVER_URL?: string
  PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE?: string
}

export type PublicGeoServerProblem = {
  id:
    | 'base-missing'
    | 'base-invalid-url'
    | 'base-credentials'
    | 'base-query-or-fragment'
    | 'base-undefined-host-or-path'
    | 'workspace-missing'
    | 'workspace-invalid-token'
    | 'workspace-undefined-token'
    | 'url-invalid-path'
  message: string
}

type PublicGeoServerNormalizationResult =
  | { ok: true; value: string }
  | { ok: false; problem: PublicGeoServerProblem }

export type PublicGeoServerProblemReporter = (
  problem: PublicGeoServerProblem
) => void

type PublicGeoServerResolverOptions = {
  env?: PublicGeoServerEnv
  reportProblem?: PublicGeoServerProblemReporter
}

const problems = {
  baseMissing: {
    id: 'base-missing',
    message:
      'PUBLIC_GEOSERVER_URL is required for GeoServer-backed map data; set it to an absolute http(s) GeoServer base URL.',
  },
  baseInvalidUrl: {
    id: 'base-invalid-url',
    message:
      'PUBLIC_GEOSERVER_URL must be an absolute http(s) GeoServer base URL.',
  },
  baseCredentials: {
    id: 'base-credentials',
    message: 'PUBLIC_GEOSERVER_URL must not contain credentials.',
  },
  baseQueryOrFragment: {
    id: 'base-query-or-fragment',
    message: 'PUBLIC_GEOSERVER_URL must not contain a query string or fragment.',
  },
  baseUndefinedHostOrPath: {
    id: 'base-undefined-host-or-path',
    message:
      'PUBLIC_GEOSERVER_URL must not contain the literal string "undefined" in its host or path.',
  },
  workspaceMissing: {
    id: 'workspace-missing',
    message:
      'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE is required for Luonnonmetsakartat GeoServer data.',
  },
  workspaceInvalidToken: {
    id: 'workspace-invalid-token',
    message:
      'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE must be a single workspace token containing only letters, numbers, dots, underscores, or hyphens.',
  },
  workspaceUndefinedToken: {
    id: 'workspace-undefined-token',
    message:
      'PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE must not contain the literal string "undefined".',
  },
  urlInvalidPath: {
    id: 'url-invalid-path',
    message:
      'A GeoServer request path was rejected because it would create an invalid URL.',
  },
} as const satisfies Record<string, PublicGeoServerProblem>

export const createPublicGeoServerProblemReporter = (
  diagnostic: (message: string) => void
): PublicGeoServerProblemReporter => {
  const reportedProblemIds = new Set<PublicGeoServerProblem['id']>()

  return (problem) => {
    if (reportedProblemIds.has(problem.id)) {
      return
    }

    reportedProblemIds.add(problem.id)
    diagnostic(problem.message)
  }
}

const reportDevelopmentProblem = createPublicGeoServerProblemReporter(
  (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[GeoServer configuration] ${message}`)
    }
  }
)

export const getPublicGeoServerEnv = (): PublicGeoServerEnv => ({
  PUBLIC_GEOSERVER_URL: process.env.PUBLIC_GEOSERVER_URL,
  PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE:
    process.env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE,
})

export const normalizePublicGeoServerBase = (
  value: string | undefined
): PublicGeoServerNormalizationResult => {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return { ok: false, problem: problems.baseMissing }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(trimmedValue)
  } catch {
    return { ok: false, problem: problems.baseInvalidUrl }
  }

  if (
    (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') ||
    !parsedUrl.hostname
  ) {
    return { ok: false, problem: problems.baseInvalidUrl }
  }

  if (parsedUrl.username || parsedUrl.password) {
    return { ok: false, problem: problems.baseCredentials }
  }

  if (parsedUrl.search || parsedUrl.hash) {
    return { ok: false, problem: problems.baseQueryOrFragment }
  }

  if (
    parsedUrl.hostname.toLowerCase().includes('undefined') ||
    parsedUrl.pathname.toLowerCase().includes('undefined')
  ) {
    return { ok: false, problem: problems.baseUndefinedHostOrPath }
  }

  const normalizedPathname = parsedUrl.pathname.replace(/\/+$/, '')
  return {
    ok: true,
    value: `${parsedUrl.origin}${
      normalizedPathname === '/' ? '' : normalizedPathname
    }`,
  }
}

export const normalizePublicGeoServerWorkspace = (
  value: string | undefined
): PublicGeoServerNormalizationResult => {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return { ok: false, problem: problems.workspaceMissing }
  }

  if (trimmedValue.toLowerCase().includes('undefined')) {
    return { ok: false, problem: problems.workspaceUndefinedToken }
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(trimmedValue)) {
    return { ok: false, problem: problems.workspaceInvalidToken }
  }

  return { ok: true, value: trimmedValue }
}

export const resolvePublicGeoServerBase = ({
  env = getPublicGeoServerEnv(),
  reportProblem = reportDevelopmentProblem,
}: PublicGeoServerResolverOptions = {}) => {
  const result = normalizePublicGeoServerBase(env.PUBLIC_GEOSERVER_URL)
  if (!result.ok) {
    reportProblem(result.problem)
    return undefined
  }

  return result.value
}

export const resolvePublicGeoServerWithWorkspace = ({
  env = getPublicGeoServerEnv(),
  reportProblem = reportDevelopmentProblem,
}: PublicGeoServerResolverOptions = {}) => {
  const baseResult = normalizePublicGeoServerBase(env.PUBLIC_GEOSERVER_URL)
  const workspaceResult = normalizePublicGeoServerWorkspace(
    env.PUBLIC_LUONNONMETSAKARTAT_GEOSERVER_WORKSPACE
  )

  if (!baseResult.ok) {
    reportProblem(baseResult.problem)
  }
  if (!workspaceResult.ok) {
    reportProblem(workspaceResult.problem)
  }
  if (!baseResult.ok || !workspaceResult.ok) {
    return undefined
  }

  return {
    baseUrl: baseResult.value,
    workspace: workspaceResult.value,
  }
}

export const appendPublicGeoServerPath = ({
  baseUrl,
  path,
  reportProblem = reportDevelopmentProblem,
}: {
  baseUrl: string
  path: string
  reportProblem?: PublicGeoServerProblemReporter
}) => {
  const baseResult = normalizePublicGeoServerBase(baseUrl)
  if (!baseResult.ok) {
    reportProblem(baseResult.problem)
    return undefined
  }

  const pathWithoutLeadingSlash = path.replace(/^\/+/, '')
  if (!pathWithoutLeadingSlash) {
    reportProblem(problems.urlInvalidPath)
    return undefined
  }

  const url = `${baseResult.value}/${pathWithoutLeadingSlash}`
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    reportProblem(problems.urlInvalidPath)
    return undefined
  }

  if (
    parsedUrl.hostname.toLowerCase().includes('undefined') ||
    parsedUrl.pathname.toLowerCase().includes('undefined')
  ) {
    reportProblem(problems.urlInvalidPath)
    return undefined
  }

  return url
}

export const buildPublicGeoServerUrl = ({
  path,
  env = getPublicGeoServerEnv(),
  reportProblem = reportDevelopmentProblem,
}: PublicGeoServerResolverOptions & { path: string }) => {
  const baseUrl = resolvePublicGeoServerBase({ env, reportProblem })
  if (!baseUrl) {
    return undefined
  }

  return appendPublicGeoServerPath({ baseUrl, path, reportProblem })
}

export const isPublicGeoServerRequest = ({
  url,
  baseUrl,
}: {
  url: string
  baseUrl: string
}) => {
  const baseResult = normalizePublicGeoServerBase(baseUrl)
  if (!baseResult.ok) {
    return false
  }

  try {
    const requestUrl = new URL(url)
    const baseUrlObject = new URL(baseResult.value)
    const requestPath = requestUrl.pathname.toLowerCase()
    if (
      requestUrl.hostname.toLowerCase().includes('undefined') ||
      requestPath.includes('undefined')
    ) {
      return false
    }

    const basePath = baseUrlObject.pathname.replace(/\/+$/, '')
    return (
      requestUrl.origin === baseUrlObject.origin &&
      (requestUrl.pathname === basePath ||
        requestUrl.pathname.startsWith(`${basePath}/`))
    )
  } catch {
    return false
  }
}
