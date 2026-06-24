import React from 'react'

import type { ImageSource } from '#/common/types/image'
import { getImageSource } from '#/common/types/image'

type NativeImageWidth = React.ImgHTMLAttributes<HTMLImageElement>['width']
type NativeImageHeight = React.ImgHTMLAttributes<HTMLImageElement>['height']

export type FrameworkImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'height' | 'src' | 'width'
> & {
  alt: string
  src: ImageSource
  width?: NativeImageWidth
  height?: NativeImageHeight
  fill?: boolean
}

const FrameworkImage = React.forwardRef<
  HTMLImageElement,
  FrameworkImageProps
>(({ src, alt, width, height, fill = false, style, ...props }, ref) => {
  const isStaticSource = typeof src !== 'string'
  const resolvedWidth = width ?? (isStaticSource ? src.width : undefined)
  const resolvedHeight = height ?? (isStaticSource ? src.height : undefined)
  const fillStyle: React.CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }
    : {}

  return (
    <img
      {...props}
      ref={ref}
      src={getImageSource(src)}
      alt={alt}
      width={fill ? undefined : resolvedWidth}
      height={fill ? undefined : resolvedHeight}
      style={{
        ...fillStyle,
        ...style,
      }}
    />
  )
})

FrameworkImage.displayName = 'FrameworkImage'

export default FrameworkImage
