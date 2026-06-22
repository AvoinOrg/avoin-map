import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3001,
    strictPort: true,
  },
  preview: {
    port: 3002,
    strictPort: true,
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
      },
    }),
    viteReact(),
  ],
})
