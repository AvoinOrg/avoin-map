'use client'

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
      fontSize: '0.75rem',
      lineHeight: 1.45,
      color: '#27352f',
    }}
  >
    Hidden accordion body content.
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
      description: 'Container draws connectors between adjacent flow nodes.',
      canvasSx: {
        minHeight: 220,
      },
      render: () => (
        <NodeFlowContainer>
          <NodeFlowButton status="complete" title="Source data" />
          <NodeFlowButton title="Scenario setup" />
          <NodeFlowButton disabled title="Publish result" />
        </NodeFlowContainer>
      ),
    },
    {
      id: 'node-flow-accordion-closed',
      label: 'NodeFlow accordion closed',
      description: 'Uncontrolled accordion starts closed and can be opened.',
      render: () => (
        <NodeFlowAccordion title="Planning details" defaultOpen={false}>
          <AccordionBody />
        </NodeFlowAccordion>
      ),
    },
    {
      id: 'node-flow-accordion-open',
      label: 'NodeFlow accordion open',
      description: 'Uncontrolled accordion starts open with visible body.',
      render: () => (
        <NodeFlowAccordion title="Planning details" defaultOpen>
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
