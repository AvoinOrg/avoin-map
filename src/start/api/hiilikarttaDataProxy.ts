type EnvSource = Record<string, string | undefined>

type HiilikarttaDataProxyLogger = {
  error: (...args: unknown[]) => void
}

type HiilikarttaDataProxyDeps = {
  env?: EnvSource
  fetchFn?: typeof fetch
  logger?: HiilikarttaDataProxyLogger
}

const normalizeApiBaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim()

  return trimmed ? trimmed.replace(/\/+$/, '') : null
}

const getCalculationUrl = ({
  apiBaseUrl,
  request,
}: {
  apiBaseUrl: string
  request: Request
}) => {
  const calculationUrl = new URL(`${apiBaseUrl}/calculation`)
  const id = new URL(request.url).searchParams.get('id')

  if (id !== null) {
    calculationUrl.searchParams.set('id', id)
  }

  return calculationUrl
}

const serializeUpstreamBody = async (response: Response) => {
  const text = await response.text()

  if (!text) {
    return ''
  }

  try {
    return JSON.stringify(JSON.parse(text))
  } catch {
    return text
  }
}

const createMappedUpstreamResponse = async (response: Response) =>
  new Response(await serializeUpstreamBody(response), {
    status: response.status,
    statusText: response.statusText,
  })

const createNoResponseError = () =>
  new Response('No response from server', { status: 500 })

const createRequestSetupError = () =>
  new Response('Request setup error', { status: 500 })

export const handleHiilikarttaDataProxyRequest = async ({
  deps = {},
  request,
}: {
  deps?: HiilikarttaDataProxyDeps
  request: Request
}) => {
  const { env = process.env, fetchFn = fetch, logger = console } = deps
  const apiBaseUrl = normalizeApiBaseUrl(env.HIILIKARTTA_API_URL)

  if (!apiBaseUrl) {
    return new Response('HIILIKARTTA_API_URL is not configured', {
      status: 500,
    })
  }

  try {
    const calculationUrl = getCalculationUrl({ apiBaseUrl, request })

    if (request.method === 'GET') {
      return createMappedUpstreamResponse(await fetchFn(calculationUrl))
    }

    if (request.method === 'POST') {
      return createMappedUpstreamResponse(
        await fetchFn(calculationUrl, {
          body: await request.formData(),
          method: 'POST',
        })
      )
    }

    return new Response(null, { status: 405 })
  } catch (error) {
    logger.error('Hiilikartta data proxy request failed', error)

    return error instanceof TypeError
      ? createNoResponseError()
      : createRequestSetupError()
  }
}
