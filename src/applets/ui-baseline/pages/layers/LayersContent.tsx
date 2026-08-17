import { useState } from 'react'

import type { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { Box } from '#/common/style/theme'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import {
  LayerToggleRow,
  LayerToggleRowAccordion,
  LayerToggleRowLink,
} from '#/components/common/LayerToggleRow'

import {
  BaselineExample,
  BaselineSection,
  noop,
} from '../BaselineContent'

const LAYER_ROW_STACK_SX = {
  width: '100%',
  maxWidth: '24rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
}

const MOCK_ACCORDION_CONTENT_SX = {
  pt: '1rem',
  mx: '2rem',
  maxWidth: '15.875rem',
}

const MOCK_ACCORDION_TEXT_SX = {
  m: 0,
  color: '#111111',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

const LAYER_LEGEND_SWATCHES = [
  { label: 'A', color: '#7FD13B' },
  { label: 'B', color: '#F8DF43' },
  { label: 'C', color: '#F89443' },
]

type LayerControlRowExample = {
  label: string
  status: LayerGroupStatus
  color?: string
  disabled?: boolean
}

const LAYER_CONTROL_ROWS: readonly LayerControlRowExample[] = [
  {
    label: 'Hidden layer',
    status: 'hidden',
  },
  {
    label: 'Visible layer',
    status: 'visible',
  },
  {
    label: 'Colored visible layer',
    status: 'visible',
    color: '#2C8E74',
  },
  {
    label: 'Loading layer',
    status: 'processing',
  },
  {
    label: 'Disabled layer',
    status: 'hidden',
    disabled: true,
  },
]

const MockAccordionPreviewContent = () => (
  <Box sx={MOCK_ACCORDION_CONTENT_SX}>
    <Box
      component="ul"
      aria-label="Mock category preview"
      sx={{
        m: 0,
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        listStyle: 'none',
      }}
    >
      {LAYER_LEGEND_SWATCHES.map(({ label, color }) => (
        <Box
          component="li"
          key={label}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1.5rem minmax(0, 1fr)',
            alignItems: 'center',
            columnGap: '0.75rem',
          }}
        >
          <Box
            component="span"
            aria-hidden="true"
            sx={{
              width: '1.5rem',
              height: '1.5rem',
              borderRadius: '50%',
              backgroundColor: color,
              color: '#111111',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: 0,
            }}
          >
            {label}
          </Box>
          <Box component="p" sx={MOCK_ACCORDION_TEXT_SX}>
            Mock category {label}
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
)

const PlainLayerRowsExample = () => (
  <Box sx={LAYER_ROW_STACK_SX}>
    {LAYER_CONTROL_ROWS.map(({ label, status, color, disabled }) => (
      <LayerToggleRow
        key={label}
        label={label}
        status={status}
        disabled={disabled}
        color={color}
        onToggle={noop}
        ariaLabel={`Toggle ${label}`}
      />
    ))}
  </Box>
)

const CustomAccordionRowsExample = () => {
  const [interactiveExpanded, setInteractiveExpanded] = useState(false)

  return (
    <Box sx={LAYER_ROW_STACK_SX}>
      <LayerToggleRowAccordion
        label="Closed custom layer"
        status="hidden"
        expanded={false}
        onToggle={noop}
        ariaLabel="Toggle closed custom layer"
      >
        <MockAccordionPreviewContent />
      </LayerToggleRowAccordion>
      <LayerToggleRowAccordion
        label="Open custom layer"
        status="visible"
        expanded
        onToggle={noop}
        ariaLabel="Toggle open custom layer"
      >
        <MockAccordionPreviewContent />
      </LayerToggleRowAccordion>
      <LayerToggleRowAccordion
        label="Interactive custom layer"
        status={interactiveExpanded ? 'visible' : 'hidden'}
        expanded={interactiveExpanded}
        onToggle={() => setInteractiveExpanded((value) => !value)}
        ariaLabel="Toggle interactive custom layer"
      >
        <MockAccordionPreviewContent />
      </LayerToggleRowAccordion>
    </Box>
  )
}

const LayerRowVariantComparison = () => {
  const [isBaseVisible, setIsBaseVisible] = useState(true)
  const [isAdminVisible, setIsAdminVisible] = useState(true)

  return (
    <Box sx={LAYER_ROW_STACK_SX}>
      <LayerToggleRow
        label="Base visibility row"
        status={isBaseVisible ? 'visible' : 'hidden'}
        color="#2C8E74"
        onToggle={() => setIsBaseVisible((value) => !value)}
        ariaLabel="Toggle base visibility comparison layer"
      />
      <LayerToggleRowAccordion
        label="Custom accordion row"
        status="visible"
        expanded
        onToggle={noop}
        ariaLabel="Toggle custom accordion comparison layer"
      >
        <Box sx={MOCK_ACCORDION_CONTENT_SX}>
          <Box component="p" sx={MOCK_ACCORDION_TEXT_SX}>
            Mock category A
          </Box>
        </Box>
      </LayerToggleRowAccordion>
      <LayerToggleRowLink
        label="Admin link row"
        status={isAdminVisible ? 'visible' : 'hidden'}
        color="#2C8E74"
        onToggle={() => setIsAdminVisible((value) => !value)}
        ariaLabel="Toggle admin link comparison layer"
        linkAriaLabel="Open admin link comparison layer"
        linkProps={{
          routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
          routeParams: { folayerIdSlug: 'mock-visible-layer' },
          onClick: (event) => event.preventDefault(),
        }}
      />
    </Box>
  )
}

const LayersContent = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.75rem',
      pb: { mobile: '5rem', desktop: 0 },
    }}
  >
    <BaselineSection title="Plain layer rows">
      <BaselineExample title="LayerToggleRow states">
        <PlainLayerRowsExample />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="Custom accordion rows">
      <BaselineExample title="Closed, open, and interactive">
        <CustomAccordionRowsExample />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="Layer row variants">
      <BaselineExample title="Aligned base, accordion, and link rows">
        <LayerRowVariantComparison />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

export default LayersContent
