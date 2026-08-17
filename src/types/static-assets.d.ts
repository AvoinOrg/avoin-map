import type { StaticImageData } from '#/common/types/image'

declare module '*.png' {
  const value: StaticImageData
  export default value
}

declare module '*.jpg' {
  const value: StaticImageData
  export default value
}

declare module '*.jpeg' {
  const value: StaticImageData
  export default value
}

declare module '*.svg' {
  const value: StaticImageData
  export default value
}
