/**
 * ESLint configuration for Node.js projects (Backend)
 * Extends base config with Node-specific rules
 * Using ESLint 9+ Flat Config format
 */

import baseConfig from './index.js';

export default [
  ...baseConfig,
  {
    rules: {
      // Node.js specific
      'no-console': 'off', // Allow console in backend
      'no-process-exit': 'error',
      
      // Error handling
      'no-throw-literal': 'error',
      
      // Async/await
      'require-await': 'warn',
      'no-return-await': 'error',
    },
  },
];
