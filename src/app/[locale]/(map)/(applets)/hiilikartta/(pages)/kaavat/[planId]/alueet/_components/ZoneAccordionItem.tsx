import {
  useEffect,
  useMemo,
  useState,
  type MutableRefObject,
  type SyntheticEvent,
} from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  Collapse,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import TText from '#/components/common/TText'

import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import { NumberInputField } from '#/components/common/NumberInputField'
import { ArrowDown, QuestionCircleOutline, Warning } from '#/components/icons'
import { useTranslate } from '@tolgee/react'

import {
  CUSTOM_ZONING_CODE,
  POWERLINE_ZONING_CLASS_PREFIX,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/constants'
import type {
  PlanDataFeature,
  ZoningClass,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import {
  checkIsValidLandUseDistribution,
  checkIsValidZoningCode,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import {
  getZoningClassByCode,
  getZoningClassLandUseDefaults,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'
import type { SelectOption } from '#/common/types/general'
import ZoneClassChip from './ZoneClassChip'
import {
  getLandUseDistributionTotal,
  getZoneClassPresentation,
  getZoneDisplayName,
} from './zoneAreaUtils'

const landUseFields = [
  {
    key: 'landuse_built',
    translationKey: 'sidebar.plan_settings.zones.landuse_built',
  },
  {
    key: 'landuse_new_open_vegetation',
    translationKey: 'sidebar.plan_settings.zones.landuse_new_open_vegetation',
    powerlineTranslationKey:
      'sidebar.plan_settings.zones.landuse_powerline_open',
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

type Props = {
  accordionRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
  expanded: boolean
  feature: PlanDataFeature
  index: number
  isLast: boolean
  isZoningClassesLoading: boolean
  onChange: (
    featureId: string
  ) => (_event: SyntheticEvent, isExpanded: boolean) => void
  updateFeature: (id: string, feature: Partial<PlanDataFeature>) => void
  zoningClasses: ZoningClass[]
  zoningCodeOptions: SelectOption[]
}

const FIELD_LABEL_SX = {
  mb: '0.3125rem',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '0.8125rem',
  letterSpacing: '0.11em',
  color: '#111111',
} as const

const TEXT_FIELD_SX = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    minHeight: '1.375rem',
    borderRadius: '0.625rem',
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D6D6D6',
  },
  '& .MuiOutlinedInput-notchedOutline legend': {
    maxWidth: 0,
  },
  '& .MuiOutlinedInput-input': {
    px: '1rem',
    py: '0.1875rem',
    fontSize: '0.6875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.04em',
    color: '#111111',
  },
} as const

const NUMBER_FIELD_WIDTH = '4.5rem'

const numberFieldInputSx = {
  width: NUMBER_FIELD_WIDTH,
  '&.MuiOutlinedInput-root': {
    minHeight: '1.5rem',
    borderRadius: '0.625rem',
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D6D6D6',
  },
  '& .MuiInputBase-input': {
    px: '0.625rem',
    py: '0.125rem',
    fontSize: '0.6875rem',
    lineHeight: 'normal',
    letterSpacing: '0.04em',
    textAlign: 'center',
  },
} as const

const numberFieldAdornmentSx = {
  '& button': {
    pl: 0.25,
    pr: 0.625,
  },
} as const

const ZoneAccordionItem = ({
  accordionRefs,
  expanded,
  feature,
  index,
  isLast,
  isZoningClassesLoading,
  onChange,
  updateFeature,
  zoningClasses,
  zoningCodeOptions,
}: Props) => {
  const { t } = useTranslate('hiilikartta')
  const [isLandUseEditorOpen, setIsLandUseEditorOpen] = useState(false)
  const percentageFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fi-FI', {
        maximumFractionDigits: 2,
      }),
    []
  )

  const displayName = useMemo(
    () =>
      getZoneDisplayName({
        areaLabel: t('sidebar.plan_settings.area'),
        name: feature.properties.name,
        newAreaLabel: t('sidebar.plan_settings.new_area'),
      }),
    [feature.properties.name, t]
  )

  const zoningPresentation = useMemo(
    () =>
      getZoneClassPresentation({
        unknownLabel: t('sidebar.plan_settings.areas.filter_unknown'),
        zoningClasses,
        zoningCode: feature.properties.zoning_code,
      }),
    [feature.properties.zoning_code, t, zoningClasses]
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

    return checkIsValidZoningCode(feature.properties.zoning_code ?? '')
  }, [
    feature.properties.extras?.hasValidZoningCode,
    feature.properties.zoning_code,
    isZoningClassesLoading,
  ])

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
  }, [feature.properties, isZoningClassesLoading, updateFeature, zoningClasses])

  const isLandUseDistributionValid = useMemo(
    () => checkIsValidLandUseDistribution(feature.properties),
    [feature.properties]
  )

  const isItemValid = hasValidZoningCode && isLandUseDistributionValid
  const landUseDistributionTotal = useMemo(
    () => getLandUseDistributionTotal(feature.properties),
    [feature.properties]
  )

  const handleZoningCodeChange = (event: SelectChangeEvent<string>) => {
    const zoningCode = event.target.value

    if (!zoningCode) {
      return
    }

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

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    updateFeature(feature.properties.id, {
      properties: {
        ...feature.properties,
        name: event.target.value,
      },
    })
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
    <Accordion
      disableGutters
      expanded={expanded}
      onChange={onChange(feature.properties.id)}
      ref={(node) => {
        accordionRefs.current[feature.properties.id] = node
      }}
      sx={{
        backgroundColor: 'transparent',
        boxShadow: 'none',
        borderTop: '1px solid #D6D6D6',
        ...(isLast ? { borderBottom: '1px solid #D6D6D6' } : {}),
        '&::before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          m: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={
          <ArrowDown sx={{ width: 12, height: 8, color: '#111111' }} />
        }
        aria-controls={`panel-${index + 1}-content`}
        id={`panel-${index + 1}-header`}
        sx={{
          minHeight: '2.25rem',
          px: 0,
          py: '0.125rem',
          '& .MuiAccordionSummary-content': {
            my: 0,
            alignItems: 'center',
            gap: '0.625rem',
          },
          '& .MuiAccordionSummary-expandIconWrapper': {
            mr: 0,
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
            transform: 'rotate(180deg)',
          },
        }}
      >
        {!isItemValid && (
          <Warning
            sx={{
              width: 10,
              height: 9,
              color: '#D8A500',
              flexShrink: 0,
            }}
          />
        )}

        <ZoneClassChip
          code={zoningPresentation.code}
          color={zoningPresentation.color}
        />

        <Typography
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.625rem',
            fontWeight: 700,
            lineHeight: '1.125rem',
            letterSpacing: '0.18em',
            color: expanded ? '#274AFF' : '#111111',
          }}
        >
          {displayName}
        </Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 0, pt: 0, pb: '0.75rem' }}>
        <Box
          sx={{
            borderRadius: '0.75rem',
            backgroundColor: '#E8E8E8',
            p: '0.75rem',
          }}
        >
          <Box
            sx={{
              borderRadius: '0.625rem',
              backgroundColor: '#FFFFFF',
              p: '0.75rem',
              boxShadow: 'inset 0px 0px 0px 0.5px #D6D6D6',
            }}
          >
            <Typography sx={FIELD_LABEL_SX}>
              {t('sidebar.plan_settings.areas.rename_label')}
            </Typography>

            <TextField
              aria-label={`${t('sidebar.plan_settings.areas.rename_label')} ${displayName}`}
              value={
                typeof feature.properties.name === 'string'
                  ? feature.properties.name
                  : String(feature.properties.name ?? '')
              }
              onChange={handleNameChange}
              variant="outlined"
              sx={TEXT_FIELD_SX}
            />

            <Box sx={{ mt: '1rem' }}>
              <DropDownSelectWithHeader
                ariaLabel={`${t('sidebar.plan_settings.areas.change_class_label')} ${displayName}`}
                label={t('sidebar.plan_settings.areas.change_class_label')}
                options={zoningCodeOptions}
                onChange={handleZoningCodeChange}
                successIndicatorMode="hidden"
                value={feature.properties.zoning_code ?? ''}
                sx={{ mb: 0 }}
                labelSx={FIELD_LABEL_SX}
                selectSx={{
                  '&.MuiOutlinedInput-root': {
                    minHeight: '1.375rem',
                    borderRadius: '0.625rem',
                    backgroundColor: '#FFFFFF',
                    boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D6D6D6',
                  },
                  '& .MuiOutlinedInput-notchedOutline legend': {
                    maxWidth: 0,
                  },
                  '& .MuiSelect-select': {
                    minHeight: '1.375rem',
                    py: '0.1875rem',
                    pl: '0.75rem',
                    pr: '2.25rem !important',
                    fontSize: '0.6875rem',
                    fontWeight: 400,
                    lineHeight: 'normal',
                    letterSpacing: '0.04em',
                    color: '#111111',
                  },
                  '& .MuiSelect-icon': {
                    width: '0.75rem',
                    height: '0.375rem',
                    right: '0.875rem',
                  },
                }}
                typographySx={{
                  fontSize: '0.6875rem',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  letterSpacing: '0.04em',
                }}
              />
            </Box>

            {hasValidZoningCode && (
              <Box
                sx={{
                  mt: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                  }}
                >
                  <Typography
                    sx={{
                      ...FIELD_LABEL_SX,
                      mb: 0,
                    }}
                  >
                    {t('sidebar.plan_settings.zones.land_use_distribution')}
                  </Typography>

                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        minWidth: '4.625rem',
                        height: '1.25rem',
                        px: '0.625rem',
                        borderRadius: '999px',
                        backgroundColor: isLandUseDistributionValid
                          ? '#F0D46E'
                          : '#F3D56E',
                        color: '#111111',
                        fontSize: '0.625rem',
                        lineHeight: '1rem',
                        letterSpacing: '0.08em',
                      }}
                    >
                      <Box component="span">
                        {`${percentageFormatter.format(landUseDistributionTotal)} %`}
                      </Box>
                      {!isLandUseDistributionValid && (
                        <Warning
                          sx={{
                            width: 10,
                            height: 9,
                            color: '#8D6A00',
                          }}
                        />
                      )}
                    </Box>

                    {!isLandUseDistributionValid && (
                      <Tooltip
                        title={
                          <Typography
                            sx={{
                              maxWidth: '12.5rem',
                              fontSize: '0.75rem',
                              lineHeight: '1.125rem',
                              letterSpacing: '0.04em',
                              color: '#FFFFFF',
                            }}
                          >
                            <TText
                              keyName={
                                'sidebar.plan_settings.areas.land_use_distribution_invalid'
                              }
                              ns="hiilikartta"
                            />
                          </Typography>
                        }
                        placement="left-start"
                        arrow
                        enterTouchDelay={0}
                        slotProps={{
                          tooltip: {
                            sx: {
                              px: '1rem',
                              py: '0.875rem',
                              borderRadius: '0.3125rem',
                              bgcolor: '#454545',
                              boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.22)',
                            },
                          },
                          arrow: {
                            sx: {
                              color: '#454545',
                            },
                          },
                        }}
                      >
                        <ButtonBase
                          aria-label={`${t(
                            'sidebar.plan_settings.zones.land_use_distribution'
                          )} ${displayName}`}
                          sx={{
                            width: '1rem',
                            height: '1rem',
                            borderRadius: '999px',
                            color: '#6D6D6D',
                          }}
                        >
                          <QuestionCircleOutline
                            sx={{ width: 16, height: 16 }}
                          />
                        </ButtonBase>
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <ButtonBase
                  type="button"
                  aria-label={`${t('sidebar.plan_settings.areas.edit_land_use')} ${displayName}`}
                  onClick={() =>
                    setIsLandUseEditorOpen((previous) => !previous)
                  }
                  sx={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    px: '0.75rem',
                    py: '0.375rem',
                    borderRadius: '999px',
                    border: '0.5px solid #D6D6D6',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      lineHeight: '0.875rem',
                      letterSpacing: '0.06em',
                      color: '#111111',
                    }}
                  >
                    {t('sidebar.plan_settings.areas.edit_land_use')}
                  </Typography>
                  <ArrowDown
                    sx={{
                      width: 12,
                      height: 8,
                      color: '#111111',
                      transform: isLandUseEditorOpen
                        ? 'rotate(180deg)'
                        : 'none',
                      transition: 'transform 160ms ease',
                    }}
                  />
                </ButtonBase>

                <Collapse in={isLandUseEditorOpen} timeout="auto">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.875rem',
                      pt: '0.25rem',
                    }}
                  >
                    {landUseFields.map((field) => (
                      <Box
                        key={field.key}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                        }}
                      >
                        <Typography
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: '0.625rem',
                            lineHeight: '0.875rem',
                            letterSpacing: '0.04em',
                            color: '#111111',
                          }}
                        >
                          {t(
                            isPowerlineZoningClass &&
                              'powerlineTranslationKey' in field
                              ? field.powerlineTranslationKey
                              : field.translationKey
                          )}
                        </Typography>

                        <NumberInputField
                          size="small"
                          value={feature.properties[field.key] ?? null}
                          onValueChange={handleLandUseValueChange(field.key)}
                          error={!isLandUseDistributionValid}
                          minValue={0}
                          maxValue={100}
                          incrementStepValue={1}
                          containerSx={{ width: NUMBER_FIELD_WIDTH }}
                          inputRowSx={{ width: NUMBER_FIELD_WIDTH }}
                          formControlSx={{ width: NUMBER_FIELD_WIDTH }}
                          inputSx={numberFieldInputSx}
                          adornmentSx={numberFieldAdornmentSx}
                          inputSlotProps={{ inputMode: 'decimal' }}
                        />
                      </Box>
                    ))}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        pt: '0.75rem',
                      }}
                    >
                      <Typography
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: '0.625rem',
                          lineHeight: '0.875rem',
                          letterSpacing: '0.04em',
                          color: '#111111',
                        }}
                      >
                        {t(
                          'sidebar.plan_settings.zones.soil_change_new_vegetation_pct'
                        )}
                      </Typography>

                      <NumberInputField
                        size="small"
                        value={feature.properties[soilChangeKey] ?? null}
                        onValueChange={handleSoilChangeValueChange}
                        minValue={0}
                        maxValue={100}
                        incrementStepValue={1}
                        containerSx={{ width: NUMBER_FIELD_WIDTH }}
                        inputRowSx={{ width: NUMBER_FIELD_WIDTH }}
                        formControlSx={{ width: NUMBER_FIELD_WIDTH }}
                        inputSx={numberFieldInputSx}
                        adornmentSx={numberFieldAdornmentSx}
                        inputSlotProps={{ inputMode: 'decimal' }}
                      />
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            )}
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export default ZoneAccordionItem
