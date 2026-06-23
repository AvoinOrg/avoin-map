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
