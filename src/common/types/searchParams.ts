export type QueryParamPrimitive = string | number | boolean

export type QueryParamValue = QueryParamPrimitive | null | undefined

export type QueryParamRecord = Record<string, QueryParamValue>

export type SearchParamsLike = {
  toString: () => string
  entries?: () => IterableIterator<[string, string]>
  forEach?: (
    callback: (value: string, key: string, parent: SearchParamsLike) => void
  ) => void
}

export type QueryParams = QueryParamRecord | URLSearchParams | SearchParamsLike
