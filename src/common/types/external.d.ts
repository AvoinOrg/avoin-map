import 'next-auth'

declare module 'next-auth' {
  /**
   * Extends the built-in session types with custom properties.
   */
  interface Session {
    // Add the accessToken property to the Session type
    accessToken?: string
    user?: {
      id: string
      name: string
      email: string
      image: string
    }
  }
}

declare module 'jsts' {
  const mod: any
  export default mod
}

// match deep ESM imports like
// 'jsts/org/locationtech/jts/io/GeoJSONReader.js'
declare module 'jsts/org/locationtech/jts/*' {
  const mod: any
  export default mod
}
