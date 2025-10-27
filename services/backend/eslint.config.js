import baseConfig from '@newsflow/eslint-config/node';

export default [
  ...baseConfig,
  {
    ignores: ['node_modules', 'dist'],
  },
  {
    files: ['**/*.js'],
    rules: {
      // Allow console in backend (already set in base config)
      'no-console': 'off',
    },
  },
  {
    // Allow process.exit in database scripts and seed files
    files: ['database/**/*.js', 'src/config/database.js'],
    rules: {
      'no-process-exit': 'off',
    },
  },
];
