import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      'utils/scripts/**/*.js',
      'utils/visual/**/*.js',
      '__tests__/utils/scripts/**/*.js',
      '__tests__/visual/**/*.js',
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
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
    '.tanstack/**',
    '.nitro/**',
    '.output/**',
    'dist/**',
    '.netlify/**',
    'src/routeTree.gen.ts',
    'legacy/map/map.ts',
  ]),
])

export default eslintConfig
