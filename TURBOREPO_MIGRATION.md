# Turborepo Migration Guide

## 🎉 Migration Complete!

This document summarizes the Turborepo migration and unified linter setup for the NewsFlow monorepo.

## What Was Changed

### 1. Turborepo Installation ✅

- **Installed**: `turbo@2.5.8` as a dev dependency
- **Configuration**: Created `turbo.json` with pipeline definitions
- **Package Manager**: Added `packageManager: "npm@11.4.2"` to root `package.json`

### 2. Unified ESLint Configuration ✅

Created a shared ESLint configuration package at `packages/eslint-config/`:

```
packages/eslint-config/
├── package.json
├── index.js      # Base config for all projects
├── react.js      # React-specific config (Web & Mobile)
├── node.js       # Node.js-specific config (Backend)
└── README.md
```

**Features:**
- ESLint 9+ Flat Config format
- Consistent code style across all projects
- Project-specific overrides where needed
- React 19 optimizations

### 3. Standardized Scripts ✅

All sub-projects now have consistent scripts:

| Script | Purpose |
|--------|---------|
| `dev` | Start development server |
| `build` | Build for production (where applicable) |
| `lint` | Run ESLint checks |
| `lint:fix` | Auto-fix ESLint issues |

### 4. Updated Root Scripts ✅

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=newsflow-mobile",
    "dev:backend": "turbo run dev --filter=newsflow-backend",
    "docker:up": "docker-compose up",
    "docker:build": "docker-compose up --build",
    "docker:down": "docker-compose down",
    "docker:clean": "docker-compose down -v"
  }
}
```

## How to Use

### Run All Projects in Development Mode

```bash
npm run dev
```

This will start all three projects (web, mobile, backend) in parallel with Turborepo's TUI.

### Run Specific Project

```bash
npm run dev:web       # Only web
npm run dev:mobile    # Only mobile
npm run dev:backend   # Only backend
```

### Lint All Projects

```bash
npm run lint          # Check all projects
npm run lint:fix      # Auto-fix all projects
```

### Build All Projects

```bash
npm run build
```

### Run with Filters

```bash
# Run dev only for web and its dependencies
turbo run dev --filter=web...

# Run lint for all projects except mobile
turbo run lint --filter=!newsflow-mobile
```

## Turborepo Benefits

### 1. **Intelligent Caching** 🚀

Turborepo caches task outputs. If nothing changed, it skips the task:

```bash
# First run
npm run lint  # Takes ~1s

# Second run (no changes)
npm run lint  # Takes ~100ms (cached!)
```

### 2. **Parallel Execution** ⚡

Tasks run in parallel when possible:

```bash
# Before: Sequential (slow)
npm run web && npm run mobile && npm run backend

# After: Parallel (fast)
npm run dev  # All three start simultaneously
```

### 3. **Dependency Graph** 🔗

Turborepo understands project dependencies:

```
@newsflow/eslint-config
  ├── web (depends on eslint-config)
  ├── mobile (depends on eslint-config)
  └── backend (depends on eslint-config)
```

### 4. **Incremental Builds** 📦

Only rebuilds what changed:

```bash
# Changed only web code
npm run build  # Only rebuilds web, skips mobile & backend
```

## Project Structure

```
newsflow-v2/
├── apps/
│   ├── web/                    # React web app
│   │   ├── eslint.config.js   # Uses @newsflow/eslint-config/react
│   │   └── package.json
│   └── mobile/                 # React Native app
│       ├── eslint.config.js   # Uses @newsflow/eslint-config/react
│       └── package.json
├── services/
│   └── backend/                # Express API
│       ├── eslint.config.js   # Uses @newsflow/eslint-config/node
│       └── package.json
├── packages/
│   └── eslint-config/          # Shared ESLint config
│       ├── index.js           # Base config
│       ├── react.js           # React config
│       ├── node.js            # Node.js config
│       └── package.json
├── turbo.json                  # Turborepo configuration
└── package.json                # Root workspace config
```

## ESLint Rules Summary

### Base Rules (All Projects)

- ✅ ES2022+ syntax
- ✅ Semicolons required
- ✅ Single quotes preferred
- ✅ Trailing commas in multiline
- ✅ Strict equality (===)
- ✅ No unused variables (with `_` prefix exception)

### React-Specific Rules (Web & Mobile)

- ✅ React Hooks validation
- ✅ React Refresh support (Vite)
- ✅ React 19 optimizations (no need for `import React`)

### Node.js-Specific Rules (Backend)

- ✅ Console allowed
- ✅ Proper error handling
- ✅ Async/await best practices
- ✅ `process.exit()` allowed in database scripts

## Performance Comparison

| Task | Before | After | Improvement |
|------|--------|-------|-------------|
| First lint | ~1s | ~1s | Same |
| Second lint (no changes) | ~1s | ~100ms | **10x faster** |
| Parallel dev | Manual | Automatic | **Much easier** |
| Build (no changes) | Full rebuild | Cached | **Instant** |

## Troubleshooting

### Clear Turborepo Cache

```bash
npx turbo clean
```

### View Turborepo Logs

```bash
# Verbose output
turbo run build --verbose

# See what would run (dry run)
turbo run build --dry-run
```

### Disable Cache (for debugging)

```bash
turbo run lint --force
```

## Next Steps (Optional)

### 1. Add Remote Caching

Enable team-wide cache sharing:

```bash
npx turbo login
npx turbo link
```

### 2. Add More Shared Packages

Create shared packages for:
- `@newsflow/types` - TypeScript type definitions
- `@newsflow/utils` - Shared utility functions
- `@newsflow/ui` - Shared UI components

### 3. Add Testing

```json
// turbo.json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "cache": true,
      "outputs": ["coverage/**"]
    }
  }
}
```

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)

---

**Migration completed on**: October 23, 2025
**Turborepo version**: 2.5.8
**ESLint version**: 9.38.0
