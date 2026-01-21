import { CUSTOM_ZONING_CODE, ZONING_CLASS_COLORS_BY_CODE } from './constants'
import type { ZoningClass } from './types'

const ZONING_CLASSES_URL =
  '/files/hiilikartta/Hiilikartta_luokat_teksti_19_1_2026.csv'

export const normalizeZoningCode = (value: string) => {
  const trimmed = value.trim().toUpperCase()
  return trimmed.split(' ')[0].split('-')[0].split('.')[0]
}

const OMA_ZONING_CLASS_NAME = 'Oma valinta'
const OMA_ZONING_CLASS = {
  name: OMA_ZONING_CLASS_NAME,
  code: CUSTOM_ZONING_CODE,
  landuse_built: 0,
  landuse_new_open_vegetation: 0,
  landuse_new_tree_vegetation: 0,
  landuse_existing: 0,
}

const ensureOmaZoningClass = (zoningClasses: ZoningClass[]) => {
  const hasOma = zoningClasses.some(
    (zoningClass) => zoningClass.code === CUSTOM_ZONING_CODE
  )

  if (hasOma) {
    return zoningClasses
  }

  return [OMA_ZONING_CLASS, ...zoningClasses]
}

const parseLandUseValue = (value: string | undefined) => {
  if (!value) {
    return undefined
  }

  const normalized = value.replace(',', '.').trim()
  if (!normalized) {
    return undefined
  }

  const numberValue = Number(normalized)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

const detectDelimiter = (headerRow: string) => {
  if (headerRow.includes('\t')) {
    return '\t'
  }
  if (headerRow.includes(';')) {
    return ';'
  }
  if (headerRow.includes(',')) {
    return ','
  }
  return '\t'
}

const normalizeHeaderKey = (value: string) =>
  value.replace(/^\uFEFF/, '').trim().toLowerCase()

const getHeaderIndex = (
  headerColumns: string[],
  candidates: string[],
  fallbackIndex: number
) => {
  const normalizedCandidates = new Set(
    candidates.map((candidate) => candidate.toLowerCase())
  )
  const index = headerColumns.findIndex((column) =>
    normalizedCandidates.has(column)
  )
  return index === -1 ? fallbackIndex : index
}

const dedupeZoningClasses = (zoningClasses: ZoningClass[]) => {
  const seen = new Set<string>()
  const unique: ZoningClass[] = []

  zoningClasses.forEach((zoningClass) => {
    const normalized = normalizeZoningCode(zoningClass.code)
    if (seen.has(normalized)) {
      return
    }
    seen.add(normalized)
    unique.push(zoningClass)
  })

  return unique
}

export const parseZoningClassesText = (text: string): ZoningClass[] => {
  const rows = text
    .split(/\r?\n/)
    .map((row) => row.trimEnd())
    .filter((row) => row.trim().length > 0)

  if (rows.length === 0) {
    return []
  }

  const delimiter = detectDelimiter(rows[0])
  const headerColumns = rows[0]
    .split(delimiter)
    .map((column) => normalizeHeaderKey(column))

  const nameIndex = getHeaderIndex(headerColumns, ['luokka', 'name'], 0)
  const codeIndex = getHeaderIndex(headerColumns, ['lyhenne', 'code'], 1)
  const landuseBuiltIndex = getHeaderIndex(
    headerColumns,
    ['rakennettu', 'landuse_built'],
    2
  )
  const landuseNewOpenIndex = getHeaderIndex(
    headerColumns,
    ['uusi_avoin_kasvipeite', 'landuse_new_open_vegetation'],
    3
  )
  const landuseNewTreeIndex = getHeaderIndex(
    headerColumns,
    ['uusi_puustoinen_kasvipeite', 'landuse_new_tree_vegetation'],
    4
  )
  const landuseExistingIndex = getHeaderIndex(
    headerColumns,
    ['aiempi_maanpeite', 'landuse_existing'],
    5
  )

  const parsed = rows
    .slice(1)
    .map((row) => {
      const columns = row.split(delimiter)
      const rawName = columns[nameIndex]
      const rawCode = columns[codeIndex]
      if (!rawName || !rawCode) {
        return null
      }

      const code = rawCode.replace(/^\uFEFF/, '').trim()
      if (!code) {
        return null
      }

      return {
        name: rawName.replace(/^\uFEFF/, '').trim(),
        code: code,
        landuse_built: parseLandUseValue(columns[landuseBuiltIndex]),
        landuse_new_open_vegetation: parseLandUseValue(
          columns[landuseNewOpenIndex]
        ),
        landuse_new_tree_vegetation: parseLandUseValue(
          columns[landuseNewTreeIndex]
        ),
        landuse_existing: parseLandUseValue(columns[landuseExistingIndex]),
      }
    })
    .filter((item): item is ZoningClass => item != null)

  return dedupeZoningClasses(parsed)
}

let zoningClassesPromise: Promise<ZoningClass[]> | null = null
let zoningClassesCache: ZoningClass[] = []

const fetchZoningClasses = async () => {
  const response = await fetch(ZONING_CLASSES_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to load zoning classes (${response.status})`)
  }

  const text = await response.text()
  const parsed = ensureOmaZoningClass(parseZoningClassesText(text))
  zoningClassesCache = parsed
  return parsed
}

export const getZoningClasses = () => {
  if (!zoningClassesPromise) {
    zoningClassesPromise = fetchZoningClasses().catch((error) => {
      zoningClassesPromise = null
      throw error
    })
  }

  return zoningClassesPromise
}

export const getZoningClassesCache = () =>
  ensureOmaZoningClass(zoningClassesCache)

export const getZoningClassByCode = (
  zoningCode: string | null | undefined,
  zoningClasses: ZoningClass[] = getZoningClassesCache()
) => {
  if (!zoningCode) {
    return undefined
  }

  const normalized = normalizeZoningCode(zoningCode)
  return zoningClasses.find(
    (zoningClass) =>
      normalizeZoningCode(zoningClass.code) === normalized
  )
}

export const getZoningClassLandUseDefaults = (
  zoningClass: ZoningClass
) => ({
  landuse_built: zoningClass.landuse_built ?? 0,
  landuse_new_open_vegetation: zoningClass.landuse_new_open_vegetation ?? 0,
  landuse_new_tree_vegetation: zoningClass.landuse_new_tree_vegetation ?? 0,
  landuse_existing: zoningClass.landuse_existing ?? 0,
})

export const getZoningClassColor = (
  zoningCode: string | null | undefined
) => {
  if (!zoningCode) {
    return undefined
  }

  const normalized = normalizeZoningCode(zoningCode)

  for (let i = normalized.length; i > 0; i -= 1) {
    const candidate = normalized.slice(0, i)
    const color = ZONING_CLASS_COLORS_BY_CODE[candidate]
    if (color) {
      return color
    }
  }

  return undefined
}
