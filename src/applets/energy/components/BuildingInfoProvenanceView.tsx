import React from 'react'

import { Box } from '#/common/style/theme'
import { Button } from '#/components/common/Button'
import TText from '#/components/common/TText'
import { Cross } from '#/components/icons'
import type {
  EnergymapBuildingInfoProvenanceSummary,
  EnergymapBuildingInfoProvenanceSummaryInput,
  EnergymapBuildingInfoProvenanceSummaryItem,
  EnergymapBuildingInfoProvenanceSummaryMetadata,
  EnergymapBuildingInfoProvenanceSummaryResult,
} from '../common/buildingInfoProvenanceSummary'

const TRANSLATION_NAMESPACE = 'energiakartta'
const VIEW_TRANSLATION_PREFIX = 'sidebar.building_info.provenance.view'
const BuildingInfoProvenanceLocaleContext = React.createContext<
  string | undefined
>(undefined)

const BuildingInfoProvenanceText = ({ keyName }: { keyName: string }) => {
  const language = React.useContext(BuildingInfoProvenanceLocaleContext)

  return (
    <TText keyName={keyName} ns={TRANSLATION_NAMESPACE} language={language} />
  )
}

type Descriptor = {
  id: string
  key: string
}

type ProvenanceRegistries = {
  categories: ReadonlyMap<string, Descriptor>
  sources: ReadonlyMap<string, Descriptor>
  providers: ReadonlyMap<string, Descriptor>
  calculations: ReadonlyMap<string, Descriptor>
  inputs: ReadonlyMap<string, EnergymapBuildingInfoProvenanceSummaryInput>
}

type RelationshipProps = {
  labelKey: string
  children: React.ReactNode
}

const BuildingInfoProvenanceRelationship = ({
  labelKey,
  children,
}: RelationshipProps) => (
  <Box component="div" sx={{ minWidth: 0 }}>
    <Box
      component="dt"
      sx={{
        m: 0,
        color: 'neutral.darker',
        fontSize: '0.75rem',
        fontWeight: 700,
        lineHeight: 1.35,
      }}
    >
      <BuildingInfoProvenanceText keyName={labelKey} />
    </Box>
    <Box
      component="dd"
      sx={{
        m: 0,
        mt: '0.25rem',
        color: '#111111',
        fontSize: '0.8125rem',
        lineHeight: 1.45,
        overflowWrap: 'anywhere',
      }}
    >
      {children}
    </Box>
  </Box>
)

