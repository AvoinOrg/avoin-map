import {
  memo,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from 'react'
import {
  AccordionDetails,
  Box,
  ButtonBase,
  Collapse,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { T, useTranslate } from '@tolgee/react'

import DropDownSelect from '#/components/common/DropDownSelect'
import CustomAccordion from '#/components/common/CustomAccordion'
import CustomAccordionSummary from '#/components/common/CustomAccordionSummary'
import { NumberInputField } from '#/components/common/NumberInputField'
import { ArrowDown, ArrowUp } from '#/components/icons'

import {
  CUSTOM_ZONING_CODE,
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
  },
  {
    key: 'landuse_new_tree_vegetation',
    translationKey: 'sidebar.plan_settings.zones.landuse_new_tree_vegetation',
  },
  {
    key: 'landuse_existing',
    translationKey: 'sidebar.plan_settings.zones.landuse_existing',
  },
] as const

type LandUseFieldKey = (typeof landUseFields)[number]['key']
const soilChangeKey = 'soil_change_new_vegetation_pct'

interface CustomAccordionProps {
  feature: PlanDataFeature
  index: number
  expanded: boolean
  onChange: (
    featureId: string
  ) => (event: SyntheticEvent, isExpanded: boolean) => void
  accordionRefs: React.MutableRefObject<{
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
    const zoningCodeOptions = useMemo(
      () => {
        const seen = new Set<string>()
        return zoningClasses.filter((zoning) => {
          const normalizedCode = zoning.code.toUpperCase()
          if (seen.has(normalizedCode)) {
            return false
          }
          seen.add(normalizedCode)
          return true
        }).map((zoning) => ({
          value: zoning.code,
          label: zoning.name,
        }))
      },
      [zoningClasses]
    )
    const [isLandUseExpanded, setIsLandUseExpanded] = useState(
      feature.properties.zoning_code?.toUpperCase() === CUSTOM_ZONING_CODE
    )

    const hasValidZoningCode = useMemo(() => {
      if (feature.properties.hasValidZoningCode != null) {
        return feature.properties.hasValidZoningCode
      }
      if (isZoningClassesLoading) {
        return true
      }
      return checkIsValidZoningCode(feature.properties.zoning_code)
    }, [
      feature.properties.hasValidZoningCode,
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
        feature.properties.hasValidZoningCode !== nextHasValidZoningCode

      if (!zoningClass) {
        if (!needsHasValidUpdate) {
          return
        }

        updateFeature(feature.properties.id, {
          properties: {
            ...feature.properties,
            hasValidZoningCode: false,
          },
        })
        return
      }

      const hasLandUseValues = landUseFields.some(
        (field) => feature.properties[field.key] != null
      )
      const needsSoilChangeUpdate =
        feature.properties[soilChangeKey] == null
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
      const landUseUpdates: Partial<PlanDataFeature['properties']> = {}
      landUseFields.forEach((field) => {
        if (feature.properties[field.key] == null) {
          landUseUpdates[field.key] = landUseDefaults[field.key]
        }
      })
      if (feature.properties[soilChangeKey] == null) {
        landUseUpdates[soilChangeKey] =
          landUseDefaults[soilChangeKey]
      }

      updateFeature(feature.properties.id, {
        properties: {
          ...feature.properties,
          zoning_code: zoningClass.code,
          hasValidZoningCode: true,
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

    const handleZoningCodeChange = (event: any) => {
      const zoningCode = event.target.value

      if (zoningCode != null) {
        const zoningClass = getZoningClassByCode(zoningCode, zoningClasses)
        const nextHasValidZoningCode = zoningClass != null

        updateFeature(feature.properties.id, {
          properties: {
            ...feature.properties,
            zoning_code: zoningClass?.code ?? zoningCode,
            hasValidZoningCode: nextHasValidZoningCode,
            ...(zoningClass
              ? getZoningClassLandUseDefaults(zoningClass)
              : {}),
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
          <DropDownSelect
            value={feature.properties.zoning_code}
            options={zoningCodeOptions}
            onChange={handleZoningCodeChange}
            sx={{
              backgroundColor: 'neutral.lighter',
              borderColor: 'primary.light',
              mt: 1,
            }}
          ></DropDownSelect>
          {hasValidZoningCode ? (
            <Box sx={{ mt: 2 }}>
              <ButtonBase
                onClick={() => setIsLandUseExpanded((prev) => !prev)}
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
                <Typography variant="body2">
                  {t('sidebar.plan_settings.zones.land_use_distribution')}
                </Typography>
                {isLandUseExpanded ? (
                  <ArrowUp sx={{ fontSize: 16 }} />
                ) : (
                  <ArrowDown sx={{ fontSize: 16 }} />
                )}
              </ButtonBase>
              <Collapse in={isLandUseExpanded} timeout="auto" unmountOnExit>
                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                  }}
                >
                  {landUseFields.map((field) => (
                    <NumberInputField
                      key={field.key}
                      label={t(field.translationKey)}
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
      prevProps.feature.properties.hasValidZoningCode ===
        nextProps.feature.properties.hasValidZoningCode &&
      prevProps.feature.properties.landuse_built ===
        nextProps.feature.properties.landuse_built &&
      prevProps.feature.properties.landuse_new_open_vegetation ===
        nextProps.feature.properties.landuse_new_open_vegetation &&
      prevProps.feature.properties.landuse_new_tree_vegetation ===
        nextProps.feature.properties.landuse_new_tree_vegetation &&
      prevProps.feature.properties.landuse_existing ===
        nextProps.feature.properties.landuse_existing &&
      prevProps.feature.properties.soil_change_new_vegetation_pct ===
        nextProps.feature.properties.soil_change_new_vegetation_pct
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
