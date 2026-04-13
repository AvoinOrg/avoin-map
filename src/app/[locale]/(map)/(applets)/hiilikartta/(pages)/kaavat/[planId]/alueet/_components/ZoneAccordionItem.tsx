import {
  type ChangeEvent,
  type KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import {
  Box,
  ButtonBase,
  Collapse,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'
import { useTranslate } from '@tolgee/react'

import type { SelectOption } from '#/common/types/general'
import TText from '#/components/common/TText'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import { NumberInputField } from '#/components/common/NumberInputField'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'
import { ArrowDown, Warning } from '#/components/icons'

import { POWERLINE_ZONING_CLASS_PREFIX } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/constants'
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
import type { PlanDataFeatureUpdate } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
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
type LandUseDraft = Record<LandUseValueKey, number | null>

type Props = {
  accordionRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
  expanded: boolean
  feature: PlanDataFeature
  isLast: boolean
  isZoningClassesLoading: boolean
  landUseEditorOpen: boolean
  onLandUsePendingChange: (featureId: string, hasPending: boolean) => void
  onLandUseEditorToggle: (featureId: string, nextOpen: boolean) => void
  onToggle: (featureId: string) => void
  updateFeature: (id: string, feature: PlanDataFeatureUpdate) => void
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

const NUMBER_FIELD_WIDTH = '4.5rem'
const SUMMARY_ROW_PADDING_X = '0.375rem'
const DETAILS_PADDING_LEFT = SUMMARY_ROW_PADDING_X
const OPEN_ITEM_MARGIN_Y = '0.25rem'
const OPEN_SHELL_OUTSET_X = { mobile: '1rem', desktop: '1.5rem' } as const
const WARNING_ICON_OFFSET_X = {
  mobile: '-0.625rem',
  desktop: '-0.75rem',
} as const
const WARNING_ICON_TOP = '0.875rem'
const NAME_INPUT_DEBOUNCE_MS = 2000
const LAND_USE_INPUT_DEBOUNCE_MS = 2000
const LAND_USE_TOTAL_VALID_COLORS = {
  backgroundColor: '#D8E8B9',
  borderColor: '#AFC97B',
  color: '#46611A',
} as const
const LAND_USE_TOTAL_INVALID_COLORS = {
  backgroundColor: '#E5CF74',
  borderColor: '#D0B344',
  color: '#8D6A00',
} as const
const ACCORDION_BUTTON_RESET_SX = {
  '&.Mui-focusVisible': {
    backgroundColor: 'transparent',
  },
  '&:active': {
    backgroundColor: 'transparent',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
} as const

const numberFieldInputSx = {
  width: NUMBER_FIELD_WIDTH,
  '&.MuiOutlinedInput-root': {
    minHeight: '1.5rem',
    borderRadius: '999px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#D6D6D6',
    borderRadius: '999px',
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
  '& button:first-of-type': {
    borderTopRightRadius: '999px',
  },
  '& button:last-of-type': {
    borderBottomRightRadius: '999px',
  },
} as const

const warningTooltipSlotProps = {
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
} as const

const getLandUseDraft = (
  properties: PlanDataFeature['properties']
): LandUseDraft => ({
  landuse_built: properties.landuse_built ?? null,
  landuse_new_open_vegetation: properties.landuse_new_open_vegetation ?? null,
  landuse_new_tree_vegetation: properties.landuse_new_tree_vegetation ?? null,
  landuse_existing: properties.landuse_existing ?? null,
  soil_change_new_vegetation_pct:
    properties.soil_change_new_vegetation_pct ?? null,
})

const getFeatureNameValue = (name: PlanDataFeature['properties']['name']) =>
  typeof name === 'string' ? name : String(name ?? '')

const areLandUseDraftsEqual = (draftA: LandUseDraft, draftB: LandUseDraft) =>
  draftA.landuse_built === draftB.landuse_built &&
  draftA.landuse_new_open_vegetation === draftB.landuse_new_open_vegetation &&
  draftA.landuse_new_tree_vegetation === draftB.landuse_new_tree_vegetation &&
  draftA.landuse_existing === draftB.landuse_existing &&
  draftA.soil_change_new_vegetation_pct ===
    draftB.soil_change_new_vegetation_pct

type ZoneNameFieldProps = {
  ariaLabel: string
  label: string
  persistedName: string
  onCommit: (nextName: string) => void
}

const ZoneNameField = memo(
  ({ ariaLabel, label, persistedName, onCommit }: ZoneNameFieldProps) => {
    const [nameDraft, setNameDraft] = useState(persistedName)
    const nameDraftRef = useRef(persistedName)
    const persistedNameRef = useRef(persistedName)
    const isNameFocusedRef = useRef(false)
    const pendingNameDraftRef = useRef<string | null>(null)
    const pendingNameCommitRef = useRef<string | null>(null)
    const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onCommitRef = useRef(onCommit)

    useEffect(() => {
      onCommitRef.current = onCommit
    }, [onCommit])

    const clearCommitTimer = useCallback(() => {
      if (commitTimerRef.current == null) {
        return
      }

      clearTimeout(commitTimerRef.current)
      commitTimerRef.current = null
    }, [])

    const flushNameDraft = useCallback(() => {
      clearCommitTimer()

      const nextName = pendingNameDraftRef.current ?? nameDraftRef.current
      pendingNameDraftRef.current = null

      if (nextName === persistedNameRef.current) {
        pendingNameCommitRef.current = null
        return
      }

      pendingNameCommitRef.current = nextName
      onCommitRef.current(nextName)
    }, [clearCommitTimer])

    useEffect(() => {
      persistedNameRef.current = persistedName

      if (pendingNameCommitRef.current === persistedName) {
        pendingNameCommitRef.current = null
      }

      if (pendingNameDraftRef.current === persistedName) {
        pendingNameDraftRef.current = null
        clearCommitTimer()
      }

      if (
        isNameFocusedRef.current ||
        commitTimerRef.current != null ||
        pendingNameDraftRef.current != null ||
        pendingNameCommitRef.current != null
      ) {
        return
      }

      nameDraftRef.current = persistedName
      setNameDraft((previousNameDraft) =>
        previousNameDraft === persistedName ? previousNameDraft : persistedName
      )
    }, [clearCommitTimer, persistedName])

    useEffect(
      () => () => {
        clearCommitTimer()
      },
      [clearCommitTimer]
    )

    const handleNameChange = (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      const nextName = event.target.value

      nameDraftRef.current = nextName
      pendingNameDraftRef.current = nextName
      setNameDraft(nextName)

      clearCommitTimer()
      commitTimerRef.current = setTimeout(() => {
        flushNameDraft()
      }, NAME_INPUT_DEBOUNCE_MS)
    }

    const handleNameFocus = () => {
      isNameFocusedRef.current = true
    }

    const handleNameBlur = () => {
      isNameFocusedRef.current = false
      flushNameDraft()

      if (pendingNameCommitRef.current != null) {
        return
      }

      const nextPersistedName = persistedNameRef.current
      nameDraftRef.current = nextPersistedName
      setNameDraft((previousNameDraft) =>
        previousNameDraft === nextPersistedName
          ? previousNameDraft
          : nextPersistedName
      )
    }

    const handleNameKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') {
        return
      }

      event.preventDefault()
      flushNameDraft()
      ;(event.target as HTMLElement).blur()
    }

    return (
      <TextFieldWithLabel
        label={label}
        ariaLabel={ariaLabel}
        value={nameDraft}
        onChange={handleNameChange}
        onFocus={handleNameFocus}
        onBlur={handleNameBlur}
        onKeyDown={handleNameKeyDown}
        sx={{ mt: 1.5, mr: '-1rem', ml: '-1rem', width: 'auto' }}
      />
    )
  }
)

const ZoneAccordionItem = ({
  accordionRefs,
  expanded,
  feature,
  isLast,
  isZoningClassesLoading,
  landUseEditorOpen,
  onLandUsePendingChange,
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
  const persistedName = useMemo(
    () => getFeatureNameValue(feature.properties.name),
    [feature.properties.name]
  )
  const persistedLandUseDraft = useMemo(
    () => getLandUseDraft(feature.properties),
    [
      feature.properties.landuse_built,
      feature.properties.landuse_existing,
      feature.properties.landuse_new_open_vegetation,
      feature.properties.landuse_new_tree_vegetation,
      feature.properties.soil_change_new_vegetation_pct,
    ]
  )
  const [landUseDraft, setLandUseDraft] = useState<LandUseDraft>(
    persistedLandUseDraft
  )
  const landUseDraftRef = useRef(persistedLandUseDraft)
  const persistedLandUseDraftRef = useRef(persistedLandUseDraft)
  const pendingLandUseDraftRef = useRef<LandUseDraft | null>(null)
  const pendingLandUseCommitRef = useRef<LandUseDraft | null>(null)
  const landUseCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const hasPendingLandUseEditsRef = useRef(false)
  const draftProperties = useMemo(
    () => ({
      ...feature.properties,
      ...landUseDraft,
    }),
    [feature.properties, landUseDraft]
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
  const updateFeatureProperties = useCallback(
    (properties: Partial<PlanDataFeature['properties']>) => {
      updateFeature(feature.properties.id, { properties })
    },
    [feature.properties.id, updateFeature]
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
    landUseDraftRef.current = landUseDraft
  }, [landUseDraft])

  const clearLandUseCommitTimer = useCallback(() => {
    if (landUseCommitTimerRef.current == null) {
      return
    }

    clearTimeout(landUseCommitTimerRef.current)
    landUseCommitTimerRef.current = null
  }, [])

  const setHasPendingLandUseEdits = useCallback(
    (nextHasPending: boolean) => {
      if (hasPendingLandUseEditsRef.current === nextHasPending) {
        return
      }

      hasPendingLandUseEditsRef.current = nextHasPending
      onLandUsePendingChange(feature.properties.id, nextHasPending)
    },
    [feature.properties.id, onLandUsePendingChange]
  )

  const syncLandUsePendingState = useCallback(() => {
    setHasPendingLandUseEdits(
      landUseCommitTimerRef.current != null ||
        pendingLandUseDraftRef.current != null ||
        pendingLandUseCommitRef.current != null
    )
  }, [setHasPendingLandUseEdits])

  const flushLandUseDraft = useCallback(
    (draftToCommit?: LandUseDraft) => {
      clearLandUseCommitTimer()

      const nextDraft =
        draftToCommit ??
        pendingLandUseDraftRef.current ??
        landUseDraftRef.current

      pendingLandUseDraftRef.current = null

      if (areLandUseDraftsEqual(nextDraft, persistedLandUseDraftRef.current)) {
        pendingLandUseCommitRef.current = null
        syncLandUsePendingState()
        return
      }

      const committedDraft = { ...nextDraft }
      pendingLandUseCommitRef.current = committedDraft
      syncLandUsePendingState()
      updateFeatureProperties(committedDraft)
    },
    [clearLandUseCommitTimer, syncLandUsePendingState, updateFeatureProperties]
  )

  const scheduleLandUseCommit = useCallback(
    (nextDraft: LandUseDraft) => {
      const scheduledDraft = { ...nextDraft }

      pendingLandUseDraftRef.current = scheduledDraft
      clearLandUseCommitTimer()
      landUseCommitTimerRef.current = setTimeout(() => {
        flushLandUseDraft(scheduledDraft)
      }, LAND_USE_INPUT_DEBOUNCE_MS)
      syncLandUsePendingState()
    },
    [clearLandUseCommitTimer, flushLandUseDraft, syncLandUsePendingState]
  )

  useEffect(() => {
    persistedLandUseDraftRef.current = persistedLandUseDraft

    if (
      pendingLandUseCommitRef.current != null &&
      areLandUseDraftsEqual(
        pendingLandUseCommitRef.current,
        persistedLandUseDraft
      )
    ) {
      pendingLandUseCommitRef.current = null
    }

    if (
      pendingLandUseDraftRef.current != null &&
      areLandUseDraftsEqual(
        pendingLandUseDraftRef.current,
        persistedLandUseDraft
      )
    ) {
      pendingLandUseDraftRef.current = null
      clearLandUseCommitTimer()
    }

    const hasPendingLandUseEdits =
      landUseCommitTimerRef.current != null ||
      pendingLandUseDraftRef.current != null ||
      pendingLandUseCommitRef.current != null

    setHasPendingLandUseEdits(hasPendingLandUseEdits)

    if (hasPendingLandUseEdits) {
      return
    }

    landUseDraftRef.current = persistedLandUseDraft
    setLandUseDraft((previousDraft) =>
      areLandUseDraftsEqual(previousDraft, persistedLandUseDraft)
        ? previousDraft
        : persistedLandUseDraft
    )
  }, [
    clearLandUseCommitTimer,
    persistedLandUseDraft,
    setHasPendingLandUseEdits,
  ])

  useEffect(
    () => () => {
      clearLandUseCommitTimer()
      pendingLandUseDraftRef.current = null
      pendingLandUseCommitRef.current = null
      setHasPendingLandUseEdits(false)
    },
    [clearLandUseCommitTimer, setHasPendingLandUseEdits]
  )

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

      updateFeatureProperties({
        extras: {
          ...feature.properties.extras,
          hasValidZoningCode: false,
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

    updateFeatureProperties({
      zoning_code: zoningClass.code,
      extras: {
        ...feature.properties.extras,
        hasValidZoningCode: true,
      },
      ...landUseUpdates,
    })
  }, [
    feature.properties,
    isZoningClassesLoading,
    updateFeatureProperties,
    zoningClasses,
  ])

  const isLandUseDistributionValid = useMemo(
    () => checkIsValidLandUseDistribution(draftProperties),
    [draftProperties]
  )

  const isItemValid = hasValidZoningCode && isLandUseDistributionValid
  const landUseDistributionTotal = useMemo(
    () => getLandUseDistributionTotal(draftProperties),
    [draftProperties]
  )
  const landUseDistributionTooltip = !isLandUseDistributionValid ? (
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
        keyName="sidebar.plan_settings.areas.land_use_distribution_invalid"
        ns="hiilikartta"
      />
    </Typography>
  ) : null

  const handleZoningCodeChange = (event: SelectChangeEvent<string>) => {
    const zoningCode = event.target.value

    if (!zoningCode) {
      return
    }

    const zoningClass = getZoningClassByCode(zoningCode, zoningClasses)
    const nextHasValidZoningCode = zoningClass != null
    const nextProperties: Partial<PlanDataFeature['properties']> = {
      zoning_code: zoningClass?.code ?? zoningCode,
      extras: {
        ...feature.properties.extras,
        hasValidZoningCode: nextHasValidZoningCode,
      },
      ...(zoningClass ? getZoningClassLandUseDefaults(zoningClass) : {}),
    }
    const nextLandUseDraft = getLandUseDraft({
      ...feature.properties,
      ...nextProperties,
    })

    clearLandUseCommitTimer()
    pendingLandUseDraftRef.current = null
    pendingLandUseCommitRef.current = null
    setHasPendingLandUseEdits(false)
    landUseDraftRef.current = nextLandUseDraft
    setLandUseDraft((previousDraft) =>
      areLandUseDraftsEqual(previousDraft, nextLandUseDraft)
        ? previousDraft
        : nextLandUseDraft
    )

    updateFeatureProperties(nextProperties)
  }

  const handleNameCommit = useCallback(
    (nextName: string) => {
      updateFeatureProperties({ name: nextName })
    },
    [updateFeatureProperties]
  )

  const handleLandUseValueChange =
    (key: LandUseFieldKey) => (nextValue: number | null) => {
      if (nextValue !== null && Number.isNaN(nextValue)) {
        return
      }

      const nextDraft = {
        ...landUseDraftRef.current,
        [key]: nextValue,
      }

      if (areLandUseDraftsEqual(nextDraft, landUseDraftRef.current)) {
        return
      }

      landUseDraftRef.current = nextDraft
      setLandUseDraft(nextDraft)
      scheduleLandUseCommit(nextDraft)
    }

  const handleSoilChangeValueChange = (nextValue: number | null) => {
    if (nextValue !== null && Number.isNaN(nextValue)) {
      return
    }

    const nextDraft = {
      ...landUseDraftRef.current,
      [soilChangeKey]: nextValue,
    }

    if (areLandUseDraftsEqual(nextDraft, landUseDraftRef.current)) {
      return
    }

    landUseDraftRef.current = nextDraft
    setLandUseDraft(nextDraft)
    scheduleLandUseCommit(nextDraft)
  }

  return (
    <Box
      ref={(node) => {
        accordionRefs.current[feature.properties.id] =
          node as HTMLDivElement | null
      }}
      sx={{
        position: 'relative',
        my: expanded ? OPEN_ITEM_MARGIN_Y : 0,
      }}
    >
      {!isItemValid && (
        <Tooltip
          title={landUseDistributionTooltip ?? ''}
          placement="left-start"
          arrow
          disableFocusListener={landUseDistributionTooltip == null}
          disableHoverListener={landUseDistributionTooltip == null}
          disableTouchListener={landUseDistributionTooltip == null}
          enterTouchDelay={0}
          slotProps={warningTooltipSlotProps}
        >
          <Box
            component="span"
            sx={{
              position: 'absolute',
              left: WARNING_ICON_OFFSET_X,
              top: WARNING_ICON_TOP,
              zIndex: 2,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateY(-50%)',
            }}
          >
            <Warning
              sx={{
                width: 10,
                height: 9,
                color: '#D8A500',
                flexShrink: 0,
              }}
            />
          </Box>
        </Tooltip>
      )}

      <Box
        sx={{
          position: 'relative',
          '&::before': expanded
            ? {
                content: '""',
                position: 'absolute',
                top: `-${OPEN_ITEM_MARGIN_Y}`,
                right: {
                  mobile: `-${OPEN_SHELL_OUTSET_X.mobile}`,
                  desktop: `-${OPEN_SHELL_OUTSET_X.desktop}`,
                },
                bottom: `-${OPEN_ITEM_MARGIN_Y}`,
                left: {
                  mobile: `-${OPEN_SHELL_OUTSET_X.mobile}`,
                  desktop: `-${OPEN_SHELL_OUTSET_X.desktop}`,
                },
                border: '1px solid #D6D6D6',
                borderRadius: '0.75rem',
                pointerEvents: 'none',
              }
            : undefined,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            borderTop: expanded ? 'none' : '1px solid #D6D6D6',
            borderBottom: expanded
              ? 'none'
              : isLast
                ? '1px solid #D6D6D6'
                : 'none',
          }}
        >
          <ButtonBase
            type="button"
            onClick={() => onToggle(feature.properties.id)}
            aria-expanded={expanded}
            aria-controls={`zone-panel-${feature.properties.id}`}
            id={`zone-toggle-${feature.properties.id}`}
            disableRipple
            disableTouchRipple
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              px: SUMMARY_ROW_PADDING_X,
              py: '0.375rem',
              justifyContent: 'initial',
              textAlign: 'left',
              ...ACCORDION_BUTTON_RESET_SX,
            }}
          >
            <ZoneClassChip
              code={zoningPresentation.code}
              color={zoningPresentation.color}
            />

            <Box
              sx={{
                minWidth: 0,
                flex: 1,
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
              <ZoneNameField
                label={t('sidebar.plan_settings.areas.rename_label')}
                ariaLabel={`${t('sidebar.plan_settings.areas.rename_label')} ${displayName}`}
                persistedName={persistedName}
                onCommit={handleNameCommit}
              />

              <Box sx={{ mt: '1rem' }}>
                <DropDownSelectWithHeader
                  ariaLabel={`${t('sidebar.plan_settings.areas.change_class_label')} ${displayName}`}
                  label={t('sidebar.plan_settings.areas.change_class_label')}
                  options={zoningCodeOptions}
                  onChange={handleZoningCodeChange}
                  successIndicatorMode="hidden"
                  value={feature.properties.zoning_code ?? ''}
                  sx={{ mb: 0, mr: '-1rem', ml: '-1rem', width: 'auto' }}
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
                    disableRipple
                    disableTouchRipple
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      px: 0,
                      py: '0.125rem',
                      mt: '1rem',
                      textAlign: 'left',
                      ...ACCORDION_BUTTON_RESET_SX,
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
                          mt: '-0.1rem',
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

                    <Box
                      sx={{
                        display: 'inline-flex',
                        flexShrink: 0,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        minWidth: '4.5625rem',
                        minHeight: '1.25rem',
                        px: '0.5rem',
                        border: '1px solid',
                        borderRadius: '999px',
                        boxShadow:
                          'inset 0px 0.5px 1px 0px rgba(255, 255, 255, 0.4)',
                        ...(isLandUseDistributionValid
                          ? LAND_USE_TOTAL_VALID_COLORS
                          : LAND_USE_TOTAL_INVALID_COLORS),
                      }}
                    >
                      <Typography
                        sx={{
                          mt: '0.1rem',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          lineHeight: '0.875rem',
                          letterSpacing: '0.08em',
                          color: 'inherit',
                        }}
                      >
                        {`${percentageFormatter.format(landUseDistributionTotal)} %`}
                      </Typography>

                      {!isLandUseDistributionValid && (
                        <Tooltip
                          title={landUseDistributionTooltip ?? ''}
                          placement="left-start"
                          arrow
                          disableFocusListener={
                            landUseDistributionTooltip == null
                          }
                          disableHoverListener={
                            landUseDistributionTooltip == null
                          }
                          disableTouchListener={
                            landUseDistributionTooltip == null
                          }
                          enterTouchDelay={0}
                          slotProps={warningTooltipSlotProps}
                        >
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Warning
                              sx={{
                                width: 10,
                                height: 9,
                                color: '#8D6A00',
                                flexShrink: 0,
                              }}
                            />
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </ButtonBase>

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
                            value={landUseDraft[field.key]}
                            onValueChange={handleLandUseValueChange(field.key)}
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
                          value={landUseDraft[soilChangeKey]}
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
    </Box>
  )
}

export default memo(ZoneAccordionItem)
