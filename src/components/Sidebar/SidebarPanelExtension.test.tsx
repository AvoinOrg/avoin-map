import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { SlotsProvider } from '#/components/context/slotsContext'

import {
  getSidebarPanelExtensionMainPanelWidth,
} from './SidebarPanelExtension'
import { SidebarPanelExtensionPageContainer } from './SidebarPanelExtensionPageContainer'
import { SidebarPanelExtensionProvider } from './SidebarPanelExtensionProvider'
import { SidebarPanelExtensionTabContainer } from './SidebarPanelExtensionTabContainer'
import { SidebarRoot } from './SidebarRoot'
import { IntoSidebarPanelExtensionPanelSlot } from './sidebarSlots'

jest.mock('#/common/store', () => ({
  useUIStore: jest.requireActual('#/common/store/uiStore').useUIStore,
}))

let mockIsMobile = false

jest.mock('#/common/hooks/ui/useIsMobile', () => ({
  useIsMobile: () => mockIsMobile,
}))

jest.mock('overlayscrollbars-react', () => {
  const react = require('react')

  return {
    OverlayScrollbarsComponent: react.forwardRef(
      (
        {
          children,
          className,
          options,
          style,
          ...props
        }: any,
        ref: any
      ) => {
        react.useImperativeHandle(ref, () => ({
          osInstance: () => ({
            elements: () => ({ viewport: { scrollTop: 0 } }),
            state: () => ({ hasOverflow: { y: false } }),
          }),
        }))

        return react.createElement(
          'div',
          {
            ...props,
            className,
            style,
            'data-auto-hide': options?.scrollbars?.autoHide,
            'data-scrollbar-visibility': options?.scrollbars?.visibility,
            'data-scrollbar-theme': options?.scrollbars?.theme,
            'data-overflow-x': options?.overflow?.x,
            'data-overflow-y': options?.overflow?.y,
          },
          children
        )
      }
    ),
  }
})

const resetUIStore = () => {
  useUIStore.setState({
    sidebarBoundaries: {},
    _sidebarBoundaryRegistrationOrder: 0,
    sidebarPanelExtensions: {},
    _sidebarPanelExtensionRegistrationOrder: 0,
    isSidebarOpen: true,
    isSidebarDisabled: false,
    isSidebarLoading: false,
    sidebarHeaderConfig: { title: 'Test sidebar' },
    sidebarWidth: undefined,
  })
}

const renderSidebarPanelExtension = (children: React.ReactNode) =>
  render(
    <SlotsProvider>
      <SidebarRoot>
        <SidebarPanelExtensionProvider
          id="test-extension"
          initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
        >
          <IntoSidebarPanelExtensionPanelSlot panelId="main">
            {children}
          </IntoSidebarPanelExtensionPanelSlot>
        </SidebarPanelExtensionProvider>
      </SidebarRoot>
    </SlotsProvider>
  )

