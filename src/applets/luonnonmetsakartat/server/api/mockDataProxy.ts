import {
  MOCK_AUTH_ACCESS_TOKEN,
  MOCK_AUTH_REJECTED_ACCESS_TOKEN,
} from '#/common/auth/mock'
import type {
  ColOptions,
  IndexingStrategy,
} from 'applets/luonnonmetsakartat/common/types'
import {
  attachLuonnonmetsakartatMockLayerAreaPictures,
  createLuonnonmetsakartatMockLayer,
  deleteLuonnonmetsakartatMockLayer,
  getLuonnonmetsakartatMockLayer,
  getLuonnonmetsakartatMockLayers,
  updateLuonnonmetsakartatMockLayer,
  updateLuonnonmetsakartatMockLayerArea,
} from './mockDataStore'

type LuonnonmetsakartatMockApiEnv = Record<string, string | undefined> & {
  LUONNONMETSAKARTAT_MOCK_API_ENABLED?: string
  NODE_ENV?: string
}

type MockAuthStatus = 'missing' | 'verified' | 'rejected' | 'unknown'
type ParseResult<T> =
  | {
      value: T
    }
  | {
      error: Response
    }
type MockPictureAttachment = Parameters<
  typeof attachLuonnonmetsakartatMockLayerAreaPictures
>[0]['attachments'][number]

const ROUTE_PREFIX = '/api/luonnonmetsakartat'
const MOCK_API_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on'])
const TRUE_FORM_VALUES = new Set(['1', 'true', 'yes', 'on'])
const FALSE_FORM_VALUES = new Set(['0', 'false', 'no', 'off'])
const COL_OPTION_FORM_FIELDS = [
  'indexing_strategy',
  'name_col',
  'municipality_col',
  'region_col',
  'description_col',
  'area_col',
  'id_col',
]

const normalizeFlag = (value: string | undefined) =>
  value?.trim().toLowerCase() ?? ''

const getDefaultMockApiEnv = (): LuonnonmetsakartatMockApiEnv => ({
  LUONNONMETSAKARTAT_MOCK_API_ENABLED:
    process.env.LUONNONMETSAKARTAT_MOCK_API_ENABLED,
  NODE_ENV: process.env.NODE_ENV,
})

const isTruthyMockApiFlag = (value: string | undefined) =>
  MOCK_API_ENABLED_VALUES.has(normalizeFlag(value))

export const assertLuonnonmetsakartatMockApiAllowed = (
  env: LuonnonmetsakartatMockApiEnv = getDefaultMockApiEnv()
) => {
  if (
    isTruthyMockApiFlag(env.LUONNONMETSAKARTAT_MOCK_API_ENABLED) &&
    env.NODE_ENV === 'production'
  ) {
    throw new Error(
      'Luonnonmetsakartat mock API cannot be enabled when NODE_ENV=production. Unset LUONNONMETSAKARTAT_MOCK_API_ENABLED.'
    )
  }
}

export const isLuonnonmetsakartatMockApiEnabled = (
  env: LuonnonmetsakartatMockApiEnv = getDefaultMockApiEnv()
) => {
  assertLuonnonmetsakartatMockApiAllowed(env)

  return isTruthyMockApiFlag(env.LUONNONMETSAKARTAT_MOCK_API_ENABLED)
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })

const jsonErrorResponse = (error: string, status: number) =>
  jsonResponse({ error }, status)

const getMockPath = (request: Request) => {
  const requestUrl = new URL(request.url)
  const normalizedPrefix = ROUTE_PREFIX.replace(/\/+$/, '')

  if (
    requestUrl.pathname !== normalizedPrefix &&
    !requestUrl.pathname.startsWith(`${normalizedPrefix}/`)
  ) {
    return null
  }

  return requestUrl.pathname.slice(normalizedPrefix.length) || '/'
}

const getBearerToken = (request: Request) => {
  const authHeader = request.headers.get('authorization')
  const match = authHeader?.match(/^Bearer\s+(.+)$/i)

  return match?.[1]?.trim() || null
}

const getMockAuthStatus = (request: Request): MockAuthStatus => {
  const token = getBearerToken(request)

  if (!token) {
    return request.headers.has('authorization') ? 'unknown' : 'missing'
  }

  if (token === MOCK_AUTH_ACCESS_TOKEN) {
    return 'verified'
  }

  if (token === MOCK_AUTH_REJECTED_ACCESS_TOKEN) {
    return 'rejected'
  }

  return 'unknown'
}

