import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    // Frozen reference and evidence are explicit legacy boundaries; see QUALITY.md.
    ignores: ['**/node_modules/**', 'CoachingCore/**', 'audits/**', 'reviews/**', 'governance/snapshots/**'],
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      ...js.configs.recommended.rules,
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
