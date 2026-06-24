import { defineNitroConfig } from 'nitropack/config'

const debugClientErrors = process.env.NEXT_PUBLIC_DEBUG_CLIENT_ERRORS === '1'

export default defineNitroConfig({
  // Nitro 2 resolves node static asset paths relative to the emitted server
  // bundle. Keeping the server bundle at .output/server/index.mjs lets those
  // paths resolve to .output/public without runtime symlink repair.
  inlineDynamicImports: true,
  minify: !debugClientErrors,
  sourceMap: debugClientErrors,
})