const DescriptorList = ({
  descriptors,
}: {
  descriptors: readonly Descriptor[]
}) => (
  <Box
    component="ul"
    sx={{
      m: 0,
      pl: '1.125rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}
  >
    {descriptors.map((descriptor) => (
      <li key={descriptor.id}>
        <BuildingInfoProvenanceText keyName={descriptor.key} />
      </li>
    ))}
  </Box>
)

const ProvenanceInputList = ({
  inputs,
}: {
  inputs: readonly EnergymapBuildingInfoProvenanceSummaryInput[]
}) => (
  <Box
    component="ul"
    sx={{
      m: 0,
      pl: '1.125rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}
  >
    {inputs.map((input) => (
      <li key={input.id}>
        <BuildingInfoProvenanceText keyName={input.labelKey} />
        {input.value != null && (
          <Box component="span">
            {`: ${input.value}${input.unit == null ? '' : ` ${input.unit}`}`}
          </Box>
        )}
      </li>
    ))}
  </Box>
)

const ProvenanceMetadataList = ({
  metadata,
}: {
  metadata: readonly EnergymapBuildingInfoProvenanceSummaryMetadata[]
}) => (
  <Box
    component="ul"
    sx={{
      m: 0,
      pl: '1.125rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    }}
  >
    {metadata.map((descriptor, index) => (
      <li key={`${descriptor.id}:${descriptor.value ?? ''}:${index}`}>
        <BuildingInfoProvenanceText keyName={descriptor.key} />
        {descriptor.value != null && `: ${descriptor.value}`}
      </li>
    ))}
  </Box>
)

const getDescriptors = <T,>({
  ids,
  registry,
}: {
  ids: readonly string[]
  registry: ReadonlyMap<string, T>
}) =>
  ids.flatMap((id) => {
    const descriptor = registry.get(id)
    return descriptor == null ? [] : [descriptor]
  })

const getSupportingDescriptors = <T extends Descriptor>({
  ids,
  directIds,
  registry,
}: {
  ids: readonly string[]
  directIds: readonly string[]
  registry: ReadonlyMap<string, T>
}) => {
  const directIdSet = new Set(directIds)

  return getDescriptors({
    ids: ids.filter((id) => !directIdSet.has(id)),
    registry,
  })
}

const BuildingInfoProvenanceItem = ({
  item,
  summary,
  registries,
}: {
  item: EnergymapBuildingInfoProvenanceSummaryItem
  summary: EnergymapBuildingInfoProvenanceSummary
  registries: ProvenanceRegistries
}) => {
  const category = registries.categories.get(item.categoryId)
  const directSources = getDescriptors({
    ids: item.valueSourceIds,
    registry: registries.sources,
  })
  const supportingSources = getSupportingDescriptors({
    ids: item.sourceIds,
    directIds: item.valueSourceIds,
    registry: registries.sources,
  })
  const directProviders = getDescriptors({
    ids: item.valueProviderIds,
    registry: registries.providers,
  })
  const supportingProviders = getSupportingDescriptors({
    ids: item.providerIds,
    directIds: item.valueProviderIds,
    registry: registries.providers,
  })
  const directCalculations = getDescriptors({
    ids: item.valueCalculationIds,
    registry: registries.calculations,
  })
  const supportingCalculations = getSupportingDescriptors({
    ids: item.calculationIds,
    directIds: item.valueCalculationIds,
    registry: registries.calculations,
  })
  const selectedEvidence = getDescriptors({
    ids: item.selectedEvidenceInputIds,
    registry: registries.inputs,
  })
  const documentedMethod = getDescriptors({
    ids: item.documentedMethodInputIds,
    registry: registries.inputs,
  })
  const metadata = summary.metadata.filter(({ itemIds }) =>
    itemIds.includes(item.id)
  )
  const relationships: Array<{
    id: string
    labelKey: string
    content: React.ReactNode
  }> = []

  if (category != null) {
    relationships.push({
      id: 'category',
      labelKey: `${VIEW_TRANSLATION_PREFIX}.category`,
      content: <BuildingInfoProvenanceText keyName={category.key} />,
    })
  }

  const descriptorGroups = [
    {
      id: 'direct-sources',
      label: 'direct_sources',
      descriptors: directSources,
    },
    {
      id: 'supporting-sources',
      label: 'supporting_sources',
      descriptors: supportingSources,
    },
    {
      id: 'direct-providers',
      label: 'direct_providers',
      descriptors: directProviders,
    },
    {
      id: 'supporting-providers',
      label: 'supporting_providers',
      descriptors: supportingProviders,
    },
    {
      id: 'direct-calculations',
      label: 'direct_calculations',
      descriptors: directCalculations,
    },
    {
      id: 'supporting-calculations',
      label: 'supporting_calculations',
      descriptors: supportingCalculations,
    },
  ]

  descriptorGroups.forEach(({ id, label, descriptors }) => {
    if (descriptors.length > 0) {
      relationships.push({
        id,
        labelKey: `${VIEW_TRANSLATION_PREFIX}.${label}`,
        content: <DescriptorList descriptors={descriptors} />,
      })
    }
  })

  const inputGroups = [
    {
      id: 'selected-evidence',
      label: 'selected_evidence',
      inputs: selectedEvidence,
    },
    {
      id: 'documented-method',
      label: 'documented_method',
      inputs: documentedMethod,
    },
  ]

  inputGroups.forEach(({ id, label, inputs }) => {
    if (inputs.length > 0) {
      relationships.push({
        id,
        labelKey: `${VIEW_TRANSLATION_PREFIX}.${label}`,
        content: <ProvenanceInputList inputs={inputs} />,
      })
    }
  })

  if (metadata.length > 0) {
    relationships.push({
      id: 'metadata',
      labelKey: `${VIEW_TRANSLATION_PREFIX}.metadata`,
      content: <ProvenanceMetadataList metadata={metadata} />,
    })
  }

  return (
    <Box
      component="li"
      data-testid="building-info-provenance-item"
      data-provenance-item-id={item.id}
      sx={{
        m: 0,
        p: { mobile: '1rem', desktop: '1.25rem' },
        minWidth: 0,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(17, 17, 17, 0.1)',
        borderRadius: '0.75rem',
      }}
    >
      <Box
        component="h3"
        sx={{
          m: 0,
          color: '#111111',
          fontSize: '1rem',
          fontWeight: 700,
          lineHeight: 1.35,
          overflowWrap: 'anywhere',
        }}
      >
        <BuildingInfoProvenanceText keyName={item.fieldKey} />
      </Box>
      <Box
        component="dl"
        sx={{
          m: 0,
          mt: '0.875rem',
          display: 'grid',
          gap: '0.875rem',
        }}
      >
        {relationships.map((relationship) => (
          <BuildingInfoProvenanceRelationship
            key={relationship.id}
            labelKey={relationship.labelKey}
          >
            {relationship.content}
          </BuildingInfoProvenanceRelationship>
        ))}
      </Box>
    </Box>
  )
}

const BuildingInfoResolvedProvenanceList = ({
  summary,
}: {
  summary: EnergymapBuildingInfoProvenanceSummary
}) => {
  const registries = React.useMemo(
    () => ({
      categories: new Map(summary.categories.map((entry) => [entry.id, entry])),
      sources: new Map(summary.sources.map((entry) => [entry.id, entry])),
      providers: new Map(summary.providers.map((entry) => [entry.id, entry])),
      calculations: new Map(
        summary.calculations.map((entry) => [entry.id, entry])
      ),
      inputs: new Map(summary.inputs.map((entry) => [entry.id, entry])),
    }),
    [summary]
  )

  return (
    <Box
      component="ul"
      sx={{
        m: 0,
        p: 0,
        listStyle: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
      }}
    >
      {summary.items.map((item) => (
        <BuildingInfoProvenanceItem
          key={item.id}
          item={item}
          summary={summary}
          registries={registries}
        />
      ))}
    </Box>
  )
}

export type BuildingInfoProvenanceViewProps = {
  result: EnergymapBuildingInfoProvenanceSummaryResult | null
  regionId: string
  headingId: string
  headingRef: React.Ref<HTMLHeadingElement>
  forceMobileLayout?: boolean
  onClose: () => void
}

export const BuildingInfoProvenanceView = ({
  result,
  regionId,
  headingId,
  headingRef,
  forceMobileLayout = false,
  onClose,
}: BuildingInfoProvenanceViewProps) => {
  const isResolved = result?.status === 'resolved'
  const locale = isResolved ? result.summary.locale : result?.locale

  return (
    <BuildingInfoProvenanceLocaleContext.Provider value={locale}>
      <Box
        component="section"
        role="region"
        id={regionId}
        aria-labelledby={headingId}
        data-testid="building-info-provenance-view"
        data-summary-status={isResolved ? 'resolved' : 'contractFailure'}
        data-summary-locale={locale}
        sx={{
          minWidth: 0,
          px: { mobile: '1rem', desktop: '1.5rem' },
          pt: forceMobileLayout
            ? '1rem'
            : { mobile: '1rem', desktop: '6.25rem' },
          pb: { mobile: '1rem', desktop: '1.5rem' },
          backgroundColor: '#f9f9f9',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            mb: '1rem',
          }}
        >
          <Box
            component="h2"
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            data-testid="building-info-provenance-heading"
            sx={{
              m: 0,
              flex: '1 1 12rem',
              minWidth: 0,
              color: '#111111',
              fontSize: { mobile: '1.25rem', desktop: '1.5rem' },
              fontWeight: 700,
              lineHeight: 1.25,
              '&:focus-visible': {
                outline: '2px solid currentColor',
                outlineOffset: '3px',
              },
            }}
          >
            <BuildingInfoProvenanceText
              keyName={`${VIEW_TRANSLATION_PREFIX}.heading`}
            />
          </Box>
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={
              <Cross aria-hidden="true" sx={{ width: 14, height: 14 }} />
            }
            onClick={onClose}
            sx={{ maxWidth: '100%', flexShrink: 0 }}
          >
            <BuildingInfoProvenanceText
              keyName={`${VIEW_TRANSLATION_PREFIX}.close`}
            />
          </Button>
        </Box>
        {isResolved ? (
          <BuildingInfoResolvedProvenanceList summary={result.summary} />
        ) : (
          <Box
            data-testid="building-info-provenance-contract-failure"
            sx={{
              p: '1rem',
              color: '#111111',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(17, 17, 17, 0.1)',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            <BuildingInfoProvenanceText
              keyName={`${VIEW_TRANSLATION_PREFIX}.integration_unavailable`}
            />
          </Box>
        )}
      </Box>
    </BuildingInfoProvenanceLocaleContext.Provider>
  )
}
