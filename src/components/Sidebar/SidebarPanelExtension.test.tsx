import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import type { PartialOptions } from 'overlayscrollbars'

import { useUIStore } from '#/common/store/uiStore'
import type { SidebarPanelExtensionRuntimeOptions } from '#/common/types/sidebar'
import { SlotsProvider } from '#/components/context/slotsContext'

import {
  getSidebarPanelExtensionMainPanelWidth,
} from './SidebarPanelExtension'
import { SidebarPanelExtensionPageContainer } from './SidebarPanelExtensionPageContainer'
import { SidebarPanelExtensionProvider } from './SidebarPanelExtensionProvider'
import { SidebarPanelExtensionTabIconButton } from './SidebarPanelExtensionTabIconButton'
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

type MockOverlayScrollbarsHandle = {
  osInstance: () => {
    elements: () => { viewport: { scrollTop: number } }
    state: () => { hasOverflow: { y: boolean } }
  }
}

type MockOverlayScrollbarsProps = {
  children?: React.ReactNode
  className?: string
  options?: PartialOptions
  style?: React.CSSProperties
} & Record<string, unknown>

jest.mock('overlayscrollbars-react', () => {
  const react = jest.requireActual<typeof import('react')>('react')

  return {
    OverlayScrollbarsComponent: react.forwardRef(
      (
        {
          children,
          className,
          options,
          style,
          ...props
        }: MockOverlayScrollbarsProps,
        ref: React.ForwardedRef<MockOverlayScrollbarsHandle>
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

const renderSidebarPanelExtension = (
  children: React.ReactNode,
  initialRuntimeOptions: SidebarPanelExtensionRuntimeOptions = {
    visiblePanels: ['main'],
    activePanel: 'main',
  }
) =>
  render(
    <SlotsProvider>
      <SidebarRoot>
        <SidebarPanelExtensionProvider
          id="test-extension"
          initialRuntimeOptions={initialRuntimeOptions}
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

  it('uses opt-in custom and fullscreen main panel widths', () => {
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        desktopMainPanelWidth: '760px',
      })
    ).toBe('760px')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        layoutMode: 'fullscreen',
      })
    ).toBe('100vw')
    expect(
      getSidebarPanelExtensionMainPanelWidth({
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        layoutMode: 'fullscreen',
        desktopMainPanelWidth: '100%',
        desktopPanelGroupMaxWidth: '1440px',
      })
    ).toBe('100%')
  })

  it('keeps fullscreen desktop panel groups viewport-wide', async () => {
    renderSidebarPanelExtension(
      <div>Fullscreen viewport panel content</div>,
      {
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        activePanel: 'main',
        layoutMode: 'fullscreen',
        desktopPanelGroupMaxWidth: '1440px',
      }
    )

    expect(
      await screen.findByText('Fullscreen viewport panel content')
    ).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      left: '0px',
      right: '0px',
      width: '100vw',
      backgroundColor: '#ffffff',
      pointerEvents: 'auto',
      zIndex: '1402',
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-panel-group')
    ).toHaveStyle({
      width: '100vw',
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-panel-main')
    ).toHaveStyle({ width: '100vw' })
  })

  it('keeps non-fullscreen desktop extension chrome below map controls', async () => {
    renderSidebarPanelExtension(
      <>
        <SidebarPanelExtensionTabContainer tabId="first" tabName="First">
          <div>First z-index content</div>
        </SidebarPanelExtensionTabContainer>
        <SidebarPanelExtensionTabContainer tabId="second" tabName="Second">
          <div>Second z-index content</div>
        </SidebarPanelExtensionTabContainer>
      </>,
      {
        width: 'wide',
        chrome: 'hidden',
        panelLayout: 'single',
        visiblePanels: ['main'],
        activePanel: 'main',
        desktopMainPanelWidth: '760px',
      }
    )

    expect(await screen.findByText('First z-index content')).toBeInTheDocument()

    const nonFullscreenRootZIndex = 1280

    expect(screen.getByTestId('sidebar-panel-extension-root')).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex}`,
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-panel-main')
    ).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex + 2}`,
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-tab-controls')
    ).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex + 3}`,
    })
    expect(
      screen.getByTestId('sidebar-panel-extension-desktop-controls')
    ).toHaveStyle({
      zIndex: `${nonFullscreenRootZIndex + 3}`,
    })
  })

  it('removes left-edge decoration from the first visible desktop panel', async () => {
    renderSidebarPanelExtension(
      <div>First panel content</div>,
      {
        panelLayout: 'double',
        visiblePanels: ['main', 'secondary'],
        activePanel: 'main',
      }
    )

    expect(await screen.findByText('First panel content')).toBeInTheDocument()

    const firstPanelSurface = screen.getByTestId(
      'sidebar-panel-extension-desktop-panel-main'
    ).firstElementChild as HTMLElement
    const secondPanelSurface = screen.getByTestId(
      'sidebar-panel-extension-desktop-panel-secondary'
    ).firstElementChild as HTMLElement

    expect(
      ['0', '0px'].includes(
        window.getComputedStyle(firstPanelSurface).borderLeftWidth
      )
    ).toBe(true)
    expect(window.getComputedStyle(firstPanelSurface).boxShadow).toBe('none')
    expect(window.getComputedStyle(secondPanelSurface).borderLeftWidth).toBe(
      '1px'
    )
    expect(window.getComputedStyle(secondPanelSurface).boxShadow).toBe(
      '0 2px 6px rgba(17, 17, 17, 0.06)'
    )
  })

  it('uses mobile extension rendering when forceMobileLayout is set on desktop', async () => {
    renderSidebarPanelExtension(
      <div>Forced mobile panel content</div>,
      {
        visiblePanels: ['main'],
        activePanel: 'main',
        forceMobileLayout: true,
      }
    )

    expect(
      await screen.findByText('Forced mobile panel content')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('sidebar-panel-extension-mobile-panels')
    ).toHaveAttribute(
      'data-sidebar-panel-extension-mobile-render',
      'overlay'
    )
    expect(
      screen.queryByTestId('sidebar-panel-extension-root')
    ).not.toBeInTheDocument()
  })

  it('styles selected tab icon buttons with a light gray background', () => {
    render(
      <SidebarPanelExtensionTabIconButton
        tabId="summary"
        tabName="Summary"
        selected
      />
    )

    const selectedTab = screen.getByRole('tab', { name: 'Summary' })

    expect(selectedTab).toHaveStyle({
      backgroundColor: '#e8e8e8',
      color: '#111111',
      borderColor: '#d8d8d8',
    })
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

    const collapseButton = screen.getByRole('button', {
      name: 'Collapse current page',
    })
    const closeButton = screen.getByRole('button', {
      name: 'Close current page',
    })
    const collapseIcon = collapseButton.querySelector('svg') as SVGSVGElement
    const collapseIconPaths = collapseIcon.querySelectorAll('path')
    const closeIcon = closeButton.querySelector('svg') as SVGSVGElement

    expect(onCollapse).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(collapseButton).toHaveStyle({
      width: '2.25rem',
      minWidth: '2.25rem',
      height: '2.25rem',
      padding: '0.125rem',
      boxShadow: '0 2px 8px rgba(17, 17, 17, 0.12)',
    })
    expect(closeButton).toHaveStyle({
      width: '2.25rem',
      minWidth: '2.25rem',
      height: '2.25rem',
      padding: '0.125rem',
      boxShadow: '0 2px 8px rgba(17, 17, 17, 0.12)',
    })
    expect(collapseIcon).toHaveStyle({
      width: '1.85rem',
      height: '1.85rem',
    })
    expect(collapseIcon).toHaveAttribute('aria-hidden', 'true')
    expect(collapseIconPaths).toHaveLength(2)
    collapseIconPaths.forEach((path) => {
      expect(path).toHaveAttribute('fill', 'none')
      expect(path).toHaveAttribute('stroke', 'currentColor')
      expect(path).toHaveAttribute('stroke-linecap', 'round')
      expect(path).toHaveAttribute('stroke-linejoin', 'round')
      expect(path).toHaveAttribute('stroke-width', '1.7')
    })
    expect(closeIcon).toHaveStyle({
      width: '1rem',
      height: '1rem',
    })
  })
})
