import { CUSTOM_ZONING_CODE, ZONING_CLASS_COLORS_BY_CODE } from './constants'
import type { ZoningClass } from './types'

const ZONING_CLASSES_URL =
  '/files/hiilikartta/hiilikartta_classes.csv'

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
  soil_change_new_vegetation_pct: 0,
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
  if (Number.isNaN(numberValue)) {
    return undefined
  }

  return Math.round(numberValue * 10000) / 100
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
  const soilChangeIndex = getHeaderIndex(
    headerColumns,
    [
      'maaperan_muutos_uuden_kasvipeitteen_alueilla',
      'soil_change_new_vegetation_pct',
    ],
    6
  )

  const parsed = rows.slice(1).reduce<ZoningClass[]>((acc, row) => {
    const columns = row.split(delimiter)
    const rawName = columns[nameIndex]
    const rawCode = columns[codeIndex]
    if (!rawName || !rawCode) {
      return acc
    }

    const code = rawCode.replace(/^\uFEFF/, '').trim()
    if (!code) {
      return acc
    }

    acc.push({
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
      soil_change_new_vegetation_pct: parseLandUseValue(
        columns[soilChangeIndex]
      ),
    })

    return acc
  }, [])

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

const requestZoningClasses = () => {
  if (!zoningClassesPromise) {
    zoningClassesPromise = fetchZoningClasses().catch((error) => {
      zoningClassesPromise = null
      throw error
    })
  }

  return zoningClassesPromise
}

export const getZoningClasses = async () => {
  if (zoningClassesCache.length > 0) {
    return ensureOmaZoningClass(zoningClassesCache)
  }

  return requestZoningClasses()
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
  soil_change_new_vegetation_pct:
    zoningClass.soil_change_new_vegetation_pct ?? 0,
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
