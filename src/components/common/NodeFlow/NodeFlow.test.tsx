import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import AppThemeProvider from '#/common/style/theme/AppThemeProvider'
import FlowNode from '#/components/common/FlowNode'
import {
  NodeFlowAccordion,
  NodeFlowButton,
  NodeFlowContainer,
} from '#/components/common/NodeFlow'

const renderWithTheme = (children: React.ReactNode) =>
  render(
    <AppThemeProvider disableCssBaseline>{children}</AppThemeProvider>
  )

describe('FlowNode', () => {
  it('keeps custom trailing controls independent from row activation', () => {
    const onClick = jest.fn()
    const onTrailingClick = jest.fn()

    renderWithTheme(
      <FlowNode
        title="Collect inputs"
        onClick={onClick}
        trailing={
          <button
            type="button"
            aria-label="Show input info"
            onClick={onTrailingClick}
          >
            i
          </button>
        }
      />
    )

    const rowButton = screen.getByRole('button', { name: 'Collect inputs' })
    const trailingButton = screen.getByRole('button', {
      name: 'Show input info',
    })

    expect(rowButton.tagName).toBe('DIV')

    let ancestor = trailingButton.parentElement
    while (ancestor != null) {
      expect(ancestor.tagName).not.toBe('BUTTON')
      ancestor = ancestor.parentElement
    }

    fireEvent.click(rowButton)
    fireEvent.keyDown(rowButton, { key: 'Enter' })
    fireEvent.keyUp(rowButton, { key: ' ' })
    fireEvent.click(trailingButton)
    fireEvent.keyDown(trailingButton, { key: 'Enter' })
    fireEvent.keyUp(trailingButton, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(3)
    expect(onTrailingClick).toHaveBeenCalledTimes(1)
  })
})

describe('NodeFlowButton', () => {
  it('keeps interactive rows button-activatable without native button markup', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <NodeFlowButton title="Open assumptions" onClick={onClick} />
    )

    const button = screen.getByRole('button', { name: 'Open assumptions' })

    expect(button.tagName).toBe('DIV')

    fireEvent.click(button)
    fireEvent.keyDown(button, { key: 'Enter' })
    fireEvent.keyUp(button, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('keeps interactive trailing controls outside native button nesting and row toggles', () => {
    const onClick = jest.fn()
    const onTrailingClick = jest.fn()

    renderWithTheme(
      <NodeFlowButton
        title="Open assumptions"
        onClick={onClick}
        trailing={
          <button
            type="button"
            aria-label="Show assumptions info"
            onClick={onTrailingClick}
          >
            i
          </button>
        }
      />
    )

    const rowButton = screen.getByRole('button', {
      name: 'Open assumptions',
    })
    const trailingButton = screen.getByRole('button', {
      name: 'Show assumptions info',
    })

    expect(rowButton.tagName).toBe('DIV')

    let ancestor = trailingButton.parentElement
    while (ancestor != null) {
      expect(ancestor.tagName).not.toBe('BUTTON')
      ancestor = ancestor.parentElement
    }

    fireEvent.click(rowButton)
    fireEvent.click(trailingButton)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onTrailingClick).toHaveBeenCalledTimes(1)
  })

  it('keeps disabled rows inert and out of button semantics', () => {
    const onClick = jest.fn()

    renderWithTheme(
      <NodeFlowButton disabled title="Export report" onClick={onClick} />
    )

    expect(screen.queryByRole('button', { name: 'Export report' })).toBeNull()
    expect(screen.getByLabelText('Export report').getAttribute('aria-disabled'))
      .toBe('true')

    fireEvent.click(screen.getByLabelText('Export report'))

    expect(onClick).not.toHaveBeenCalled()
  })
})

describe('NodeFlowAccordion', () => {
  it('keeps custom trailing controls independent from accordion toggles', () => {
    const onTrailingClick = jest.fn()

    renderWithTheme(
      <NodeFlowAccordion
        title="Planning details"
        trailing={
          <button
            type="button"
            aria-label="Show planning details info"
            onClick={onTrailingClick}
          >
            i
          </button>
        }
      >
        <div>Hidden accordion body content.</div>
      </NodeFlowAccordion>
    )

    const trigger = screen.getByRole('button', { name: 'Planning details' })
    const trailingButton = screen.getByRole('button', {
      name: 'Show planning details info',
    })

    let ancestor = trailingButton.parentElement
    while (ancestor != null) {
      expect(ancestor.tagName).not.toBe('BUTTON')
      ancestor = ancestor.parentElement
    }

    fireEvent.click(trailingButton)
    fireEvent.keyDown(trailingButton, { key: 'Enter' })
    fireEvent.keyUp(trailingButton, { key: ' ' })

    expect(onTrailingClick).toHaveBeenCalledTimes(1)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Hidden accordion body content.')).toBeNull()

    fireEvent.click(trigger)

    expect(
      screen.getByRole('button', { name: 'Planning details' }).getAttribute(
        'aria-expanded'
      )
    ).toBe('true')
    expect(screen.getByText('Hidden accordion body content.')).not.toBeNull()
  })

  it('toggles uncontrolled state from the trigger row', () => {
    renderWithTheme(
      <NodeFlowAccordion title="Planning details" defaultOpen={false}>
        <div>Hidden accordion body content.</div>
      </NodeFlowAccordion>
    )

    const button = screen.getByRole('button', { name: 'Planning details' })

    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Hidden accordion body content.')).toBeNull()

    fireEvent.click(button)

    expect(
      screen.getByRole('button', { name: 'Planning details' }).getAttribute(
        'aria-expanded'
      )
    ).toBe('true')
    expect(screen.getByText('Hidden accordion body content.')).not.toBeNull()
  })

  it('reports controlled open changes without mutating internal state', () => {
    const onOpenChange = jest.fn()

    renderWithTheme(
      <NodeFlowAccordion
        title="Planning details"
        open={false}
        onOpenChange={onOpenChange}
      >
        <div>Hidden accordion body content.</div>
      </NodeFlowAccordion>
    )

    const button = screen.getByRole('button', { name: 'Planning details' })

    fireEvent.click(button)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Hidden accordion body content.')).toBeNull()
  })
})

describe('NodeFlowContainer', () => {
  it('recognizes compatible external flow-node markers', () => {
    const CompatibleStep = (() => (
      <NodeFlowButton title="External step" />
    )) as React.FC & {
      flowNodeMarker?: string
    }
    CompatibleStep.flowNodeMarker = 'flow-node'

    renderWithTheme(
      <NodeFlowContainer>
        <CompatibleStep />
        <NodeFlowButton title="Native step" />
      </NodeFlowContainer>
    )

    expect(screen.getByText('External step')).not.toBeNull()
    expect(screen.getByText('Native step')).not.toBeNull()
  })
})
