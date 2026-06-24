'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import type {
  PlanDataFeature,
  ZoningClass,
} from 'applets/hiilikartta/common/types'
import ZoneAccordionItem from 'applets/hiilikartta/pages/kaavat/plan/alueet/_components/ZoneAccordionItem'
import { buildZoningCodeSelectOptions } from 'applets/hiilikartta/pages/kaavat/plan/alueet/_components/zoneAreaUtils'

type ZoneAccordionItemProps = React.ComponentProps<typeof ZoneAccordionItem>
type ZoneItemStateConfig = {
  draftLandUseValue?: string
  draftName?: string
  expanded: boolean
  feature: PlanDataFeature
  landUseEditorOpen: boolean
  stateId: string
}

const zoningClasses: ZoningClass[] = [
  {
    name: 'Asuinkerrostalot',
    code: 'AK',
    landuse_built: 55,
    landuse_new_open_vegetation: 20,
    landuse_new_tree_vegetation: 15,
    landuse_existing: 10,
    soil_change_new_vegetation_pct: 35,
  },
  {
    name: 'Puisto',
    code: 'VP',
    landuse_built: 0,
    landuse_new_open_vegetation: 45,
    landuse_new_tree_vegetation: 45,
    landuse_existing: 10,
    soil_change_new_vegetation_pct: 80,
  },
  {
    name: 'Voimajohtoalue',
    code: 'ENs',
    landuse_built: 0,
    landuse_new_open_vegetation: 60,
    landuse_new_tree_vegetation: 25,
    landuse_existing: 15,
    soil_change_new_vegetation_pct: 70,
  },
]

const zoningCodeOptions = buildZoningCodeSelectOptions(zoningClasses)

const baseGeometry: PlanDataFeature['geometry'] = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ],
  ],
}

const createFeature = ({
  id,
  name = 'Area 12',
  zoningCode = 'AK',
  landuseBuilt = 55,
  landuseNewOpenVegetation = 20,
  landuseNewTreeVegetation = 15,
  landuseExisting = 10,
  soilChangeNewVegetationPct = 35,
  hasValidZoningCode = true,
  geometryMode = 'polygon',
}: {
  id: string
  name?: PlanDataFeature['properties']['name']
  zoningCode?: string | null
  landuseBuilt?: number | null
  landuseNewOpenVegetation?: number | null
  landuseNewTreeVegetation?: number | null
  landuseExisting?: number | null
  soilChangeNewVegetationPct?: number | null
  hasValidZoningCode?: boolean
  geometryMode?: PlanDataFeature['properties']['geometry_mode']
}): PlanDataFeature => ({
  type: 'Feature',
  geometry: baseGeometry,
  properties: {
    id,
    name,
    area_ha: 2.64,
    zoning_code: zoningCode,
    geometry_mode: geometryMode,
    landuse_built: landuseBuilt,
    landuse_new_open_vegetation: landuseNewOpenVegetation,
    landuse_new_tree_vegetation: landuseNewTreeVegetation,
    landuse_existing: landuseExisting,
    soil_change_new_vegetation_pct: soilChangeNewVegetationPct,
    extras: {
      hasValidZoningCode,
    },
  },
})

const setNativeInputValue = (input: HTMLInputElement, value: string) => {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value'
  )?.set

  valueSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

const ZoneItemFixtureState = ({
  draftLandUseValue,
  draftName,
  expanded: initialExpanded,
  feature: initialFeature,
  landUseEditorOpen: initialLandUseEditorOpen,
  stateId,
}: ZoneItemStateConfig) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const accordionRefs = React.useRef<Record<string, HTMLDivElement | null>>({})
  const [feature, setFeature] = React.useState(initialFeature)
  const [expanded, setExpanded] = React.useState(initialExpanded)
  const [landUseEditorOpen, setLandUseEditorOpen] = React.useState(
    initialLandUseEditorOpen
  )
  const [hasPendingLandUse, setHasPendingLandUse] = React.useState(false)
  const [draftReady, setDraftReady] = React.useState(
    draftName == null && draftLandUseValue == null
  )

  React.useEffect(() => {
    if (draftName == null && draftLandUseValue == null) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      if (draftName != null) {
        const nameInput =
          rootRef.current?.querySelector<HTMLInputElement>('input[aria-label]')

        if (nameInput) {
          setNativeInputValue(nameInput, draftName)
        }
      }

      if (draftLandUseValue != null) {
        const landUseInput =
          rootRef.current?.querySelector<HTMLInputElement>(
            'input[inputmode="decimal"]'
          )

        if (landUseInput) {
          setNativeInputValue(landUseInput, draftLandUseValue)
        }
      }

      setDraftReady(true)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [draftLandUseValue, draftName])

  const updateFeature =
    React.useCallback<ZoneAccordionItemProps['updateFeature']>(
      (_id, featureUpdate) => {
        setFeature((previousFeature) => ({
          ...previousFeature,
          ...featureUpdate,
          properties: {
            ...previousFeature.properties,
            ...featureUpdate.properties,
          },
        }))
      },
      []
    )

  const handleToggle = React.useCallback<ZoneAccordionItemProps['onToggle']>(
    (featureId) => {
      setExpanded((previousExpanded) =>
        featureId === feature.properties.id ? !previousExpanded : previousExpanded
      )
    },
    [feature.properties.id]
  )

  const handleLandUseEditorToggle = React.useCallback<
    ZoneAccordionItemProps['onLandUseEditorToggle']
  >((_featureId, nextOpen) => {
    setLandUseEditorOpen(nextOpen)
  }, [])

  const handleLandUsePendingChange = React.useCallback<
    ZoneAccordionItemProps['onLandUsePendingChange']
  >((_featureId, hasPending) => {
    setHasPendingLandUse(hasPending)
  }, [])

  return (
    <Box
      ref={rootRef}
      data-pending-land-use={hasPendingLandUse ? 'true' : 'false'}
      data-testid={draftReady ? `zone-item-${stateId}-ready` : undefined}
      sx={{
        width: 330,
        maxWidth: '100%',
        px: '2.5rem',
        py: '1.25rem',
        backgroundColor: '#FFFFFF',
      }}
    >
      <ZoneAccordionItem
        accordionRefs={accordionRefs}
        expanded={expanded}
        feature={feature}
        isLast
        isZoningClassesLoading={false}
        landUseEditorOpen={landUseEditorOpen}
        onLandUsePendingChange={handleLandUsePendingChange}
        onLandUseEditorToggle={handleLandUseEditorToggle}
        onToggle={handleToggle}
        updateFeature={updateFeature}
        zoningClasses={zoningClasses}
        zoningCodeOptions={zoningCodeOptions}
      />
    </Box>
  )
}

