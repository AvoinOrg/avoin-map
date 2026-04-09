import {
  type ChangeEvent,
  useEffect,
  useMemo,
  type MutableRefObject,
} from 'react'
import {
  Box,
  ButtonBase,
  Collapse,
  TextField,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { useTranslate } from '@tolgee/react'

import type { SelectOption } from '#/common/types/general'
import TText from '#/components/common/TText'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import { NumberInputField } from '#/components/common/NumberInputField'
import { ArrowDown, QuestionCircleOutline, Warning } from '#/components/icons'

import {
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
  isLast: boolean
  isZoningClassesLoading: boolean
  landUseEditorOpen: boolean
  onLandUseEditorToggle: (featureId: string, nextOpen: boolean) => void
  onToggle: (featureId: string) => void
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
const SUMMARY_GUTTER_WIDTH = '1rem'
const SUMMARY_ROW_PADDING_X = '0.375rem'
const DETAILS_PADDING_LEFT = `calc(${SUMMARY_ROW_PADDING_X} + ${SUMMARY_GUTTER_WIDTH})`
const OPEN_ITEM_MARGIN_X = { mobile: '-0.5rem', desktop: '-0.75rem' } as const

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
  isLast,
  isZoningClassesLoading,
  landUseEditorOpen,
  onLandUseEditorToggle,
  onToggle,
  updateFeature,
  zoningClasses,
  zoningCodeOptions,
}: Props) => {
  const { t } = useTranslate('hiilikartta')
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
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    <Box
      ref={(node) => {
        accordionRefs.current[feature.properties.id] =
          node as HTMLDivElement | null
      }}
      sx={{
        mx: expanded ? OPEN_ITEM_MARGIN_X : 0,
        my: expanded ? '0.25rem' : 0,
        transition:
          'margin 160ms ease, background-color 160ms ease, box-shadow 160ms ease',
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          borderTop: '1px solid #D6D6D6',
          borderRight: expanded ? '1px solid #D6D6D6' : 'none',
          borderBottom: expanded || isLast ? '1px solid #D6D6D6' : 'none',
          borderLeft: expanded ? '1px solid #D6D6D6' : 'none',
          borderRadius: expanded ? '0.75rem' : 0,
          backgroundColor: expanded ? '#FFFFFF' : 'transparent',
          boxShadow: expanded
            ? '0px 1px 2px rgba(17, 17, 17, 0.06), inset 0px 1px 2px rgba(214, 214, 214, 0.35)'
            : 'none',
        }}
      >
        <ButtonBase
          type="button"
          onClick={() => onToggle(feature.properties.id)}
          aria-expanded={expanded}
          aria-controls={`zone-panel-${feature.properties.id}`}
          id={`zone-toggle-${feature.properties.id}`}
          sx={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: `${SUMMARY_GUTTER_WIDTH} auto minmax(0, 1fr) auto`,
            alignItems: 'center',
            columnGap: '0.625rem',
            px: SUMMARY_ROW_PADDING_X,
            py: '0.375rem',
            justifyContent: 'initial',
            textAlign: 'left',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              width: SUMMARY_GUTTER_WIDTH,
              justifyContent: 'center',
              alignItems: 'center',
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
          </Box>

          <ZoneClassChip
            code={zoningPresentation.code}
            color={zoningPresentation.color}
          />

          <Box
            sx={{
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: '0.625rem',
                fontWeight: 700,
                lineHeight: '1.125rem',
                letterSpacing: '0.18em',
                color: '#111111',
              }}
            >
              {displayName}
            </Typography>
          </Box>

          <ArrowDown
            sx={{
              width: 12,
              height: 8,
              color: '#111111',
              transform: expanded ? 'rotate(180deg)' : 'none',
              transition: 'transform 160ms ease',
            }}
          />
        </ButtonBase>

        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          id={`zone-panel-${feature.properties.id}`}
          aria-labelledby={`zone-toggle-${feature.properties.id}`}
        >
          <Box
            sx={{
              pb: '0.875rem',
              pl: DETAILS_PADDING_LEFT,
              pr: SUMMARY_ROW_PADDING_X,
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
                    gap: '0.75rem',
                  }}
                >
                  <ButtonBase
                    type="button"
                    aria-label={`${t(
                      'sidebar.plan_settings.zones.land_use_distribution'
                    )} ${displayName}`}
                    onClick={() =>
                      onLandUseEditorToggle(
                        feature.properties.id,
                        !landUseEditorOpen
                      )
                    }
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      px: 0,
                      py: '0.125rem',
                      textAlign: 'left',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        minWidth: 0,
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <ArrowDown
                        sx={{
                          width: 12,
                          height: 8,
                          color: '#111111',
                          flexShrink: 0,
                          transform: landUseEditorOpen
                            ? 'rotate(180deg)'
                            : 'none',
                          transition: 'transform 160ms ease',
                        }}
                      />

                      <Typography
                        sx={{
                          ...FIELD_LABEL_SX,
                          mb: 0,
                        }}
                      >
                        {t('sidebar.plan_settings.zones.land_use_distribution')}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        flexShrink: 0,
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        lineHeight: '1rem',
                        letterSpacing: '0.08em',
                        color: isLandUseDistributionValid ? '#111111' : '#8D6A00',
                      }}
                    >
                      {`${percentageFormatter.format(landUseDistributionTotal)} %`}
                    </Typography>
                  </ButtonBase>

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
                        type="button"
                        aria-label={`${t(
                          'sidebar.plan_settings.zones.land_use_distribution'
                        )} ${displayName}`}
                        sx={{
                          width: '1rem',
                          height: '1rem',
                          flexShrink: 0,
                          borderRadius: '999px',
                          color: '#6D6D6D',
                        }}
                      >
                        <QuestionCircleOutline sx={{ width: 16, height: 16 }} />
                      </ButtonBase>
                    </Tooltip>
                  )}
                </Box>

                <Collapse in={landUseEditorOpen} timeout="auto" unmountOnExit>
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
        </Collapse>
      </Box>
    </Box>
  )
}

export default ZoneAccordionItem
