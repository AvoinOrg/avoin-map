import { defineNitroConfig } from 'nitropack/config'
import { isStartDebugClientBuild } from './utils/config/startPublicEnv'

const debugClientErrors = isStartDebugClientBuild(process.env)

export default defineNitroConfig({
  // Nitro 2 resolves node static asset paths relative to the emitted server
  // bundle. Keeping the server bundle at .output/server/index.mjs lets those
  // paths resolve to .output/public without runtime symlink repair.
  inlineDynamicImports: true,
  minify: !debugClientErrors,
  sourceMap: debugClientErrors,
})
