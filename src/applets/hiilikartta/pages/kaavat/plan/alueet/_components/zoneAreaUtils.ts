import type {
  FeatureProperties,
  PlanDataFeature,
  ZoningClass,
} from 'applets/hiilikartta/common/types'
import type { SelectOption } from '#/common/types/general'
import {
  getZoningClassByCode,
  getZoningClassColor,
  normalizeZoningCode,
} from 'applets/hiilikartta/common/zoningClasses'

export const EMPTY_ZONE_FILTER_VALUE = '__EMPTY_ZONE_FILTER_VALUE__'

type DisplayNameArgs = {
  areaLabel: string
  newAreaLabel: string
  name: FeatureProperties['name']
}

type ZoneClassPresentationArgs = {
  unknownLabel?: string
  zoningClasses: ZoningClass[]
  zoningCode: FeatureProperties['zoning_code']
}

export type ZoneFilterOption = {
  code: string
  color?: string
  count: number
  label: string
  value: string
}

export type ZoneClassSelectOption = SelectOption & {
  code: string
  color?: string
}

export const getZoneDisplayName = ({
  areaLabel,
  newAreaLabel,
  name,
}: DisplayNameArgs) => {
  if (typeof name === 'string') {
    const trimmedName = name.trim()
    return trimmedName === '' ? newAreaLabel : trimmedName
  }

  return `${areaLabel} ${name}`
}

export const getLandUseDistributionTotal = (properties: FeatureProperties) => {
  return [
    properties.landuse_built,
    properties.landuse_new_open_vegetation,
    properties.landuse_new_tree_vegetation,
    properties.landuse_existing,
  ].reduce<number>((sum, value) => sum + Number(value ?? 0), 0)
}

export const buildZoningCodeSelectOptions = (
  zoningClasses: ZoningClass[]
) => {
  const seen = new Set<string>()

  return zoningClasses
    .filter((zoningClass) => {
      const normalizedCode = normalizeZoningCode(zoningClass.code)
      if (seen.has(normalizedCode)) {
        return false
      }

      seen.add(normalizedCode)
      return true
    })
    .map<ZoneClassSelectOption>((zoningClass) => ({
      code: normalizeZoningCode(zoningClass.code) || zoningClass.code,
      color: getZoningClassColor(zoningClass.code),
      label: zoningClass.name,
      value: zoningClass.code,
    }))
}

export const getZoneClassPresentation = ({
  unknownLabel = '?',
  zoningClasses,
  zoningCode,
}: ZoneClassPresentationArgs) => {
  if (zoningCode == null || zoningCode.trim() === '') {
    return {
      code: '?',
      color: undefined,
      filterValue: EMPTY_ZONE_FILTER_VALUE,
      label: unknownLabel,
    }
  }

  const zoningClass = getZoningClassByCode(zoningCode, zoningClasses)

  if (zoningClass) {
    return {
      code: zoningClass.code,
      color: getZoningClassColor(zoningClass.code),
      filterValue: zoningClass.code,
      label: zoningClass.name,
    }
  }

  const normalizedCode = normalizeZoningCode(zoningCode)

  return {
    code: normalizedCode || '?',
    color: getZoningClassColor(zoningCode),
    filterValue: normalizedCode || EMPTY_ZONE_FILTER_VALUE,
    label: normalizedCode || unknownLabel,
  }
}

export const featureMatchesZoneFilter = ({
  feature,
  selectedFilterValues,
  zoningClasses,
}: {
  feature: PlanDataFeature
  selectedFilterValues: string[]
  zoningClasses: ZoningClass[]
}) => {
  if (selectedFilterValues.length === 0) {
    return true
  }

  const { filterValue } = getZoneClassPresentation({
    zoningClasses,
    zoningCode: feature.properties.zoning_code,
  })

  return selectedFilterValues.includes(filterValue)
}

export const buildZoneFilterOptions = ({
  features,
  unknownLabel,
  zoningClasses,
}: {
  features: PlanDataFeature[]
  unknownLabel?: string
  zoningClasses: ZoningClass[]
}) => {
  const optionsByValue = new Map<string, ZoneFilterOption>()

  features.forEach((feature) => {
    const presentation = getZoneClassPresentation({
      unknownLabel,
      zoningClasses,
      zoningCode: feature.properties.zoning_code,
    })

    const existingOption = optionsByValue.get(presentation.filterValue)
    if (existingOption) {
      existingOption.count += 1
      return
    }

    optionsByValue.set(presentation.filterValue, {
      code: presentation.code,
      color: presentation.color,
      count: 1,
      label: presentation.label,
      value: presentation.filterValue,
    })
  })

  return Array.from(optionsByValue.values()).sort((a, b) =>
    a.code.localeCompare(b.code, 'fi', {
      numeric: true,
      sensitivity: 'base',
    })
  )
}
