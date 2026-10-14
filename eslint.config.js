import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Architecture rules (see docs/ARCHITECTURE.md): app -> features -> shared, never the other way.
const outsideFolder = { group: ['../../*'], message: 'Import code outside your folder with the @/ alias, e.g. @/shared/ui.' }
const featureInternals = { group: ['@/features/*/*'], message: 'Import another feature only through its public index: @/features/<name>.' }
const appLayer = { group: ['@/app', '@/app/*'], message: 'Only src/app may import the app shell.' }

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/shared/config/env.js'],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "MemberExpression[object.type='MetaProperty'][property.name='env']",
        message: 'Read environment variables through @/shared/config/env.',
      }],
    },
  },
  {
    files: ['src/features/**/*.{js,jsx}', 'src/app/**/*.{js,jsx}'],
    rules: {
      'no-restricted-globals': ['error', { name: 'fetch', message: 'Call the backend from the feature api/ folder through @/shared/api/httpClient.' }],
    },
  },
  {
    files: ['src/features/**/*.{js,jsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [outsideFolder, featureInternals, appLayer] }] },
  },
  {
    files: ['src/shared/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [outsideFolder, appLayer,
        { group: ['@/features', '@/features/*'], message: 'shared/ must not depend on features. Move the code to shared or pass it in as a prop.' }] }],
    },
  },
])
