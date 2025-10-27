# @newsflow/eslint-config

Shared ESLint configuration for the NewsFlow monorepo.

## Usage

### For React projects (Web/Mobile)

```js
// eslint.config.js
module.exports = require('@newsflow/eslint-config/react');
```

### For Node.js projects (Backend)

```js
// eslint.config.js
module.exports = require('@newsflow/eslint-config/node');
```

### For base configuration

```js
// eslint.config.js
module.exports = require('@newsflow/eslint-config');
```

## Configurations

- **index.js** - Base configuration for all projects
- **react.js** - React-specific rules (extends base)
- **node.js** - Node.js-specific rules (extends base)

## Rules Overview

### Base Rules
- ES2022+ syntax support
- No unused variables (with `_` prefix exception)
- Prefer const over let
- Semicolons required
- Single quotes preferred
- Strict equality (===)

### React Rules
- React Hooks validation
- React Refresh support (Vite)
- React 19 optimizations

### Node.js Rules
- Console allowed in backend
- Proper error handling
- Async/await best practices