const getAdminAuthErrorResponse = (authStatus: MockAuthStatus) => {
  if (authStatus === 'rejected') {
    return jsonResponse(
      {
        error: 'Mock admin access rejected',
        is_editor: false,
        is_admin: false,
      },
      403
    )
  }

  return jsonResponse(
    {
      error: 'Mock admin authorization required',
      is_editor: false,
      is_admin: false,
    },
    401
  )
}

const toPublicLayerItem = (
  layer: ReturnType<typeof getLuonnonmetsakartatMockLayers>[number]
) => ({
  id: layer.id,
  name: layer.name,
  description: layer.description,
  created_ts: layer.created_ts,
  updated_ts: layer.updated_ts,
  color_code: layer.color_code,
})

const toAdminLayerItem = (
  layer: ReturnType<typeof getLuonnonmetsakartatMockLayers>[number]
) => ({
  id: layer.id,
  name: layer.name,
  description: layer.description,
  created_ts: layer.created_ts,
  updated_ts: layer.updated_ts,
  color_code: layer.color_code,
  is_hidden: layer.is_hidden,
  col_options: layer.col_options,
})

const isParseError = <T>(
  result: ParseResult<T>
): result is { error: Response } => 'error' in result

const readMockFormData = async (
  request: Request
): Promise<ParseResult<FormData>> => {
  try {
    return { value: await request.formData() }
  } catch {
    return {
      error: jsonErrorResponse('Expected multipart form data', 400),
    }
  }
}

const getOptionalStringField = (
  formData: FormData,
  key: string
): ParseResult<string | undefined> => {
  if (!formData.has(key)) {
    return { value: undefined }
  }

  const value = formData.get(key)

  if (typeof value !== 'string') {
    return {
      error: jsonErrorResponse(`Expected string form field: ${key}`, 400),
    }
  }

  const trimmedValue = value.trim()

  return { value: trimmedValue || undefined }
}

const getRequiredStringField = (
  formData: FormData,
  key: string
): ParseResult<string> => {
  const valueResult = getOptionalStringField(formData, key)

  if (isParseError(valueResult)) {
    return valueResult
  }

  if (valueResult.value === undefined) {
    return {
      error: jsonErrorResponse(`Missing required form field: ${key}`, 400),
    }
  }

  return { value: valueResult.value }
}

const parseBooleanField = ({
  formData,
  key,
  required = false,
}: {
  formData: FormData
  key: string
  required?: boolean
}): ParseResult<boolean | undefined> => {
  const valueResult = getOptionalStringField(formData, key)

  if (isParseError(valueResult)) {
    return valueResult
  }

  if (valueResult.value === undefined) {
    return required
      ? {
          error: jsonErrorResponse(`Missing required form field: ${key}`, 400),
        }
      : { value: undefined }
  }

  const normalizedValue = normalizeFlag(valueResult.value)

  if (TRUE_FORM_VALUES.has(normalizedValue)) {
    return { value: true }
  }

  if (FALSE_FORM_VALUES.has(normalizedValue)) {
    return { value: false }
  }

  return {
    error: jsonErrorResponse(`Invalid boolean form field: ${key}`, 400),
  }
}

const isIndexingStrategy = (value: string): value is IndexingStrategy =>
  value === 'name_municipality' || value === 'id'

const getColStringValue = ({
  existing,
  formData,
  key,
  required,
}: {
  existing?: string
  formData: FormData
  key: string
  required: boolean
}): ParseResult<string | undefined> => {
  const valueResult = getOptionalStringField(formData, key)

  if (isParseError(valueResult)) {
    return valueResult
  }

  if (valueResult.value !== undefined) {
    return { value: valueResult.value }
  }

  if (!formData.has(key) && existing !== undefined) {
    return { value: existing }
  }

  return required
    ? {
        error: jsonErrorResponse(`Missing required form field: ${key}`, 400),
      }
    : { value: undefined }
}

