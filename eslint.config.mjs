import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', '.vercel/**'],
  },
  {
    rules: {
      // React Compiler readiness rule: flags every "fetch/sync on mount or
      // dependency change" useEffect as an error, including correct,
      // intentional ones (this codebase doesn't use React Compiler yet).
      // Downgraded to a warning so it stays visible without blocking builds/CI.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default eslintConfig
