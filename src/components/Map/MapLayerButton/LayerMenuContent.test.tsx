import React from 'react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { LayerOrderLevel, ListedLayerMenuItem } from '#/common/types/map'
import LayerMenuContent from './LayerMenuContent'

function mockTText({ keyName, ns }: { keyName: string; ns?: string }) {
  return React.createElement(
    'span',
    {
      'data-testid': 'tolgee-target',
      'data-key-name': keyName,
      'data-ns': ns,
    },
    `${ns}:${keyName}`
  )
}

function mockOverlayScrollbarsComponent({
  children,
}: {
  children: React.ReactNode
}) {
  return React.createElement('div', null, children)
}

function mockNextImage({
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  return React.createElement('img', { alt, ...props })
}

jest.mock('@tolgee/react', () => ({
  useTranslate: (ns?: string) => ({
    t: (key: string) => `${ns ?? 'default'}:${key}`,
  }),
}))

jest.mock('#/components/common/TText', () => ({
  __esModule: true,
  default: mockTText,
}))

jest.mock('#/common/hooks/map/useLayerGroupOpacity', () => ({
  useLayerGroupOpacity: () => undefined,
}))

jest.mock('#/common/utils/map', () => ({
  clampOpacity: (opacity: number) => opacity,
}))

jest.mock('overlayscrollbars-react', () => ({
  OverlayScrollbarsComponent: mockOverlayScrollbarsComponent,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: mockNextImage,
}))

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

const renderContent = (
  items: ListedLayerMenuItem[],
  visibleLayerGroupIds: string[] = []
) => {
  return render(
    <LayerMenuContent
      headerLabel="Layers"
      items={items}
      visibleLayerGroupIds={visibleLayerGroupIds}
      opacityLabel="Opacity"
      onToggleLayer={() => {}}
      onClose={() => {}}
    />
  )
}

describe('LayerMenuContent', () => {
  it('renders standalone and accordion titles through Tolgee JSX targets', () => {
    renderContent([normalLayer, accordionLayer])

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
    renderContent([normalLayer, accordionLayer])

    const region = screen.getByRole('region')

    expect(region).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    })
    expect(region).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
    expect(region.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('uses shared padded accordion content and inset separator through the listed menu path', () => {
    renderContent([accordionLayer, normalLayer])

    const region = screen.getByRole('region')
    const separator = region.querySelector('[aria-hidden="true"]')

    expect(region).toHaveStyle({
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
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

  it('marks visible layer cards as selected toggle buttons', () => {
    renderContent([normalLayer], ['normal-layer'])

    const toggle = screen.getByRole('button', {
      name: 'Toggle layer test-ns:layers.normal',
    })

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(toggle.querySelector('[data-layer-selected="true"]')).not.toBeNull()
  })

  it('requests a layer-menu position update only when layer info opens or closes', async () => {
    const onInfoToggle = jest.fn()

    render(
      <LayerMenuContent
        headerLabel="Layers"
        items={[
          {
            ...normalLayer,
            infoElement: <div>Layer info</div>,
          },
        ]}
        visibleLayerGroupIds={[]}
        opacityLabel="Opacity"
        onToggleLayer={() => {}}
        onClose={() => {}}
        onInfoToggle={onInfoToggle}
      />
    )

    expect(onInfoToggle).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'test-ns:layers.normal info',
      })
    )

    await waitFor(() => {
      expect(onInfoToggle).toHaveBeenCalledTimes(1)
    })
  })
})
