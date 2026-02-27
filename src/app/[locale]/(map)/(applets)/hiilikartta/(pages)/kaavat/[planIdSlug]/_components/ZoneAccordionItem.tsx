import {
  memo,
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
  type SyntheticEvent,
} from 'react'
import {
  AccordionDetails,
  Box,
  ButtonBase,
  Collapse,
  type SelectChangeEvent,
  Tooltip,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { T, useTranslate } from '@tolgee/react'

import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import CustomAccordion from '#/components/common/CustomAccordion'
import CustomAccordionSummary from '#/components/common/CustomAccordionSummary'
import { NumberInputField } from '#/components/common/NumberInputField'
import { ArrowDown, ArrowUp, QuestionCircleOutline } from '#/components/icons'

import {
  CUSTOM_ZONING_CODE,
  POWERLINE_ZONING_CLASS_PREFIX,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/constants'
import { PlanDataFeature } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import ZoneAccordionItemTitle from './ZoneAccordionItemTitle'
import {
  checkIsValidLandUseDistribution,
  checkIsValidZoningCode,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { useZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/useZoningClasses'
import {
  getZoningClassByCode,
  getZoningClassLandUseDefaults,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'

const landUseFields = [
  {
    key: 'landuse_built',
    translationKey: 'sidebar.plan_settings.zones.landuse_built',
  },
  {
    key: 'landuse_new_open_vegetation',
    translationKey: 'sidebar.plan_settings.zones.landuse_new_open_vegetation',
    powerlineTranslationKey: 'sidebar.plan_settings.zones.landuse_powerline_open',
  },
  {
    key: 'landuse_new_tree_vegetation',
    translationKey: 'sidebar.plan_settings.zones.landuse_new_tree_vegetation',
    powerlineTranslationKey:
      'sidebar.plan_settings.zones.landuse_powerline_buffer',
  },
  {
    key: 'landuse_existing',
    translationKey: 'sidebar.plan_settings.zones.landuse_existing',
  },
] as const satisfies readonly {
  key: string
  translationKey: string
  powerlineTranslationKey?: string
}[]

type LandUseFieldKey = (typeof landUseFields)[number]['key']
const soilChangeKey = 'soil_change_new_vegetation_pct' as const
type SoilChangeKey = typeof soilChangeKey
type LandUseValueKey = LandUseFieldKey | SoilChangeKey

interface CustomAccordionProps {
  feature: PlanDataFeature
  index: number
  expanded: boolean
  onChange: (
    featureId: string
  ) => (event: SyntheticEvent, isExpanded: boolean) => void
  accordionRefs: MutableRefObject<{
    [key: string]: HTMLDivElement | null
  }>
  updateFeature: (id: string, feature: Partial<PlanDataFeature>) => void
}

const ZoneAccordionItem = memo(
  ({
    feature,
    index,
    expanded,
    onChange,
    accordionRefs,
    updateFeature,
  }: CustomAccordionProps) => {
    const { t } = useTranslate('hiilikartta')
    const { zoningClasses, isLoading: isZoningClassesLoading } =
      useZoningClasses()
    const zoningCodeOptions = useMemo(() => {
      const seen = new Set<string>()
      return zoningClasses
        .filter((zoning) => {
          const normalizedCode = zoning.code.toUpperCase()
          if (seen.has(normalizedCode)) {
            return false
          }
          seen.add(normalizedCode)
          return true
        })
        .map((zoning) => ({
          value: zoning.code,
          label: zoning.name,
        }))
    }, [zoningClasses])
    const [isLandUseExpanded, setIsLandUseExpanded] = useState(
      feature.properties.zoning_code?.toUpperCase() === CUSTOM_ZONING_CODE
    )
    const isPowerlineZoningClass = useMemo(() => {
      const zoningCode = feature.properties.zoning_code
      if (!zoningCode) {
        return false
      }
      return zoningCode
        .toLowerCase()
        .startsWith(POWERLINE_ZONING_CLASS_PREFIX.toLowerCase())
    }, [feature.properties.zoning_code])

    const hasValidZoningCode = useMemo(() => {
      if (feature.properties.extras?.hasValidZoningCode != null) {
        return feature.properties.extras.hasValidZoningCode
      }
      if (isZoningClassesLoading) {
        return true
      }
      return checkIsValidZoningCode(feature.properties.zoning_code)
    }, [
      feature.properties.extras?.hasValidZoningCode,
      feature.properties.zoning_code,
      isZoningClassesLoading,
      zoningClasses,
    ])

    useEffect(() => {
      if (
        feature.properties.zoning_code?.toUpperCase() === CUSTOM_ZONING_CODE &&
        hasValidZoningCode
      ) {
        setIsLandUseExpanded(true)
      }
    }, [feature.properties.zoning_code, hasValidZoningCode])

    useEffect(() => {
      if (!hasValidZoningCode) {
        setIsLandUseExpanded(false)
      }
    }, [hasValidZoningCode])

    useEffect(() => {
      if (isZoningClassesLoading) {
        return
      }

      const zoningClass = getZoningClassByCode(
        feature.properties.zoning_code,
        zoningClasses
      )
      const nextHasValidZoningCode = zoningClass != null
      const needsHasValidUpdate =
        feature.properties.extras?.hasValidZoningCode !== nextHasValidZoningCode

      if (!zoningClass) {
        if (!needsHasValidUpdate) {
          return
        }

        updateFeature(feature.properties.id, {
          properties: {
            ...feature.properties,
            extras: {
              ...feature.properties.extras,
              hasValidZoningCode: false,
            },
          },
        })
        return
      }

      const hasLandUseValues = landUseFields.some(
        (field) => feature.properties[field.key] != null
      )
      const needsSoilChangeUpdate = feature.properties[soilChangeKey] == null
      const needsZoningCodeUpdate =
        feature.properties.zoning_code !== zoningClass.code

      if (
        !needsZoningCodeUpdate &&
        hasLandUseValues &&
        !needsHasValidUpdate &&
        !needsSoilChangeUpdate
      ) {
        return
      }

      const landUseDefaults = getZoningClassLandUseDefaults(zoningClass)
      const landUseUpdates: Partial<Record<LandUseValueKey, number>> = {}
      landUseFields.forEach((field) => {
        if (feature.properties[field.key] == null) {
          landUseUpdates[field.key] = landUseDefaults[field.key]
        }
      })
      if (feature.properties[soilChangeKey] == null) {
        landUseUpdates[soilChangeKey] = landUseDefaults[soilChangeKey]
      }

      updateFeature(feature.properties.id, {
        properties: {
          ...feature.properties,
          zoning_code: zoningClass.code,
          extras: {
            ...feature.properties.extras,
            hasValidZoningCode: true,
          },
          ...landUseUpdates,
        },
      })
    }, [
      feature.properties,
      isZoningClassesLoading,
      updateFeature,
      zoningClasses,
    ])

    const isLandUseDistributionValid = useMemo(
      () => checkIsValidLandUseDistribution(feature.properties),
      [feature.properties]
    )

    const isItemValid = hasValidZoningCode && isLandUseDistributionValid

    const handleZoningCodeChange = (event: SelectChangeEvent<string>) => {
      const zoningCode = event.target.value

      if (zoningCode != null) {
        const zoningClass = getZoningClassByCode(zoningCode, zoningClasses)
        const nextHasValidZoningCode = zoningClass != null

        updateFeature(feature.properties.id, {
          properties: {
            ...feature.properties,
            zoning_code: zoningClass?.code ?? zoningCode,
            extras: {
              ...feature.properties.extras,
              hasValidZoningCode: nextHasValidZoningCode,
            },
            ...(zoningClass ? getZoningClassLandUseDefaults(zoningClass) : {}),
          },
        })
      }
    }

    const handleNameChange = (event: any) => {
      const name = event.target.value

      if (name != null && name != '') {
        updateFeature(feature.properties.id, {
          properties: { ...feature.properties, name: name },
        })
      }
    }

    const handleLandUseValueChange =
      (key: LandUseFieldKey) => (nextValue: number | null) => {
        if (nextValue !== null && Number.isNaN(nextValue)) {
          return
        }

        updateFeature(feature.properties.id, {
          properties: { ...feature.properties, [key]: nextValue },
        })
      }

    const handleSoilChangeValueChange = (nextValue: number | null) => {
      if (nextValue !== null && Number.isNaN(nextValue)) {
        return
      }

      updateFeature(feature.properties.id, {
        properties: {
          ...feature.properties,
          [soilChangeKey]: nextValue,
        },
      })
    }

    const handleLandUseTooltipClick = (event: SyntheticEvent) => {
      event.stopPropagation()
    }

    return (
      <CustomAccordion
        key={feature.properties.id}
        slotProps={{ transition: { unmountOnExit: true } }}
        expanded={expanded}
        onChange={onChange(feature.properties.id)}
        ref={(el) => (accordionRefs.current[feature.properties.id] = el)}
      >
        <CustomAccordionSummary
          aria-controls={`panel${index + 1}-content`}
          id={`panel${index + 1}-header`}
          aria-label={`Toggle zone ${feature.properties.name ?? feature.properties.id}`}
          sx={{
            '& .MuiAccordionSummary-content': {
              width: '100%',
              display: 'flex',
              flexGrow: 1,
            },
          }}
        >
          <ZoneAccordionItemTitle
            name={feature.properties.name}
            zoningCode={feature.properties.zoning_code}
            isValid={isItemValid}
            onChange={handleNameChange}
          ></ZoneAccordionItemTitle>
        </CustomAccordionSummary>
        <AccordionDetails sx={{ display: 'flex', flexDirection: 'column' }}>
          <Row>
            <T
              keyName={'sidebar.plan_settings.zones.area_information'}
              ns="hiilikartta"
            ></T>
          </Row>
          <DropDownSelectWithHeader
            value={feature.properties.zoning_code}
            options={zoningCodeOptions}
            onChange={handleZoningCodeChange}
            sx={{
              backgroundColor: 'neutral.lighter',
              borderColor: 'primary.light',
              mt: 1,
            }}
          ></DropDownSelectWithHeader>
          {hasValidZoningCode ? (
            <Box sx={{ mt: 3 }}>
              <ButtonBase
                onClick={() => setIsLandUseExpanded((prev) => !prev)}
                aria-label={`${
                  isLandUseExpanded ? 'Collapse' : 'Expand'
                } land use distribution for ${
                  feature.properties.name ?? feature.properties.id
                }`}
                disableRipple
                disableTouchRipple
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  display: 'flex',
                  borderRadius: 1,
                  py: 0.5,
                  textAlign: 'left',
                  color: isLandUseDistributionValid
                    ? 'text.secondary'
                    : 'warning.main',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '16px',
                  }}
                >
                  <Typography variant="body2">
                    {t('sidebar.plan_settings.zones.land_use_distribution')}
                  </Typography>
                  {!isLandUseDistributionValid && (
                    <Tooltip
                      title={t(
                        'sidebar.plan_settings.zones.land_use_distribution.sum_not_100_error'
                      )}
                      placement="top"
                      enterTouchDelay={0}
                    >
                      <Box
                        component="button"
                        type="button"
                        aria-label={`Show land use distribution help for ${
                          feature.properties.name ?? feature.properties.id
                        }`}
                        onClick={handleLandUseTooltipClick}
                        onMouseDown={handleLandUseTooltipClick}
                        onTouchStart={handleLandUseTooltipClick}
                        sx={{
                          border: 'none',
                          background: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 0,
                          px: 0.75,
                          borderRadius: '50%',
                          cursor: 'help',
                        }}
                      >
                        <QuestionCircleOutline sx={{ width: 20, height: 20 }} />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
                {isLandUseExpanded ? (
                  <ArrowUp sx={{ fontSize: 16 }} />
                ) : (
                  <ArrowDown sx={{ fontSize: 16 }} />
                )}
              </ButtonBase>
              <Collapse in={isLandUseExpanded} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    mt: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {landUseFields.map((field) => (
                    <NumberInputField
                      key={field.key}
                      label={t(
                        isPowerlineZoningClass &&
                          'powerlineTranslationKey' in field
                          ? field.powerlineTranslationKey
                          : field.translationKey
                      )}
                      size="small"
                      value={feature.properties[field.key] ?? null}
                      onValueChange={handleLandUseValueChange(field.key)}
                      error={!isLandUseDistributionValid}
                      minValue={0}
                      maxValue={100}
                      incrementStepValue={1}
                      containerSx={{ width: '100%' }}
                      inputRowSx={{ width: '100%' }}
                      formControlSx={{ width: '100%' }}
                      inputSx={{ width: '100%' }}
                      inputSlotProps={{ inputMode: 'decimal' }}
                    />
                  ))}
                  <NumberInputField
                    label={t(
                      'sidebar.plan_settings.zones.soil_change_new_vegetation_pct'
                    )}
                    size="small"
                    value={feature.properties[soilChangeKey] ?? null}
                    onValueChange={handleSoilChangeValueChange}
                    minValue={0}
                    maxValue={100}
                    incrementStepValue={1}
                    containerSx={{ width: '100%', mt: 3 }}
                    inputRowSx={{ width: '100%' }}
                    formControlSx={{ width: '100%' }}
                    inputSx={{ width: '100%' }}
                    inputSlotProps={{ inputMode: 'decimal' }}
                  />
                </Box>
              </Collapse>
            </Box>
          ) : null}
        </AccordionDetails>
      </CustomAccordion>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.expanded === nextProps.expanded &&
      prevProps.feature.properties.zoning_code ===
        nextProps.feature.properties.zoning_code &&
      prevProps.feature.properties.name === nextProps.feature.properties.name &&
      prevProps.feature.properties.landuse_built ===
        nextProps.feature.properties.landuse_built &&
      prevProps.feature.properties.landuse_new_open_vegetation ===
        nextProps.feature.properties.landuse_new_open_vegetation &&
      prevProps.feature.properties.landuse_new_tree_vegetation ===
        nextProps.feature.properties.landuse_new_tree_vegetation &&
      prevProps.feature.properties.landuse_existing ===
        nextProps.feature.properties.landuse_existing &&
      prevProps.feature.properties.soil_change_new_vegetation_pct ===
        nextProps.feature.properties.soil_change_new_vegetation_pct &&
      prevProps.feature.properties.extras?.hasValidZoningCode ===
        nextProps.feature.properties.extras?.hasValidZoningCode
    )
  }
)

export default ZoneAccordionItem

const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
}))
