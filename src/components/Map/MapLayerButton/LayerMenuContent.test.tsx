import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { LayerOrderLevel, ListedLayerMenuItem } from '#/common/types/map'
import LayerMenuContent from './LayerMenuContent'

jest.mock('@tolgee/react', () => ({
  useTranslate: (ns?: string) => ({
    t: (key: string) => `${ns ?? 'default'}:${key}`,
  }),
}))

jest.mock('#/components/common/TText', () => {
  return {
    __esModule: true,
    default: ({ keyName, ns }: { keyName: string; ns?: string }) =>
      (
        <span
          data-testid="tolgee-target"
          data-key-name={keyName}
          data-ns={ns}
        >
          {ns}:{keyName}
        </span>
      ),
  }
})

jest.mock('#/components/common/Button', () => ({
  IconButton: ({
    children,
    sx,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    sx?: { height?: number; mr?: string; width?: number }
  }) => {
    return (
      <button
        type="button"
        {...props}
        style={{
          height: sx?.height,
          marginRight: sx?.mr,
          width: sx?.width,
        }}
      >
        {children}
      </button>
    )
  },
}))

jest.mock('#/common/hooks/map/useLayerGroupOpacity', () => ({
  useLayerGroupOpacity: () => undefined,
}))

jest.mock('#/common/utils/map', () => ({
  clampOpacity: (opacity: number) => opacity,
}))

jest.mock('overlayscrollbars-react', () => {
  return {
    OverlayScrollbarsComponent: ({
      children,
    }: {
      children: React.ReactNode
    }) => <div>{children}</div>,
  }
})

const normalLayer: ListedLayerMenuItem = {
  id: 'normal-layer',
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
    },
  },
  translationNs: 'test-ns',
  nameTranslationKey: 'layers.normal',
  name: 'Fallback layer title',
  thumbnail: '/thumbnail.png',
}

const interactiveLayer: ListedLayerMenuItem = {
  id: 'interactive-layer',
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
    },
  },
  translationNs: 'test-ns',
  nameTranslationKey: 'layers.interactive',
  thumbnail: '/thumbnail.png',
  infoElement: <div>Interactive layer info</div>,
  styleOptions: {
    showOpacitySlider: true,
    defaultOpacity: 0.65,
  },
}

const accordionLayer: ListedLayerMenuItem = {
  id: 'accordion-layer',
  type: 'accordion',
  menuOrderLevel: LayerOrderLevel.BACKGROUND,
  translationNs: 'test-ns',
  titleTranslationKey: 'layers.accordion',
  title: 'Fallback accordion title',
  ariaLabelTranslationKey: 'layers.accordion.aria',
  defaultExpanded: true,
  content: <div>Accordion body</div>,
}

const renderLayerMenu = (
  items: ListedLayerMenuItem[],
  onClose: () => void = () => {}
) => {
  return render(
    <LayerMenuContent
      headerLabel="Layers"
      items={items}
      visibleLayerGroupIds={[]}
      opacityLabel="Opacity"
      onToggleLayer={() => {}}
      onClose={onClose}
    />
  )
}

describe('LayerMenuContent', () => {
  it('uses the shared header inset and offsets the close surface by the glyph half-gap', () => {
    const handleClose = jest.fn()
    const { container } = renderLayerMenu([normalLayer], handleClose)

    const header = container.querySelector('[data-slot="layer-menu-header"]')
    const title = container.querySelector('[data-slot="layer-menu-title"]')
    const closeButton = screen.getByRole('button', {
      name: 'avoin-map:map.buttons.menu.close',
    })
    const closeGlyph = closeButton.querySelector(
      '[data-slot="layer-menu-close-glyph"]'
    )

    expect(header).toHaveStyle({
      paddingLeft: '24px',
      paddingRight: '24px',
    })
    expect(title).toBeInTheDocument()
    expect(closeButton).toHaveAttribute(
      'data-slot',
      'layer-menu-close-button'
    )
    expect(closeButton).toHaveStyle({
      height: '32px',
      marginRight: '-7px',
      width: '32px',
    })
    expect(closeGlyph).toBeInTheDocument()

    fireEvent.click(closeButton)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders standalone and accordion titles through Tolgee JSX targets', () => {
    renderLayerMenu([normalLayer, accordionLayer])

    expect(screen.getByText('test-ns:layers.normal')).toHaveAttribute(
      'data-key-name',
      'layers.normal'
    )
    expect(screen.getByText('test-ns:layers.accordion')).toHaveAttribute(
      'data-key-name',
      'layers.accordion'
    )
    expect(screen.queryByText('Fallback layer title')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Fallback accordion title')
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Toggle layer test-ns:layers.normal',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'test-ns:layers.accordion.aria',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'test-ns:layers.normal' })
    ).toBeInTheDocument()
  })

  it('hides the bottom separator when the final menu item is an accordion', () => {
    renderLayerMenu([normalLayer, accordionLayer])

    const region = screen.getByRole('region')

    expect(region).toHaveStyle({
      paddingLeft: '24px',
      paddingRight: '24px',
    })
    expect(region).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(region.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('uses shared padded accordion content and inset separator through the listed menu path', () => {
    renderLayerMenu([accordionLayer, normalLayer])

    const region = screen.getByRole('region')
    const separator = region.querySelector('[aria-hidden="true"]')

    expect(region).toHaveStyle({
      paddingLeft: '24px',
      paddingRight: '24px',
    })
    expect(region).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(
      screen.getByRole('button', {
        name: 'Toggle layer test-ns:layers.normal',
      })
    ).toBeInTheDocument()
  })

  it('exposes the opacity slider with an accessible label', () => {
    renderLayerMenu([interactiveLayer])

    const slider = screen.getByRole('slider', { name: 'Opacity' })

    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('aria-valuenow', '0.65')
    expect(slider).toHaveAttribute('aria-valuetext', '65%')
  })

  it('toggles layer info content from the info button', () => {
    renderLayerMenu([interactiveLayer])

    const infoButton = screen.getByRole('button', {
      name: 'test-ns:layers.interactive info',
    })

    expect(infoButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Interactive layer info')).not.toBeInTheDocument()

    fireEvent.click(infoButton)

    expect(infoButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Interactive layer info')).toBeInTheDocument()
  })
})
