import React from 'react'

import { Box } from '#/common/style/theme'
import FlowNode from '#/components/common/FlowNode'
import {
  NodeFlowAccordion,
  NodeFlowButton,
  NodeFlowContainer,
} from '#/components/common/NodeFlow'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const noop = () => {}

const FlowStepFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      maxWidth: '100%',
      p: 2,
      backgroundColor: '#ffffff',
    }}
  >
    {children}
  </Box>
)

const AccordionBody = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      fontSize: '0.75rem',
      lineHeight: 1.45,
      color: '#27352f',
    }}
  >
    <Box>Input file: harbor-plan.gpkg</Box>
    <Box>Detected layers: zoning areas and area names</Box>
  </Box>
)

export const flowStepPrimitivesFixture: ComponentFixture = {
  id: 'flow-step-primitives',
  label: 'Flow step primitives',
  description: 'Shared flow and step primitive states.',
  sourceGlobs: [
    'src/components/common/FlowNode.tsx',
    'src/components/common/NodeFlow/NodeFlowButton.tsx',
    'src/components/common/NodeFlow/NodeFlowAccordion.tsx',
    'src/components/common/NodeFlow/NodeFlowContainer.tsx',
    'src/components/common/NodeFlow/index.ts',
    'src/common/component-fixtures/fixtures/FlowStepPrimitivesFixture.tsx',
  ],
  wrapper: FlowStepFixtureWrapper,
  states: [
    {
      id: 'node-flow-incomplete',
      label: 'NodeFlow incomplete',
      description: 'Incomplete step with default marker and trailing icon.',
      render: () => <NodeFlowButton title="Source data" />,
    },
    {
      id: 'node-flow-complete',
      label: 'NodeFlow complete',
      description: 'Completed step with check marker.',
      render: () => <NodeFlowButton status="complete" title="Inputs checked" />,
    },
    {
      id: 'node-flow-error',
      label: 'NodeFlow error',
      description: 'Error step with helper text.',
      render: () => (
        <NodeFlowButton
          status="error"
          title="Emission factors"
          helper="Review the missing emission values."
        />
      ),
    },
    {
      id: 'node-flow-disabled',
      label: 'NodeFlow disabled',
      description: 'Disabled row is inert and visually muted.',
      render: () => (
        <NodeFlowButton
          disabled
          title="Export report"
          helper="Complete required steps first."
          onClick={noop}
        />
      ),
    },
    {
      id: 'node-flow-interactive',
      label: 'NodeFlow interactive',
      description: 'Interactive row with button semantics.',
      render: () => (
        <NodeFlowButton title="Open assumptions" onClick={noop} />
      ),
    },
    {
      id: 'node-flow-helper',
      label: 'NodeFlow helper',
      description: 'Helper row with custom leading helper content.',
      render: () => (
        <NodeFlowButton
          title="Scenario setup"
          helper="Optional assumptions can be edited later."
          helperLeading={
            <Box
              aria-hidden="true"
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: 'currentColor',
              }}
            />
          }
        />
      ),
    },
    {
      id: 'node-flow-connected-sequence',
      label: 'NodeFlow connected sequence',
      description:
        'Container draws connectors through accordion and button marker centers.',
      canvasSx: {
        minHeight: 360,
      },
      render: () => (
        <NodeFlowContainer>
          <NodeFlowAccordion
            title="Import source data"
            status="complete"
            helper="Source data is ready."
            defaultOpen
          >
            <AccordionBody />
          </NodeFlowAccordion>
          <NodeFlowButton status="complete" title="Configure scenario" />
          <NodeFlowButton
            title="Review planning areas"
            helper="Open the area list to inspect imported boundaries."
            onClick={noop}
          />
          <NodeFlowButton disabled title="Publish result" />
        </NodeFlowContainer>
      ),
    },
    {
      id: 'node-flow-accordion-closed',
      label: 'NodeFlow accordion closed',
      description:
        'Closed accordion header with helper text aligned to the flow rail.',
      render: () => (
        <NodeFlowAccordion
          title="Import source data"
          status="complete"
          helper="Source data is ready."
          defaultOpen={false}
        >
          <AccordionBody />
        </NodeFlowAccordion>
      ),
    },
    {
      id: 'node-flow-accordion-open',
      label: 'NodeFlow accordion open',
      description:
        'Open accordion header and body with the same rail alignment as closed.',
      render: () => (
        <NodeFlowAccordion
          title="Import source data"
          status="complete"
          helper="Source data is ready."
          defaultOpen
        >
          <AccordionBody />
        </NodeFlowAccordion>
      ),
    },
    {
      id: 'flow-node-available',
      label: 'FlowNode available',
      description: 'Available FlowNode row with description text.',
      render: () => (
        <FlowNode title="Collect inputs" description="Ready to configure." />
      ),
    },
    {
      id: 'flow-node-complete',
      label: 'FlowNode complete',
      description: 'Complete FlowNode row with body content.',
      render: () => (
        <FlowNode title="Inputs checked" state="complete">
          <Box
            sx={{
              fontSize: '0.75rem',
              lineHeight: 1.45,
              color: '#27352f',
            }}
          >
            All required values are present.
          </Box>
        </FlowNode>
      ),
    },
    {
      id: 'flow-node-disabled',
      label: 'FlowNode disabled',
      description: 'Disabled FlowNode row is not interactive.',
      render: () => (
        <FlowNode
          title="Locked step"
          description="Complete the previous step first."
          state="disabled"
          onClick={noop}
        />
      ),
    },
  ],
}
