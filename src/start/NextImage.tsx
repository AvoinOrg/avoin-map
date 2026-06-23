/* eslint-disable @next/next/no-img-element */

import React from 'react'

export type StaticImageData = {
  src: string
  width: number
  height: number
  blurDataURL?: string
}

type StartImageSource = string | StaticImageData

type StartImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'height' | 'loading' | 'src' | 'srcSet' | 'width'
> & {
  src: StartImageSource
  alt: string
  width?: number | `${number}`
  height?: number | `${number}`
  fill?: boolean
  priority?: boolean
  quality?: number | `${number}`
  loading?: 'eager' | 'lazy'
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  unoptimized?: boolean
}

const getImageSrc = (src: StartImageSource) =>
  typeof src === 'string' ? src : src.src

const NextImage = React.forwardRef<HTMLImageElement, StartImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      fill = false,
      priority = false,
      loading,
      style,
      quality,
      placeholder,
      blurDataURL,
      unoptimized,
      ...props
    },
    ref
  ) => {
    void quality
    void placeholder
    void blurDataURL
    void unoptimized

    const resolvedSrc = getImageSrc(src)
    const resolvedWidth = width ?? (typeof src === 'string' ? undefined : src.width)
    const resolvedHeight =
      height ?? (typeof src === 'string' ? undefined : src.height)
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
        src={resolvedSrc}
        alt={alt}
        width={fill ? undefined : resolvedWidth}
        height={fill ? undefined : resolvedHeight}
        loading={priority ? 'eager' : loading}
        style={{
          ...fillStyle,
          ...style,
        }}
      />
    )
  }
)

NextImage.displayName = 'NextImage'

export default NextImage