const createState = (config: ZoneItemStateConfig) => ({
  id: config.stateId,
  label: config.stateId
    .split('-')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' '),
  description: `Zone accordion item fixture state: ${config.stateId}.`,
  waitFor: `[data-testid="zone-item-${config.stateId}-ready"]`,
  render: () => <ZoneItemFixtureState {...config} />,
})

export const hiilikarttaZoneAccordionItemFixture: ComponentFixture = {
  id: 'hiilikartta-zone-accordion-item',
  label: 'Hiilikartta zone accordion item',
  description:
    'Zone accordion item states for the Hiilikartta area land-use editor migration.',
  sourceGlobs: [
    'src/applets/hiilikartta/pages/kaavat/plan/alueet/_components/ZoneAccordionItem.tsx',
    'src/applets/hiilikartta/pages/kaavat/plan/alueet/_components/ZoneClassChip.tsx',
    'src/applets/hiilikartta/pages/kaavat/plan/alueet/_components/zoneAreaUtils.ts',
    'src/common/component-fixtures/fixtures/HiilikarttaZoneAccordionItemFixture.tsx',
  ],
  states: [
    createState({
      stateId: 'collapsed',
      expanded: false,
      landUseEditorOpen: false,
      feature: createFeature({ id: 'fixture-collapsed' }),
    }),
    createState({
      stateId: 'expanded',
      expanded: true,
      landUseEditorOpen: false,
      feature: createFeature({ id: 'fixture-expanded' }),
    }),
    createState({
      stateId: 'invalid-zoning-code',
      expanded: true,
      landUseEditorOpen: false,
      feature: createFeature({
        id: 'fixture-invalid-zoning',
        zoningCode: 'LEGACY-X',
        hasValidZoningCode: false,
      }),
    }),
    createState({
      stateId: 'invalid-land-use-warning',
      expanded: true,
      landUseEditorOpen: true,
      feature: createFeature({
        id: 'fixture-invalid-land-use',
        landuseBuilt: 45,
        landuseNewOpenVegetation: 20,
        landuseNewTreeVegetation: 15,
        landuseExisting: 5,
      }),
    }),
    createState({
      stateId: 'land-use-editor-closed',
      expanded: true,
      landUseEditorOpen: false,
      feature: createFeature({ id: 'fixture-editor-closed' }),
    }),
    createState({
      stateId: 'land-use-editor-open',
      expanded: true,
      landUseEditorOpen: true,
      feature: createFeature({ id: 'fixture-editor-open' }),
    }),
    createState({
      stateId: 'changed-zone-name',
      expanded: true,
      landUseEditorOpen: false,
      draftName: 'Draft area name',
      feature: createFeature({
        id: 'fixture-changed-name',
        name: 'Original area name',
      }),
    }),
    createState({
      stateId: 'changed-land-use-number',
      expanded: true,
      landUseEditorOpen: true,
      draftLandUseValue: '67',
      feature: createFeature({
        id: 'fixture-changed-land-use',
        landuseBuilt: 55,
      }),
    }),
    createState({
      stateId: 'powerline-zone',
      expanded: true,
      landUseEditorOpen: true,
      feature: createFeature({
        id: 'fixture-powerline',
        name: 'Powerline corridor',
        zoningCode: 'ENs',
        landuseBuilt: 0,
        landuseNewOpenVegetation: 60,
        landuseNewTreeVegetation: 25,
        landuseExisting: 15,
        soilChangeNewVegetationPct: 70,
        geometryMode: 'corridor',
      }),
    }),
    createState({
      stateId: 'long-name',
      expanded: true,
      landUseEditorOpen: false,
      feature: createFeature({
        id: 'fixture-long-name',
        name: 'Very long planned area name that should truncate in the summary row and remain usable in the editor',
      }),
    }),
  ],
}