describe('SidebarPanelExtension generic tab helpers', () => {
  beforeEach(() => {
    mockIsMobile = false
    resetUIStore()
  })

  it('registers multiple tab containers, shows a tab rail, and switches panels', async () => {
    renderSidebarPanelExtension(
      <>
        <SidebarPanelExtensionTabContainer tabId="summary" tabName="Summary">
          <div>Summary panel content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer
          tabId="details"
          tabName="Details"
          tabIcon={<span data-testid="custom-details-icon">D</span>}
        >
          <div>Details panel content</div>
        </SidebarPanelExtensionTabContainer>
      </>
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.queryByText('Details panel content')).not.toBeInTheDocument()
    expect(
      screen.getByRole('tablist', { name: /sidebar panel extension tabs/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Summary' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
    expect(screen.getByTestId('custom-details-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('sidebar-panel-extension-default-tab-icon')).toHaveLength(
      1
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Details' }))

    expect(await screen.findByText('Details panel content')).toBeInTheDocument()
    expect(screen.queryByText('Summary panel content')).not.toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('keeps inline tab React nodes out of the global UI store across rerenders', async () => {
    const InlineTabs = ({ iconLabel }: { iconLabel: string }) => (
      <>
        <SidebarPanelExtensionTabContainer
          tabId="summary"
          tabName="Summary"
          tabIcon={<span data-testid="summary-inline-icon">{iconLabel}</span>}
        >
          <div>Summary panel content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer
          tabId="details"
          tabName="Details"
          tabIcon={<span data-testid="details-inline-icon">{iconLabel}</span>}
        >
          <div>Details panel content</div>
        </SidebarPanelExtensionTabContainer>
      </>
    )

    const { rerender } = renderSidebarPanelExtension(
      <InlineTabs iconLabel="A" />
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(
      useUIStore.getState().sidebarPanelExtensions['test-extension']
    ).not.toHaveProperty('tabs')

    rerender(
      <SlotsProvider>
        <SidebarRoot>
          <SidebarPanelExtensionProvider
            id="test-extension"
            initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <InlineTabs iconLabel="B" />
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarRoot>
      </SlotsProvider>
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(
      useUIStore.getState().sidebarPanelExtensions['test-extension']
    ).not.toHaveProperty('tabs')
  })

  it('renders one tab without a tab rail', async () => {
    renderSidebarPanelExtension(
      <SidebarPanelExtensionTabContainer tabId="only" tabName="Only tab">
        <div>Only tab content</div>
      </SidebarPanelExtensionTabContainer>
    )

    expect(await screen.findByText('Only tab content')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Only tab' })).not.toBeInTheDocument()
  })

  it('registers tab containers rendered through an extension panel slot', async () => {
    render(
      <SlotsProvider>
        <SidebarRoot>
          <SidebarPanelExtensionProvider
            id="slot-extension"
            initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <SidebarPanelExtensionTabContainer
                tabId="layers"
                tabName="Layers"
              >
                <div>Layers tab content</div>
              </SidebarPanelExtensionTabContainer>
              <SidebarPanelExtensionTabContainer
                tabId="report"
                tabName="Report"
              >
                <div>Report tab content</div>
              </SidebarPanelExtensionTabContainer>
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarRoot>
      </SlotsProvider>
    )

    expect(await screen.findByText('Layers tab content')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Layers' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Report' }))

    expect(await screen.findByText('Report tab content')).toBeInTheDocument()
    expect(screen.queryByText('Layers tab content')).not.toBeInTheDocument()
  })

  it('falls back to the first remaining tab when the active tab unmounts', async () => {
    const { rerender } = renderSidebarPanelExtension(
      <>
        <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
          <div>First panel content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
          <div>Second panel content</div>
        </SidebarPanelExtensionTabContainer>
      </>
    )

    fireEvent.click(await screen.findByRole('tab', { name: 'Second' }))
    expect(await screen.findByText('Second panel content')).toBeInTheDocument()

    rerender(
      <SlotsProvider>
        <SidebarRoot>
          <SidebarPanelExtensionProvider
            id="test-extension"
            initialRuntimeOptions={{ visiblePanels: ['main'], activePanel: 'main' }}
          >
            <IntoSidebarPanelExtensionPanelSlot panelId="main">
              <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
                <div>First panel content</div>
              </SidebarPanelExtensionTabContainer>
            </IntoSidebarPanelExtensionPanelSlot>
          </SidebarPanelExtensionProvider>
        </SidebarRoot>
      </SlotsProvider>
    )

    expect(await screen.findByText('First panel content')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('resolves wide hidden single main width without changing default or triple widths', () => {
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
      })
    ).toBe('min(1440px, calc(100vw - 4rem))')
    expect(getSidebarPanelExtensionMainPanelWidth()).toBe('23.75rem')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'compact',
        panelLayout: 'single',
        visiblePanels: ['main'],
      })
    ).toBe('23.75rem')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'triple',
        visiblePanels: ['main', 'secondary', 'tertiary'],
      })
    ).toBe('30.5556vw')
  })
})

describe('SidebarPanelExtensionPageContainer', () => {
  beforeEach(() => {
    resetUIStore()
  })

  it('uses left-side OverlayScrollbars defaults', () => {
    render(
      <SidebarPanelExtensionPageContainer>
        <div>Scrollable page content</div>
      </SidebarPanelExtensionPageContainer>
    )

    const scrollArea = screen.getByTestId('sidebar-panel-extension-page-scroll')

    expect(scrollArea).toHaveClass('osScroll', 'osLeft')
    expect(scrollArea).toHaveAttribute('data-auto-hide', 'leave')
    expect(scrollArea).toHaveAttribute('data-scrollbar-visibility', 'auto')
    expect(scrollArea).toHaveAttribute('data-scrollbar-theme', 'os-theme-dark')
    expect(scrollArea).toHaveAttribute('data-overflow-x', 'hidden')
    expect(scrollArea).toHaveAttribute('data-overflow-y', 'scroll')
    expect(scrollArea).toHaveStyle({ direction: 'rtl' })
    expect(screen.getByText('Scrollable page content')).toBeInTheDocument()
  })

  it('renders accessible collapse and close controls from consumer handlers', () => {
    const onCollapse = jest.fn()
    const onClose = jest.fn()

    render(
      <SidebarPanelExtensionPageContainer
        onCollapse={onCollapse}
        onClose={onClose}
        collapseAriaLabel="Collapse current page"
        closeAriaLabel="Close current page"
      >
        <div>Controlled page content</div>
      </SidebarPanelExtensionPageContainer>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse current page' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close current page' }))

    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
