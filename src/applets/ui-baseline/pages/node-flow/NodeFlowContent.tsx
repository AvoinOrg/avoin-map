import { Box } from '#/common/style/theme'
import {
  NodeFlowAccordion,
  NodeFlowButton,
  NodeFlowContainer,
} from '#/components/common/NodeFlow'

import { BaselineSection, noop } from '../BaselineContent'

const NodeFlowContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Connected NodeFlow sequence">
      <NodeFlowContainer>
        <NodeFlowAccordion
          title="Import source data"
          status="complete"
          helper="Source data is ready."
          defaultOpen
          ariaLabel="Import source data"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              fontSize: '0.75rem',
              lineHeight: 1.45,
              color: '#111111',
            }}
          >
            <Box>Input file: harbor-plan.gpkg</Box>
            <Box>Detected layers: zoning areas and area names</Box>
          </Box>
        </NodeFlowAccordion>
        <NodeFlowButton status="complete" title="Configure scenario" />
        <NodeFlowButton
          title="Review planning areas"
          helper="Open the area list to inspect imported boundaries."
          onClick={noop}
        />
        <NodeFlowButton
          status="error"
          title="Calculate report"
          helper="Emission factors are missing for one area."
          onClick={noop}
        />
        <NodeFlowButton
          disabled
          title="Publish result"
          helper="Resolve calculation errors before publishing."
          onClick={noop}
        />
      </NodeFlowContainer>
    </BaselineSection>
  </Box>
)

export default NodeFlowContent
