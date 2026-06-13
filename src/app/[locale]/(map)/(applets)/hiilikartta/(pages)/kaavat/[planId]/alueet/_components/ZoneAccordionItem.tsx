import {
  type ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'
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
import Hint from '../../_components/Hint'
import {
  getLandUseDistributionTotal,
  type ZoneClassSelectOption,
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
  zoningCodeOptions: ZoneClassSelectOption[]
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
const OPEN_SHELL_OUTSET_X = { mobile: '1.5rem', desktop: '1.5rem' } as const
const WARNING_ICON_OFFSET_X = "-1rem" as const
const WARNING_ICON_TOP = '1.05rem'
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
const ACCORDION_TRIGGER_SX = {
  m: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  '&:active': {
    backgroundColor: 'transparent',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(17,17,17,0.4)',
    outlineOffset: '2px',
  },
} as const

const numberFieldInputSx = {
  width: NUMBER_FIELD_WIDTH,
  minHeight: '1.5rem',
  height: '1.5rem',
  borderRadius: '999px',
  backgroundColor: '#FFFFFF',
  boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  px: '0.625rem',
  py: '0.125rem',
  fontSize: '0.6875rem',
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  textAlign: 'center',
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

const warningHintPopupSx = {
  px: '1rem',
  py: '0.875rem',
  borderRadius: '0.3125rem',
  backgroundColor: '#454545',
  boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.22)',
} as const

const ZoneClassSelectOptionContent = ({
  option,
}: {
  option: ZoneClassSelectOption
}) => {
  return (
    <Box
      component="span"
      styleProps={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: 0,
      }}
    >
      <ZoneClassChip
        code={option.code}
        color={option.color}
        styleProps={{ flexShrink: 0, pt: '0.1rem' }}
      />

      <Box
        component="span"
        styleProps={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '0.6875rem',
          fontWeight: 400,
          lineHeight: 'normal',
          letterSpacing: '0.04em',
          color: '#111111',
        }}
      >
        {option.label}
      </Box>
    </Box>
  )
}

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

    return (
      <TextFieldWithLabel
        label={label}
        ariaLabel={ariaLabel}
        value={nameDraft}
        onChange={handleNameChange}
        onFocus={handleNameFocus}
        onBlur={handleNameBlur}
        styleProps={{ mt: 1.5, mr: '-1rem', ml: '-1rem', width: 'auto' }}
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
  const landUseDistributionHint = !isLandUseDistributionValid ? (
    <Box
      component="p"
      styleProps={{
        m: 0,
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
    </Box>
  ) : null

  const handleZoningCodeChange = (event: FormSelectionEvent<string>) => {
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

  const renderZoningCodeOption = useCallback(
    (option: { value: string }) => {
      const zoningCodeOption = zoningCodeOptions.find(
        (currentOption) => currentOption.value === option.value
      )

      if (!zoningCodeOption) {
        return option.value
      }

      return <ZoneClassSelectOptionContent option={zoningCodeOption} />
    },
    [zoningCodeOptions]
  )

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
      styleProps={{
        position: 'relative',
        my: expanded ? OPEN_ITEM_MARGIN_Y : 0,
      }}
    >
      {!isItemValid && (
        <Hint
          title={landUseDistributionHint ?? ''}
          side="left"
          align="start"
          disabled={landUseDistributionHint == null}
          sideOffset={8}
          popupSx={warningHintPopupSx}
        >
          <Box
            component="span"
            styleProps={{
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
              styleProps={{
                width: 16,
                height: 15,
                color: '#D8A500',
                flexShrink: 0,
              }}
            />
          </Box>
        </Hint>
      )}

      <Box
        styleProps={{
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
          styleProps={{
            position: 'relative',
            borderTop: expanded ? 'none' : '1px solid #D6D6D6',
            borderBottom: expanded
              ? 'none'
              : isLast
                ? '1px solid #D6D6D6'
                : 'none',
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => onToggle(feature.properties.id)}
            aria-expanded={expanded}
            aria-controls={`zone-panel-${feature.properties.id}`}
            id={`zone-toggle-${feature.properties.id}`}
            styleProps={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              px: SUMMARY_ROW_PADDING_X,
              py: '0.375rem',
              justifyContent: 'initial',
              textAlign: 'left',
              ...ACCORDION_TRIGGER_SX,
            }}
          >
            <ZoneClassChip
              code={zoningPresentation.code}
              color={zoningPresentation.color}
              styleProps={{ pt: '0.2rem' }}
            />

            <Box
              styleProps={{
                minWidth: 0,
                flex: 1,
                overflow: 'hidden',
              }}
            >
              <Box
                component="span"
                styleProps={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  lineHeight: '1.125rem',
                  letterSpacing: '0.18em',
                  mt: '0.15rem',
                  color: '#111111',
                }}
              >
                {displayName}
              </Box>
            </Box>

            <ArrowDown
              styleProps={{
                width: 12,
                height: 8,
                color: '#111111',
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 160ms ease',
              }}
            />
          </Box>

          <BaseCollapsible.Root open={expanded}>
            <BaseCollapsible.Panel
              keepMounted={false}
              id={`zone-panel-${feature.properties.id}`}
              role="region"
              aria-labelledby={`zone-toggle-${feature.properties.id}`}
            >
              <Box
                styleProps={{
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

                <Box styleProps={{ mt: '1rem' }}>
                  <DropDownSelectWithHeader
                    ariaLabel={`${t('sidebar.plan_settings.areas.change_class_label')} ${displayName}`}
                    label={t('sidebar.plan_settings.areas.change_class_label')}
                    options={zoningCodeOptions}
                    onChange={handleZoningCodeChange}
                    renderOption={renderZoningCodeOption}
                    renderSelectedValue={(selectedOption, selectedValue) => {
                      if (!selectedOption) {
                        return selectedValue
                      }

                      return renderZoningCodeOption(selectedOption)
                    }}
                    successIndicatorMode="hidden"
                    value={feature.properties.zoning_code ?? ''}
                    styleProps={{ mb: 0, mr: '-1rem', ml: '-1rem', width: 'auto' }}
                    labelSx={FIELD_LABEL_SX}
                    selectSx={{
                      minHeight: '1.375rem',
                      height: '1.375rem',
                      borderRadius: '0.625rem',
                      backgroundColor: '#FFFFFF',
                      boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
                      py: '0.1875rem',
                      pl: '0.75rem',
                      pr: '0.875rem',
                      fontSize: '0.6875rem',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      letterSpacing: '0.04em',
                      color: '#111111',
                    }}
                    iconSx={{
                      width: '0.75rem',
                      height: '0.375rem',
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
                    styleProps={{
                      mt: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <Box
                      component="button"
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
                      styleProps={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        px: 0,
                        py: '0.125rem',
                        mt: '1rem',
                        textAlign: 'left',
                        ...ACCORDION_TRIGGER_SX,
                      }}
                    >
                      <Box
                        styleProps={{
                          display: 'flex',
                          minWidth: 0,
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <ArrowDown
                          styleProps={{
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

                        <Box
                          component="span"
                          styleProps={{
                            ...FIELD_LABEL_SX,
                            mb: 0,
                          }}
                        >
                          {t(
                            'sidebar.plan_settings.zones.land_use_distribution'
                          )}
                        </Box>
                      </Box>

                      <Box
                        styleProps={{
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
                        <Box
                          component="span"
                          styleProps={{
                            mt: '0.1rem',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            lineHeight: '0.875rem',
                            letterSpacing: '0.08em',
                            color: 'inherit',
                          }}
                        >
                          {`${percentageFormatter.format(landUseDistributionTotal)} %`}
                        </Box>

                        {!isLandUseDistributionValid && (
                          <Hint
                            title={landUseDistributionHint ?? ''}
                            side="left"
                            align="start"
                            disabled={landUseDistributionHint == null}
                            sideOffset={8}
                            popupSx={warningHintPopupSx}
                          >
                            <Box
                              component="span"
                              styleProps={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Warning
                                styleProps={{
                                  width: 10,
                                  height: 9,
                                  color: '#8D6A00',
                                  flexShrink: 0,
                                }}
                              />
                            </Box>
                          </Hint>
                        )}
                      </Box>
                    </Box>

                    <BaseCollapsible.Root open={landUseEditorOpen}>
                      <BaseCollapsible.Panel keepMounted={false}>
                        <Box
                          styleProps={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.875rem',
                            pt: '0.25rem',
                          }}
                        >
                          {landUseFields.map((field) => (
                            <Box
                              key={field.key}
                              styleProps={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                              }}
                            >
                              <Box
                                component="span"
                                styleProps={{
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
                              </Box>

                              <NumberInputField
                                size="small"
                                value={landUseDraft[field.key]}
                                onValueChange={handleLandUseValueChange(
                                  field.key
                                )}
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
                            styleProps={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.75rem',
                              pt: '0.75rem',
                            }}
                          >
                            <Box
                              component="span"
                              styleProps={{
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
                            </Box>

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
                      </BaseCollapsible.Panel>
                    </BaseCollapsible.Root>
                  </Box>
                )}
              </Box>
            </BaseCollapsible.Panel>
          </BaseCollapsible.Root>
        </Box>
      </Box>
    </Box>
  )
}

export default memo(ZoneAccordionItem)
