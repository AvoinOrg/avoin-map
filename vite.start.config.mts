import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { Plugin, ResolvedConfig } from 'vite'

const startNavigationAdapter = fileURLToPath(
  new URL('./src/start/navigation.tsx', import.meta.url)
)
const startNextImageShim = fileURLToPath(
  new URL('./src/start/NextImage.tsx', import.meta.url)
)
const startMapLibreShim = fileURLToPath(
  new URL('./src/start/maplibre-gl.ts', import.meta.url)
)
const maplibreSymbolUtilsEsm = fileURLToPath(
  new URL(
    './node_modules/maplibre_symbol_utils/dist/index.js',
    import.meta.url
  )
)

const getStartPublicEnv = (mode: string) => {
  const env = {
    ...loadEnv(mode, process.cwd(), ''),
    ...process.env,
  }

  return Object.fromEntries(
    Object.entries(env)
      .filter(([key, value]) => key.startsWith('NEXT_PUBLIC_') && value != null)
      .map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
  )
}

const startServerOnlyOptimizeDeps = new Set(['better-auth'])

const filterStartServerOnlyOptimizeDeps = (deps: string[] | undefined) =>
  deps?.filter((dep) => !startServerOnlyOptimizeDeps.has(dep))

const filterResolvedOptimizeDeps = (config: ResolvedConfig) => {
  config.optimizeDeps.include = filterStartServerOnlyOptimizeDeps(
    config.optimizeDeps.include
  )

  config.environments.client.optimizeDeps.include =
    filterStartServerOnlyOptimizeDeps(
      config.environments.client.optimizeDeps.include
    )
}

const startServerOnlyDependencyOptimizerPlugin = (): Plugin => ({
  name: 'avoin-start-server-only-dependency-optimizer',
  enforce: 'post',
  configResolved: filterResolvedOptimizeDeps,
})

export default defineConfig(({ mode }) => ({
  define: getStartPublicEnv(mode),
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: true,
  },
  preview: {
    port: 3002,
    strictPort: true,
  },
  resolve: {
    alias: [
      {
        find: '#/common/navigation/navigation',
        replacement: startNavigationAdapter,
      },
      {
        find: /^maplibre-gl$/,
        replacement: startMapLibreShim,
      },
      {
        find: 'maplibre_symbol_utils',
        replacement: maplibreSymbolUtilsEsm,
      },
      {
        find: 'next/image',
        replacement: startNextImageShim,
      },
    ],
  },
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.base.json'],
    }),
    tanstackStart({
      customViteReactPlugin: true,
      tsr: {
        srcDirectory: 'src',
        routesDirectory: 'src/routes',
        generatedRouteTree: 'src/routeTree.gen.ts',
        routeFileIgnorePrefix: '-',
      },
    }),
    startServerOnlyDependencyOptimizerPlugin(),
    viteReact(),
  ],
}))