const parseColOptionsFromFormData = ({
  existing,
  formData,
  required,
}: {
  existing?: ColOptions
  formData: FormData
  required: boolean
}): ParseResult<ColOptions | undefined> => {
  const hasAnyColOptions = COL_OPTION_FORM_FIELDS.some((field) =>
    formData.has(field)
  )

  if (!required && !hasAnyColOptions) {
    return { value: undefined }
  }

  const indexingStrategyResult = getColStringValue({
    existing: existing?.indexingStrategy,
    formData,
    key: 'indexing_strategy',
    required: true,
  })

  if (isParseError(indexingStrategyResult)) {
    return indexingStrategyResult
  }

  const indexingStrategy = indexingStrategyResult.value

  if (!indexingStrategy || !isIndexingStrategy(indexingStrategy)) {
    return {
      error: jsonErrorResponse('Invalid indexing_strategy form field', 400),
    }
  }

  const nameColResult = getColStringValue({
    existing: existing?.nameCol,
    formData,
    key: 'name_col',
    required: true,
  })
  const municipalityColResult = getColStringValue({
    existing: existing?.municipalityCol,
    formData,
    key: 'municipality_col',
    required: true,
  })
  const regionColResult = getColStringValue({
    existing: existing?.regionCol,
    formData,
    key: 'region_col',
    required: false,
  })
  const descriptionColResult = getColStringValue({
    existing: existing?.descriptionCol,
    formData,
    key: 'description_col',
    required: false,
  })
  const areaColResult = getColStringValue({
    existing: existing?.areaCol,
    formData,
    key: 'area_col',
    required: false,
  })
  const idColResult = getColStringValue({
    existing: existing?.idCol,
    formData,
    key: 'id_col',
    required: false,
  })

  if (isParseError(nameColResult)) {
    return nameColResult
  }

  if (isParseError(municipalityColResult)) {
    return municipalityColResult
  }

  if (isParseError(regionColResult)) {
    return regionColResult
  }

  if (isParseError(descriptionColResult)) {
    return descriptionColResult
  }

  if (isParseError(areaColResult)) {
    return areaColResult
  }

  if (isParseError(idColResult)) {
    return idColResult
  }

  if (!nameColResult.value || !municipalityColResult.value) {
    return {
      error: jsonErrorResponse('Missing required column option form field', 400),
    }
  }

  return {
    value: {
      indexingStrategy,
      nameCol: nameColResult.value,
      municipalityCol: municipalityColResult.value,
      ...(regionColResult.value ? { regionCol: regionColResult.value } : {}),
      ...(descriptionColResult.value
        ? { descriptionCol: descriptionColResult.value }
        : {}),
      ...(areaColResult.value ? { areaCol: areaColResult.value } : {}),
      ...(idColResult.value ? { idCol: idColResult.value } : {}),
    },
  }
}

const parseLayerCreateFormData = (
  formData: FormData
): ParseResult<Parameters<typeof createLuonnonmetsakartatMockLayer>[0]> => {
  const nameResult = getRequiredStringField(formData, 'name')
  const colorResult = getRequiredStringField(formData, 'color_code')
  const descriptionResult = getOptionalStringField(formData, 'description')
  const hiddenResult = parseBooleanField({
    formData,
    key: 'is_hidden',
    required: true,
  })
  const colOptionsResult = parseColOptionsFromFormData({
    formData,
    required: true,
  })

  if (isParseError(nameResult)) {
    return nameResult
  }

  if (isParseError(colorResult)) {
    return colorResult
  }

  if (isParseError(descriptionResult)) {
    return descriptionResult
  }

  if (isParseError(hiddenResult)) {
    return hiddenResult
  }

  if (isParseError(colOptionsResult)) {
    return colOptionsResult
  }

  if (hiddenResult.value === undefined || !colOptionsResult.value) {
    return {
      error: jsonErrorResponse('Missing required layer form field', 400),
    }
  }

  return {
    value: {
      name: nameResult.value,
      color_code: colorResult.value,
      description: descriptionResult.value,
      is_hidden: hiddenResult.value,
      col_options: colOptionsResult.value,
    },
  }
}

const parseLayerPatchFormData = ({
  existing,
  formData,
}: {
  existing: ReturnType<typeof getLuonnonmetsakartatMockLayer>
  formData: FormData
}): ParseResult<Parameters<typeof updateLuonnonmetsakartatMockLayer>[1]> => {
  if (!existing) {
    return { error: jsonErrorResponse('Mock layer not found', 404) }
  }

  const nameResult = getOptionalStringField(formData, 'name')
  const colorResult = getOptionalStringField(formData, 'color_code')
  const descriptionResult = getOptionalStringField(formData, 'description')
  const hiddenResult = parseBooleanField({ formData, key: 'is_hidden' })
  const deleteAreasNotUpdatedResult = parseBooleanField({
    formData,
    key: 'delete_areas_not_updated',
  })
  const colOptionsResult = parseColOptionsFromFormData({
    existing: existing.col_options,
    formData,
    required: false,
  })

  if (isParseError(nameResult)) {
    return nameResult
  }

  if (isParseError(colorResult)) {
    return colorResult
  }

  if (isParseError(descriptionResult)) {
    return descriptionResult
  }

  if (isParseError(hiddenResult)) {
    return hiddenResult
  }

  if (isParseError(deleteAreasNotUpdatedResult)) {
    return deleteAreasNotUpdatedResult
  }

  if (isParseError(colOptionsResult)) {
    return colOptionsResult
  }

  return {
    value: {
      ...(nameResult.value !== undefined ? { name: nameResult.value } : {}),
      ...(colorResult.value !== undefined
        ? { color_code: colorResult.value }
        : {}),
      ...(descriptionResult.value !== undefined
        ? { description: descriptionResult.value }
        : {}),
      ...(hiddenResult.value !== undefined
        ? { is_hidden: hiddenResult.value }
        : {}),
      ...(colOptionsResult.value !== undefined
        ? { col_options: colOptionsResult.value }
        : {}),
    },
  }
}

