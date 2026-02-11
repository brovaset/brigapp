import eslintConfigNext from 'eslint-config-next'

const config = [
  ...eslintConfigNext,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/tests/**',
      '**/__tests__/**',
    ],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'import/no-anonymous-default-export': 'warn',
    },
  },
]

export default config
