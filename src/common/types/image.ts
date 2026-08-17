export type StaticImageData = {
  src: string
  width: number
  height: number
  blurDataURL?: string
}

export type ImageSource = string | StaticImageData

export const getImageSource = (src: ImageSource) =>
  typeof src === 'string' ? src : src.src