const isBlobLike = (
  value: FormDataEntryValue
): value is File =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Blob).arrayBuffer === 'function'

const getUploadFileName = (value: File, index: number) => {
  const name = value.name?.trim()

  return name || `upload-${index + 1}.bin`
}

const parsePictureAttachmentsFromFormData = (
  formData: FormData
): ParseResult<MockPictureAttachment[]> => {
  const images = formData.getAll('bulk_images')
  const areaIds = formData.getAll('bulk_area_ids')

  if (images.length === 0 && areaIds.length === 0) {
    return { value: [] }
  }

  if (
    images.length === 0 ||
    areaIds.length === 0 ||
    images.length !== areaIds.length
  ) {
    return {
      error: jsonErrorResponse(
        'bulk_images and bulk_area_ids must be aligned',
        400
      ),
    }
  }

  const attachments: MockPictureAttachment[] = []

  for (const [index, image] of images.entries()) {
    const areaId = areaIds[index]

    if (!isBlobLike(image) || typeof areaId !== 'string' || !areaId.trim()) {
      return {
        error: jsonErrorResponse(
          'bulk_images must be files and bulk_area_ids must be strings',
          400
        ),
      }
    }

    attachments.push({
      areaId: areaId.trim(),
      fileName: getUploadFileName(image, index),
    })
  }

  return { value: attachments }
}

const parseAreaPatchPropertiesFromFormData = (
  formData: FormData
): ParseResult<Record<string, string>> => {
  const properties: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    if (typeof value !== 'string') {
      return {
        error: jsonErrorResponse(
          `Expected string area property field: ${key}`,
          400
        ),
      }
    }

    properties[key] = value
  }

  return { value: properties }
}

const handleAdminValidate = (authStatus: MockAuthStatus) => {
  if (authStatus === 'verified') {
    return jsonResponse({ is_editor: true, is_admin: true })
  }

  return getAdminAuthErrorResponse(authStatus)
}

const handleLayers = (authStatus: MockAuthStatus) => {
  if (authStatus === 'missing') {
    return jsonResponse(
      getLuonnonmetsakartatMockLayers()
        .filter((layer) => !layer.is_hidden)
        .map(toPublicLayerItem)
    )
  }

  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  return jsonResponse(getLuonnonmetsakartatMockLayers().map(toAdminLayerItem))
}

const handleLayerDetail = ({
  authStatus,
  layerId,
}: {
  authStatus: MockAuthStatus
  layerId: string
}) => {
  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  const layer = getLuonnonmetsakartatMockLayer(layerId)

  if (!layer) {
    return jsonErrorResponse('Mock layer not found', 404)
  }

  return jsonResponse(toAdminLayerItem(layer))
}

const handleLayerCreate = async ({
  authStatus,
  request,
}: {
  authStatus: MockAuthStatus
  request: Request
}) => {
  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  const formDataResult = await readMockFormData(request)

  if (isParseError(formDataResult)) {
    return formDataResult.error
  }

  const inputResult = parseLayerCreateFormData(formDataResult.value)

  if (isParseError(inputResult)) {
    return inputResult.error
  }

  const layer = createLuonnonmetsakartatMockLayer(inputResult.value)

  return jsonResponse(toAdminLayerItem(layer), 201)
}

