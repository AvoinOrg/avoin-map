import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box, type SelectChangeEvent, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'

import useStore from '#/common/hooks/useStore'
import useSelectedFeaturesFilteredBySource from '#/common/hooks/map/useSelectedFeaturesFilteredBySource'
import { useMapStore } from '#/common/store'
import type { SelectOption } from '#/common/types/general'
import DropDownMultiSelect, {
  type DropDownMultiSelectOption,
} from '#/components/common/DropDownMultiSelect'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'

import type { PlanDataFeature } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { useZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/useZoningClasses'
import {
  checkIsValidLandUseDistribution,
  getPlanLayerGroupId,
  getPlanSourceId,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { normalizeZoningCode } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import ZoneAccordionItem from './ZoneAccordionItem'
import ZoneClassChip from './ZoneClassChip'
import {
  buildZoneFilterOptions,
  featureMatchesZoneFilter,
  getZoneClassPresentation,
  getZoneDisplayName,
} from './zoneAreaUtils'

interface Props {
  planConfId: string
  sx?: any
}

const CONTENT_PADDING_X = { mobile: '1.25rem', desktop: '2.5rem' } as const
type ZoneSortValue = 'class-asc' | 'class-desc' | 'name-asc' | 'name-desc'

const ZoneAccordion = ({ planConfId, sx }: Props) => {
  const { t } = useTranslate('hiilikartta')
  const planConf = useStore(
    useAppletStore,
    (state) => state.planConfs[planConfId]
  )
  const updatePlanConfDataFeature = useAppletStore(
    (state) => state.updatePlanConfDataFeature
  )
  const removeSelectedFeaturesByIds = useMapStore(
    (state) => state.removeSelectedFeaturesByIds
  )
  const addSelectedFeaturesByIds = useMapStore(
    (state) => state.addSelectedFeaturesByIds
  )
  const drawMode = useMapStore((state) => state._drawOptions.currentMode)
  const { zoningClasses, isLoading: isZoningClassesLoading } =
    useZoningClasses()

  const selectedFeatures = useSelectedFeaturesFilteredBySource([
    { source: getPlanSourceId(planConfId) },
  ])

  const [expandedFeatureId, setExpandedFeatureId] = useState<string | null>(
    null
  )
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>([])
  const [sortValue, setSortValue] = useState<ZoneSortValue>('name-asc')
  const [landUseEditorOpenByFeatureId, setLandUseEditorOpenByFeatureId] =
    useState<Record<string, boolean>>({})

  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const areaNameCollator = useMemo(
    () =>
      new Intl.Collator('fi', {
        numeric: true,
        sensitivity: 'base',
      }),
    []
  )

  const zoningCodeOptions = useMemo<SelectOption[]>(() => {
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
      .map((zoningClass) => ({
        label: zoningClass.name,
        value: zoningClass.code,
      }))
  }, [zoningClasses])

  const filterOptions = useMemo(
    () =>
      buildZoneFilterOptions({
        features: planConf?.data.features ?? [],
        unknownLabel: t('sidebar.plan_settings.areas.filter_unknown'),
        zoningClasses,
      }),
    [planConf?.data.features, t, zoningClasses]
  )

  const filterSelectOptions = useMemo<DropDownMultiSelectOption[]>(
    () =>
      filterOptions.map((option) => ({
        value: option.value,
        label: option.label,
        leading: <ZoneClassChip code={option.code} color={option.color} />,
        trailing: (
          <Typography
            sx={{
              fontSize: '0.625rem',
              lineHeight: '0.875rem',
              letterSpacing: '0.04em',
              color: '#6D6D6D',
            }}
          >
            {option.count}
          </Typography>
        ),
      })),
    [filterOptions]
  )

  const sortOptions = useMemo<SelectOption[]>(
    () => [
      {
        value: 'class-asc',
        label: t('sidebar.plan_settings.areas.sort_class_asc'),
      },
      {
        value: 'class-desc',
        label: t('sidebar.plan_settings.areas.sort_class_desc'),
      },
      {
        value: 'name-asc',
        label: t('sidebar.plan_settings.areas.sort_name_asc'),
      },
      {
        value: 'name-desc',
        label: t('sidebar.plan_settings.areas.sort_name_desc'),
      },
    ],
    [t]
  )

  const selectedFeatureIds = useMemo(
    () =>
      selectedFeatures.reduce((acc: string[], feature) => {
        if (feature.properties?.id != null) {
          acc.push(feature.properties.id.toString())
        }

        return acc
      }, []),
    [selectedFeatures]
  )

  const selectedFeatureIdFromMap = selectedFeatureIds.at(-1) ?? null

  useEffect(() => {
    setSelectedFilterValues((previousValues) =>
      previousValues.filter((value) =>
        filterOptions.some((option) => option.value === value)
      )
    )
  }, [filterOptions])

  const visibleFeatures = useMemo(() => {
    if (!planConf) {
      return []
    }

    const filteredFeatures = planConf.data.features.filter((feature) =>
      featureMatchesZoneFilter({
        feature,
        selectedFilterValues,
        zoningClasses,
      })
    )

    return filteredFeatures.sort((featureA, featureB) => {
      const areaNameA = getZoneDisplayName({
        areaLabel: t('sidebar.plan_settings.area'),
        name: featureA.properties.name,
        newAreaLabel: t('sidebar.plan_settings.new_area'),
      })
      const areaNameB = getZoneDisplayName({
        areaLabel: t('sidebar.plan_settings.area'),
        name: featureB.properties.name,
        newAreaLabel: t('sidebar.plan_settings.new_area'),
      })

      const zoningCodeA = getZoneClassPresentation({
        unknownLabel: t('sidebar.plan_settings.areas.filter_unknown'),
        zoningClasses,
        zoningCode: featureA.properties.zoning_code,
      }).code
      const zoningCodeB = getZoneClassPresentation({
        unknownLabel: t('sidebar.plan_settings.areas.filter_unknown'),
        zoningClasses,
        zoningCode: featureB.properties.zoning_code,
      }).code

      switch (sortValue) {
        case 'class-asc': {
          const byClass = areaNameCollator.compare(zoningCodeA, zoningCodeB)
          return byClass !== 0
            ? byClass
            : areaNameCollator.compare(areaNameA, areaNameB)
        }
        case 'class-desc': {
          const byClass = areaNameCollator.compare(zoningCodeB, zoningCodeA)
          return byClass !== 0
            ? byClass
            : areaNameCollator.compare(areaNameA, areaNameB)
        }
        case 'name-desc':
          return areaNameCollator.compare(areaNameB, areaNameA)
        case 'name-asc':
        default:
          return areaNameCollator.compare(areaNameA, areaNameB)
      }
    })
  }, [
    areaNameCollator,
    planConf,
    selectedFilterValues,
    sortValue,
    t,
    zoningClasses,
  ])

  useEffect(() => {
    if (expandedFeatureId == null) {
      return
    }

    const isExpandedFeatureVisible = visibleFeatures.some(
      (feature) => feature.properties.id === expandedFeatureId
    )

    if (!isExpandedFeatureVisible) {
      setExpandedFeatureId(null)
    }
  }, [expandedFeatureId, visibleFeatures])

  useEffect(() => {
    if (selectedFeatureIdFromMap == null) {
      setExpandedFeatureId((previousExpandedFeatureId) =>
        previousExpandedFeatureId === null ? previousExpandedFeatureId : null
      )
      return
    }

    const isSelectedFeatureVisible = visibleFeatures.some(
      (feature) => feature.properties.id === selectedFeatureIdFromMap
    )

    if (!isSelectedFeatureVisible) {
      return
    }

    setExpandedFeatureId((previousExpandedFeatureId) =>
      previousExpandedFeatureId === selectedFeatureIdFromMap
        ? previousExpandedFeatureId
        : selectedFeatureIdFromMap
    )
  }, [selectedFeatureIdFromMap, visibleFeatures])

  useEffect(() => {
    if (!expandedFeatureId) {
      return
    }

    const accordionElement = accordionRefs.current[expandedFeatureId]
    if (!accordionElement) {
      return
    }

    requestAnimationFrame(() => {
      accordionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [expandedFeatureId, visibleFeatures])

  useEffect(() => {
    if (!expandedFeatureId || !planConf) {
      return
    }

    setLandUseEditorOpenByFeatureId((previousOpenState) => {
      if (previousOpenState[expandedFeatureId] != null) {
        return previousOpenState
      }

      const expandedFeature = planConf.data.features.find(
        (feature) => feature.properties.id === expandedFeatureId
      )

      if (!expandedFeature) {
        return previousOpenState
      }

      return {
        ...previousOpenState,
        [expandedFeatureId]: !checkIsValidLandUseDistribution(
          expandedFeature.properties
        ),
      }
    })
  }, [expandedFeatureId, planConf])

  const shouldSyncDrawSelection = drawMode === 'edit'

  const expandedFeatureIdRef = useRef<string | null>(null)

  useEffect(() => {
    expandedFeatureIdRef.current = expandedFeatureId
  }, [expandedFeatureId])

  const handleAccordionToggle = useCallback(
    (featureId: string) => {
      const isClosing = expandedFeatureIdRef.current === featureId

      setExpandedFeatureId(isClosing ? null : featureId)

      if (isClosing) {
        removeSelectedFeaturesByIds({
          featureIds: [featureId],
          idField: 'id',
          source: { source: getPlanLayerGroupId(planConfId) },
          updateDrawSelect: shouldSyncDrawSelection,
        })
        return
      }

      addSelectedFeaturesByIds({
        featureIds: [featureId],
        idField: 'id',
        source: { source: getPlanLayerGroupId(planConfId) },
        updateDrawSelect: shouldSyncDrawSelection,
        removeOtherFeatures: true,
      })
    },
    [
      addSelectedFeaturesByIds,
      planConfId,
      removeSelectedFeaturesByIds,
      shouldSyncDrawSelection,
    ]
  )

  const handleFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setSelectedFilterValues(
      typeof value === 'string' ? value.split(',') : value
    )
  }

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortValue(event.target.value as ZoneSortValue)
  }

  const handleLandUseEditorToggle = useCallback(
    (featureId: string, nextOpen: boolean) => {
      setLandUseEditorOpenByFeatureId((previousOpenState) => ({
        ...previousOpenState,
        [featureId]: nextOpen,
      }))
    },
    []
  )

  const updateFeature = useCallback(
    (featureId: string, feature: Partial<PlanDataFeature>) => {
      if (!planConf) {
        return
      }

      const existingFeature = planConf.data.features.find(
        (item) => item.properties.id === featureId
      )

      if (!existingFeature) {
        return
      }

      const hasChanged = Object.entries(feature).some(([key, value]) => {
        const currentValue = existingFeature[key as keyof PlanDataFeature]

        if (typeof currentValue === 'object' && currentValue !== null) {
          return JSON.stringify(currentValue) !== JSON.stringify(value)
        }

        return currentValue !== value
      })

      if (!hasChanged) {
        return
      }

      updatePlanConfDataFeature(planConf.id, featureId, feature)
    },
    [planConf, updatePlanConfDataFeature]
  )

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: { mobile: '1.25rem', desktop: '1.5rem' },
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          px: CONTENT_PADDING_X,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.625rem',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.625rem',
            fontWeight: 400,
            lineHeight: '1.125rem',
            letterSpacing: '0.1em',
            color: '#111111',
          }}
        >
          {t('sidebar.plan_settings.areas.filter_label')}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <DropDownMultiSelect
            ariaLabel={t('sidebar.plan_settings.areas.filter_label')}
            value={selectedFilterValues}
            options={filterSelectOptions}
            onChange={handleFilterChange}
            selectSx={{ width: '100%' }}
            renderValue={(selected, selectedOptions) => {
              if (selected.length === 0) {
                return (
                  <ZoneClassChip
                    code={t('sidebar.plan_settings.areas.filter_all')}
                    dark
                    sx={{ minWidth: 0 }}
                    uppercase={false}
                  />
                )
              }

              const visibleChips = selectedOptions.slice(0, 2)

              return (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    overflow: 'hidden',
                  }}
                >
                  {visibleChips.map((option) => {
                    const matchingFilterOption = filterOptions.find(
                      (filterOption) => filterOption.value === option.value
                    )

                    if (!matchingFilterOption) {
                      return null
                    }

                    return (
                      <ZoneClassChip
                        key={option.value}
                        code={matchingFilterOption.code}
                        color={matchingFilterOption.color}
                      />
                    )
                  })}

                  {selectedOptions.length > visibleChips.length && (
                    <Typography
                      sx={{
                        fontSize: '0.625rem',
                        lineHeight: '0.875rem',
                        letterSpacing: '0.04em',
                        color: '#111111',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      +{selectedOptions.length - visibleChips.length}
                    </Typography>
                  )}
                </Box>
              )
            }}
          />

          <Typography
            sx={{
              alignSelf: 'flex-end',
              fontSize: '0.5rem',
              lineHeight: '0.75rem',
              letterSpacing: '0.08em',
              color: '#111111',
            }}
          >
            {t('sidebar.plan_settings.areas.count', {
              count: visibleFeatures.length,
            })}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              pt: '0.125rem',
            }}
          >
            <DropDownSelectMinimal
              value={sortValue}
              onChange={handleSortChange}
              ariaLabel={t('sidebar.plan_settings.areas.sort_label')}
              options={sortOptions}
              sx={{
                minWidth: '7.5rem',
                ml: 'auto',
                borderRadius: '999px',
                backgroundColor: '#D9D9D9',
                boxShadow: '0px 1px 1px 0px rgba(189, 189, 189, 0.25)',
                color: '#111111',
                '& .MuiSelect-select': {
                  pl: '0.75rem',
                  pr: '1.75rem !important',
                  py: '0.3125rem',
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  lineHeight: '1rem',
                  letterSpacing: '0.1em',
                },
                '& .MuiSelect-icon': {
                  right: '0.625rem',
                  top: 'calc(50% - 0.21875rem)',
                  width: '0.6875rem',
                  height: '0.4375rem',
                },
              }}
              optionSx={{
                fontSize: '0.5rem',
                fontWeight: 700,
                lineHeight: '1rem',
                letterSpacing: '0.1em',
                pl: 1.5,
                pr: 1,
              }}
              iconSx={{
                width: '0.6875rem',
                height: '0.4375rem',
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: CONTENT_PADDING_X }}>
        {visibleFeatures.map((feature, index) => (
          <ZoneAccordionItem
            key={feature.properties.id}
            accordionRefs={accordionRefs}
            expanded={expandedFeatureId === feature.properties.id}
            feature={feature}
            isLast={index === visibleFeatures.length - 1}
            isZoningClassesLoading={isZoningClassesLoading}
            landUseEditorOpen={
              landUseEditorOpenByFeatureId[feature.properties.id] ??
              !checkIsValidLandUseDistribution(feature.properties)
            }
            onLandUseEditorToggle={handleLandUseEditorToggle}
            onToggle={handleAccordionToggle}
            updateFeature={updateFeature}
            zoningClasses={zoningClasses}
            zoningCodeOptions={zoningCodeOptions}
          />
        ))}
      </Box>
    </Box>
  )
}

export default ZoneAccordion
