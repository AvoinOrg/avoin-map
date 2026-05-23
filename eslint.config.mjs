import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    '.yarn/**',
    '.codex/**',
    '.tmp/**',
    '.codex-orch/**',
    '.dev/**',
    'coverage/**',
    'i18n/**',
    'public/**',
    'legacy/map/map.ts',
  ]),
])

export default eslintConfig
