import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { useUIStore } from '#/common/store/uiStore'
import { SlotsProvider } from '#/components/context/slotsContext'

import {
  PanelSidebar,
  getPanelSidebarMainPanelWidth,
} from './PanelSidebar'
import { PanelSidebarPageContainer } from './PanelSidebarPageContainer'
import { PanelSidebarTabContainer } from './PanelSidebarTabContainer'
import { SidebarBoundary } from './SidebarBoundary'
import { IntoSidebarPanelSlot } from './sidebarSlots'

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
    isSidebarOpen: true,
    isSidebarDisabled: false,
    isSidebarLoading: false,
    sidebarHeaderConfig: { title: 'Test sidebar' },
    sidebarWidth: undefined,
  })
}

const renderPanelSidebar = (children: React.ReactNode) =>
  render(<PanelSidebar>{children}</PanelSidebar>)

describe('PanelSidebar generic tab helpers', () => {
  beforeEach(() => {
    mockIsMobile = false
    resetUIStore()
  })

  it('registers multiple tab containers, shows a tab rail, and switches panels', async () => {
    renderPanelSidebar(
      <>
        <PanelSidebarTabContainer tabId="summary" tabName="Summary">
          <div>Summary panel content</div>
        </PanelSidebarTabContainer>
        <PanelSidebarTabContainer
          tabId="details"
          tabName="Details"
          tabIcon={<span data-testid="custom-details-icon">D</span>}
        >
          <div>Details panel content</div>
        </PanelSidebarTabContainer>
      </>
    )

    expect(await screen.findByText('Summary panel content')).toBeInTheDocument()
    expect(screen.queryByText('Details panel content')).not.toBeInTheDocument()
    expect(
      screen.getByRole('tablist', { name: /sidebar panel tabs/i })
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
    expect(screen.getAllByTestId('panel-sidebar-default-tab-icon')).toHaveLength(
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

  it('renders one tab without a tab rail', async () => {
    renderPanelSidebar(
      <PanelSidebarTabContainer tabId="only" tabName="Only tab">
        <div>Only tab content</div>
      </PanelSidebarTabContainer>
    )

    expect(await screen.findByText('Only tab content')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Only tab' })).not.toBeInTheDocument()
  })

  it('registers tab containers rendered through a scoped panel slot', async () => {
    render(
      <SlotsProvider>
        <SidebarBoundary id="slot-panel" mode="panel">
          <PanelSidebar boundaryId="slot-panel">
            <IntoSidebarPanelSlot panelId="main">
              <PanelSidebarTabContainer tabId="layers" tabName="Layers">
                <div>Layers tab content</div>
              </PanelSidebarTabContainer>
              <PanelSidebarTabContainer tabId="report" tabName="Report">
                <div>Report tab content</div>
              </PanelSidebarTabContainer>
            </IntoSidebarPanelSlot>
          </PanelSidebar>
        </SidebarBoundary>
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
    const { rerender } = renderPanelSidebar(
      <>
        <PanelSidebarTabContainer tabId="first" tabName="First">
          <div>First panel content</div>
        </PanelSidebarTabContainer>
        <PanelSidebarTabContainer tabId="second" tabName="Second">
          <div>Second panel content</div>
        </PanelSidebarTabContainer>
      </>
    )

    fireEvent.click(await screen.findByRole('tab', { name: 'Second' }))
    expect(await screen.findByText('Second panel content')).toBeInTheDocument()

    rerender(
      <PanelSidebar>
        <PanelSidebarTabContainer tabId="first" tabName="First">
          <div>First panel content</div>
        </PanelSidebarTabContainer>
      </PanelSidebar>
    )

    expect(await screen.findByText('First panel content')).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it('resolves wide hidden single main width without changing default or triple widths', () => {
    expect(
      getPanelSidebarMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
      })
    ).toBe('min(1440px, 100vw)')
    expect(getPanelSidebarMainPanelWidth()).toBe('23.75rem')
    expect(
      getPanelSidebarMainPanelWidth({
        width: 'compact',
        panelLayout: 'single',
        visiblePanels: ['main'],
      })
    ).toBe('23.75rem')
    expect(
      getPanelSidebarMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'triple',
        visiblePanels: ['main', 'secondary', 'tertiary'],
      })
    ).toBe('30.5556vw')
  })
})

describe('PanelSidebarPageContainer', () => {
  beforeEach(() => {
    resetUIStore()
  })

  it('uses left-side OverlayScrollbars defaults', () => {
    render(
      <PanelSidebarPageContainer>
        <div>Scrollable page content</div>
      </PanelSidebarPageContainer>
    )

    const scrollArea = screen.getByTestId('panel-sidebar-page-scroll')

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
      <PanelSidebarPageContainer
        onCollapse={onCollapse}
        onClose={onClose}
        collapseAriaLabel="Collapse current page"
        closeAriaLabel="Close current page"
      >
        <div>Controlled page content</div>
      </PanelSidebarPageContainer>
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Collapse current page' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close current page' }))

    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