const handleLayerPatch = async ({
  authStatus,
  layerId,
  request,
}: {
  authStatus: MockAuthStatus
  layerId: string
  request: Request
}) => {
  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  const existingLayer = getLuonnonmetsakartatMockLayer(layerId)

  if (!existingLayer) {
    return jsonErrorResponse('Mock layer not found', 404)
  }

  const formDataResult = await readMockFormData(request)

  if (isParseError(formDataResult)) {
    return formDataResult.error
  }

  const patchResult = parseLayerPatchFormData({
    existing: existingLayer,
    formData: formDataResult.value,
  })
  const attachmentsResult = parsePictureAttachmentsFromFormData(
    formDataResult.value
  )

  if (isParseError(patchResult)) {
    return patchResult.error
  }

  if (isParseError(attachmentsResult)) {
    return attachmentsResult.error
  }

  if (attachmentsResult.value.length > 0) {
    const attachResult = attachLuonnonmetsakartatMockLayerAreaPictures({
      attachments: attachmentsResult.value,
      layerId,
    })

    if (attachResult.status === 'layer-not-found') {
      return jsonErrorResponse('Mock layer not found', 404)
    }

    if (attachResult.status === 'area-not-found') {
      return jsonErrorResponse('Mock area not found', 404)
    }
  }

  const updatedLayer = updateLuonnonmetsakartatMockLayer(
    layerId,
    patchResult.value
  )

  if (!updatedLayer) {
    return jsonErrorResponse('Mock layer not found', 404)
  }

  return jsonResponse(toAdminLayerItem(updatedLayer))
}

const handleLayerDelete = ({
  authStatus,
  layerId,
}: {
  authStatus: MockAuthStatus
  layerId: string
}) => {
  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  if (!deleteLuonnonmetsakartatMockLayer(layerId)) {
    return jsonErrorResponse('Mock layer not found', 404)
  }

  return jsonResponse({ id: layerId, deleted: true })
}

const handleLayerAreaPatch = async ({
  authStatus,
  featureId,
  layerId,
  request,
}: {
  authStatus: MockAuthStatus
  featureId: string
  layerId: string
  request: Request
}) => {
  if (authStatus !== 'verified') {
    return getAdminAuthErrorResponse(authStatus)
  }

  const formDataResult = await readMockFormData(request)

  if (isParseError(formDataResult)) {
    return formDataResult.error
  }

  const propertiesResult = parseAreaPatchPropertiesFromFormData(
    formDataResult.value
  )

  if (isParseError(propertiesResult)) {
    return propertiesResult.error
  }

  const updateResult = updateLuonnonmetsakartatMockLayerArea({
    featureId,
    layerId,
    properties: propertiesResult.value,
  })

  if (updateResult.status === 'layer-not-found') {
    return jsonErrorResponse('Mock layer not found', 404)
  }

  if (updateResult.status === 'area-not-found') {
    return jsonErrorResponse('Mock area not found', 404)
  }

  return jsonResponse(updateResult.feature)
}

export const handleLuonnonmetsakartatMockApiRequest = async ({
  request,
}: {
  request: Request
}) => {
  const method = request.method.toUpperCase()
  const mockPath = getMockPath(request)

  if (!mockPath) {
    return jsonErrorResponse('Mock proxy path is missing', 404)
  }

  const authStatus = getMockAuthStatus(request)

  if (mockPath === '/admin/validate') {
    return method === 'GET'
      ? handleAdminValidate(authStatus)
      : jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/layers') {
    return method === 'GET'
      ? handleLayers(authStatus)
      : jsonErrorResponse('Method not allowed', 405)
  }

  if (mockPath === '/layer' || mockPath === '/layer/') {
    if (method === 'GET') {
      return jsonErrorResponse('Missing required layer id', 400)
    }

    if (method === 'POST') {
      return handleLayerCreate({ authStatus, request })
    }

    return jsonErrorResponse('Method not allowed', 405)
  }

  const areaMatch = mockPath.match(/^\/layer\/([^/]+)\/area\/([^/]+)\/?$/)

  if (areaMatch) {
    return method === 'PATCH'
      ? handleLayerAreaPatch({
          authStatus,
          featureId: decodeURIComponent(areaMatch[2]),
          layerId: decodeURIComponent(areaMatch[1]),
          request,
        })
      : jsonErrorResponse('Method not allowed', 405)
  }

  const layerMatch = mockPath.match(/^\/layer\/([^/]+)\/?$/)

  if (layerMatch) {
    if (method === 'GET') {
      return handleLayerDetail({
        authStatus,
        layerId: decodeURIComponent(layerMatch[1]),
      })
    }

    if (method === 'PATCH') {
      return handleLayerPatch({
        authStatus,
        layerId: decodeURIComponent(layerMatch[1]),
        request,
      })
    }

    if (method === 'DELETE') {
      return handleLayerDelete({
        authStatus,
        layerId: decodeURIComponent(layerMatch[1]),
      })
    }

    return jsonErrorResponse('Method not allowed', 405)
  }

  return jsonErrorResponse(
    'Unsupported Luonnonmetsakartat mock API endpoint',
    404
  )
}
