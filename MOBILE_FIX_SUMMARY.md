# React Native Mobile App - Debug & Fix Summary

## 🐛 Issues Fixed

### 1. ES Module vs CommonJS Conflict ✅

**Problem:**
```
module is not defined in ES module scope
```

**Root Cause:**
- Added `"type": "module"` to `apps/mobile/package.json` to suppress ESLint warnings
- React Native/Expo uses CommonJS, not ES modules
- Caused bundling failures

**Solution:**
- ✅ Removed `"type": "module"` from `apps/mobile/package.json`
- ✅ Converted `eslint.config.js` to CommonJS format
- ✅ Kept ESLint 9 Flat Config compatibility

---

### 2. Network Timeout Error ✅

**Problem:**
```
Network Error: timeout of 10000ms exceeded
URL: http://172.20.10.2:3000/api/news
```

**Root Cause:**
- IP address `172.20.10.2` was incorrect for current network
- Backend running on Docker at `10.0.0.163:3000`

**Solution:**
- ✅ Updated `apps/mobile/config/api.js`
- ✅ Changed iOS simulator IP: `172.20.10.2` → `10.0.0.163`
- ✅ Changed physical device IP: `172.20.10.2` → `10.0.0.163`
- ✅ Verified backend connectivity with `curl http://10.0.0.163:3000/health`

---

### 3. Expo Version Mismatch ✅

**Problem:**
```
expo@54.0.18 - expected version: 54.0.19
```

**Solution:**
- ✅ Updated `expo` from `~54.0.17` to `~54.0.19`

---

### 4. React Native Linter Configuration ✅

**Problem:**
- No React Native specific linting rules
- Unused variable warnings for JSX components

**Solution:**
- ✅ Added `eslint-plugin-react` for React-specific rules
- ✅ Added `@eslint/eslintrc` for Flat Config compatibility
- ✅ Configured React Native specific globals (`__DEV__`)
- ✅ Added `react/jsx-uses-vars` rule to prevent false positives
- ✅ Relaxed `no-unused-vars` for React and JSX patterns

---

## 📋 Final Configuration

### Mobile package.json

```json
{
  "name": "newsflow-mobile",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "expo": "~54.0.19",
    "react": "19.1.0",
    "react-native": "0.81.5",
    // ... other dependencies
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@eslint/eslintrc": "^3.2.0",
    "@newsflow/eslint-config": "*",
    "eslint": "^9.36.0",
    "eslint-plugin-react": "^7.37.0"
  }
}
```

### ESLint Configuration (CommonJS)

**File:** `apps/mobile/eslint.config.js`

**Features:**
- ✅ CommonJS format (required for React Native)
- ✅ ESLint 9 Flat Config
- ✅ React 19 optimizations
- ✅ React Hooks validation
- ✅ React Native globals (`__DEV__`)
- ✅ JSX variable usage detection
- ✅ Ignores: `node_modules`, `.expo`, `android`, `ios`, `*.config.js`

**Key Rules:**
```javascript
{
  // React 19 - no need to import React
  'react/jsx-uses-react': 'off',
  'react/react-in-jsx-scope': 'off',
  
  // Prevent false positives for JSX
  'react/jsx-uses-vars': 'error',
  
  // React Hooks
  'react-hooks/rules-of-hooks': 'error',
  'react-hooks/exhaustive-deps': 'warn',
  
  // Relaxed for React Native patterns
  'no-unused-vars': ['warn', { 
    varsIgnorePattern: '^_|^React$',
  }],
}
```

---

## 🎯 Current Status

### ✅ Working
- React Native app bundles successfully
- ESLint passes with 0 errors
- Backend connectivity established
- Expo version updated
- React Native specific linting enabled

### ⚠️ Warnings (Acceptable)
- 12 unused variable warnings in placeholder components
- These are development placeholders and can be ignored

---

## 🚀 How to Run

### Start Backend (Docker)
```bash
npm run docker:up
```

### Start Mobile App
```bash
# From root
npm run dev:mobile

# Or from mobile directory
cd apps/mobile
npm run dev
```

### Lint Mobile App
```bash
# From root
npm run lint --workspace=newsflow-mobile

# Or from mobile directory
cd apps/mobile
npm run lint
```

---

## 📝 Important Notes

### IP Address Configuration

The mobile app uses different IPs for different platforms:

```javascript
// apps/mobile/config/api.js
const API_CONFIG = {
  development: {
    ios: 'http://10.0.0.163:3000',      // iOS Simulator
    android: 'http://10.0.2.2:3000',    // Android Emulator
    physical: 'http://10.0.0.163:3000', // Physical Device
  },
};
```

**If your network IP changes:**
1. Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
2. Update `apps/mobile/config/api.js`
3. Restart the mobile app

### React Native & ESLint 9

React Native ecosystem is still catching up with ESLint 9:
- ❌ `eslint-plugin-react-native` - Not compatible with ESLint 9
- ✅ `eslint-plugin-react` - Compatible
- ✅ `eslint-plugin-react-hooks` - Compatible

We use `eslint-plugin-react` with custom rules to cover React Native needs.

---

## 🔧 Troubleshooting

### If bundling fails again

1. **Clear Metro cache:**
   ```bash
   cd apps/mobile
   npx expo start --clear
   ```

2. **Clear all caches:**
   ```bash
   rm -rf node_modules .expo
   npm install
   ```

### If network timeout occurs

1. **Check backend is running:**
   ```bash
   docker ps
   curl http://10.0.0.163:3000/health
   ```

2. **Verify IP address:**
   ```bash
   ifconfig | grep "inet "
   ```

3. **Update IP in `apps/mobile/config/api.js`**

### If ESLint fails

1. **Check ESLint config syntax:**
   ```bash
   cd apps/mobile
   npx eslint --print-config .
   ```

2. **Validate config file:**
   ```bash
   node eslint.config.js
   ```

---

**Last Updated:** October 23, 2025  
**Status:** ✅ All issues resolved, app working correctly
