import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Checkbox,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  Typography,
} from '@mui/material'
import { useTranslate } from '@tolgee/react'

import useStore from '#/common/hooks/useStore'
import { useMapStore } from '#/common/store'
import useSelectedFeaturesFilteredBySource from '#/common/hooks/map/useSelectedFeaturesFilteredBySource'
import type { SelectOption } from '#/common/types/general'
import DownIcon from '#/components/icons/DownIcon'
import Ascending from '#/components/icons/Ascending'

import type { PlanDataFeature } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import { useZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/useZoningClasses'
import {
  getPlanLayerGroupId,
  getPlanSourceId,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { normalizeZoningCode } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'
import ZoneAccordionItem from './ZoneAccordionItem'
import ZoneClassChip from './ZoneClassChip'
import {
  buildZoneFilterOptions,
  featureMatchesZoneFilter,
  getZoneDisplayName,
} from './zoneAreaUtils'

interface Props {
  planConfId: string
  sx?: any
}

const CONTENT_PADDING_X = { mobile: '1.25rem', desktop: '2.5rem' } as const

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
  const { zoningClasses, isLoading: isZoningClassesLoading } =
    useZoningClasses()

  const selectedFeatures = useSelectedFeaturesFilteredBySource([
    { source: getPlanSourceId(planConfId) },
  ])

  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([])
  const [selectedFilterValues, setSelectedFilterValues] = useState<string[]>([])
  const [lastAction, setLastAction] = useState<{
    featureId: string
    isExpanded: boolean
  } | null>(null)

  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const selectedFeatureIdsRef = useRef<string[]>([])
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

    return [...planConf.data.features]
      .filter((feature) =>
        featureMatchesZoneFilter({
          feature,
          selectedFilterValues,
          zoningClasses,
        })
      )
      .sort((featureA, featureB) =>
        areaNameCollator.compare(
          getZoneDisplayName({
            areaLabel: t('sidebar.plan_settings.area'),
            name: featureA.properties.name,
            newAreaLabel: t('sidebar.plan_settings.new_area'),
          }),
          getZoneDisplayName({
            areaLabel: t('sidebar.plan_settings.area'),
            name: featureB.properties.name,
            newAreaLabel: t('sidebar.plan_settings.new_area'),
          })
        )
      )
  }, [areaNameCollator, planConf, selectedFilterValues, t, zoningClasses])

  useEffect(() => {
    const selectedFeatureIds = selectedFeatures.reduce((acc: string[], f) => {
      if (f.properties?.id != null) {
        acc.push(f.properties.id)
      }

      return acc
    }, [])

    setExpandedAccordions(selectedFeatureIds)

    const previousSelectedFeatureIds = selectedFeatureIdsRef.current
    const newFeatureId = selectedFeatureIds.find(
      (id) => !previousSelectedFeatureIds.includes(id)
    )

    if (newFeatureId != null) {
      const accordionElement = accordionRefs.current[newFeatureId]
      if (accordionElement) {
        accordionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }

    selectedFeatureIdsRef.current = selectedFeatureIds
  }, [selectedFeatures, visibleFeatures])

  useEffect(() => {
    if (
      !lastAction?.isExpanded ||
      !expandedAccordions.includes(lastAction.featureId)
    ) {
      return
    }

    const accordionElement = accordionRefs.current[lastAction.featureId]
    if (!accordionElement) {
      return
    }

    requestAnimationFrame(() => {
      accordionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })
  }, [expandedAccordions, lastAction])

  useEffect(() => {
    if (!lastAction) {
      return
    }

    const { featureId, isExpanded } = lastAction

    setExpandedAccordions((previousExpanded) => {
      if (isExpanded) {
        return previousExpanded.includes(featureId)
          ? previousExpanded
          : [...previousExpanded, featureId]
      }

      return previousExpanded.filter((id) => id !== featureId)
    })

    if (isExpanded) {
      addSelectedFeaturesByIds({
        featureIds: [featureId],
        idField: 'id',
        source: { source: getPlanLayerGroupId(planConfId) },
        updateDrawSelect: true,
      })
      return
    }

    removeSelectedFeaturesByIds({
      featureIds: [featureId],
      idField: 'id',
      source: { source: getPlanLayerGroupId(planConfId) },
      updateDrawSelect: true,
    })
  }, [
    addSelectedFeaturesByIds,
    lastAction,
    planConfId,
    removeSelectedFeaturesByIds,
  ])

  const isAccordionExpanded = useCallback(
    (featureId: string) => expandedAccordions.includes(featureId),
    [expandedAccordions]
  )

  const handleAccordionChange = useCallback(
    (featureId: string) =>
      (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setLastAction({ featureId, isExpanded })
      },
    []
  )

  const handleFilterChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setSelectedFilterValues(
      typeof value === 'string' ? value.split(',') : value
    )
  }

  const updateFeature = (
    featureId: string,
    feature: Partial<PlanDataFeature>
  ) => {
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
  }

  const selectedFilterOptions = filterOptions.filter((option) =>
    selectedFilterValues.includes(option.value)
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

        <Select
          multiple
          displayEmpty
          aria-label={t('sidebar.plan_settings.areas.filter_label')}
          value={selectedFilterValues}
          onChange={handleFilterChange}
          input={<OutlinedInput notched={false} />}
          IconComponent={DownIcon}
          renderValue={(selected) => {
            const selectedValues = selected as string[]

            if (selectedValues.length === 0) {
              return (
                <ZoneClassChip
                  code={t('sidebar.plan_settings.areas.filter_all')}
                  dark
                  sx={{ minWidth: 0 }}
                  uppercase={false}
                />
              )
            }

            const visibleChips = selectedFilterOptions.slice(0, 2)

            return (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  overflow: 'hidden',
                }}
              >
                {visibleChips.map((option) => (
                  <ZoneClassChip
                    key={option.value}
                    code={option.code}
                    color={option.color}
                  />
                ))}
                {selectedFilterOptions.length > visibleChips.length && (
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      lineHeight: '0.875rem',
                      letterSpacing: '0.04em',
                      color: '#111111',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    +{selectedFilterOptions.length - visibleChips.length}
                  </Typography>
                )}
              </Box>
            )
          }}
          MenuProps={{
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'left',
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'left',
            },
            PaperProps: {
              sx: {
                mt: 0.5,
                borderRadius: '0.625rem',
                border: '0.5px solid #D6D6D6',
                boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
              },
            },
          }}
          sx={{
            '&.MuiOutlinedInput-root': {
              minHeight: '1.375rem',
              borderRadius: '0.625rem',
              backgroundColor: '#FFFFFF',
              boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D6D6D6',
            },
            '& .MuiSelect-select': {
              minHeight: '1.375rem',
              display: 'flex',
              alignItems: 'center',
              py: '0.1875rem',
              pl: '0.3125rem',
              pr: '2.25rem !important',
            },
            '& .MuiSelect-icon': {
              width: '0.75rem',
              height: '0.375rem',
              right: '0.875rem',
            },
          }}
        >
          {filterOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                py: '0.5rem',
              }}
            >
              <Checkbox
                checked={selectedFilterValues.includes(option.value)}
                sx={{
                  p: 0,
                  mr: '0.25rem',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1rem',
                  },
                }}
              />
              <ZoneClassChip code={option.code} color={option.color} />
              <Typography
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: '0.6875rem',
                  lineHeight: '1rem',
                  letterSpacing: '0.04em',
                  color: '#111111',
                }}
              >
                {option.label}
              </Typography>
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
            </MenuItem>
          ))}
        </Select>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            pt: '0.125rem',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              color: '#111111',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.5rem',
                fontWeight: 700,
                lineHeight: '0.75rem',
                letterSpacing: '0.12em',
                color: '#111111',
              }}
            >
              {t('sidebar.plan_settings.areas.sort_name_asc')}
            </Typography>
            <Ascending sx={{ width: 14, height: 11 }} />
          </Box>

          <Typography
            sx={{
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
        </Box>
      </Box>

      <Box sx={{ px: CONTENT_PADDING_X }}>
        {visibleFeatures.map((feature, index) => (
          <ZoneAccordionItem
            key={feature.properties.id}
            accordionRefs={accordionRefs}
            expanded={isAccordionExpanded(feature.properties.id)}
            feature={feature}
            index={index}
            isLast={index === visibleFeatures.length - 1}
            isZoningClassesLoading={isZoningClassesLoading}
            onChange={handleAccordionChange}
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
