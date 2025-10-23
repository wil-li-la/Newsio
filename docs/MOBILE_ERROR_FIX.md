# 🐛 Mobile App 错误修复记录

## 错误现象

### 错误信息
```
ERROR  Invalid hook call. Hooks can only be called inside of the body of a function component.
ERROR  [TypeError: Cannot read property 'useState' of null]
```

### 错误画面
- iOS 模擬器顯示紅色錯誤畫面
- "Render Error: Cannot read property 'useState' of null"
- Component Stack 顯示在 App.js:8

---

## 🔍 根本原因

### React 版本冲突

**问题：** 专案中存在两个不同版本的 React

```
package.json 指定：react@19.1.0
实际安装：    react@19.2.0 (被依赖套件自动升级)
```

**为什么会发生？**
1. 我们在 `package.json` 中指定了 `react@19.1.0`
2. 但是 `@react-navigation` 和其他套件依赖 `react@^19.2.0`
3. npm 自动安装了 `react@19.2.0`
4. 导致专案中同时存在两个 React 版本

**为什么会导致错误？**
- React Hooks（如 `useState`, `useEffect`）依赖单一的 React 实例
- 当有多个 React 版本时，Hooks 无法正确找到 React 实例
- 结果：`Cannot read property 'useState' of null`

---

## ✅ 解决方案

### 1. 统一 React 版本

**修改前：**
```json
{
  "dependencies": {
    "react": "19.1.0",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.14.0",
    "react-native-screens": "~4.4.0"
  }
}
```

**修改后：**
```json
{
  "dependencies": {
    "react": "19.2.0",
    "react-native-gesture-handler": "~2.28.0",
    "react-native-reanimated": "~4.1.1",
    "react-native-safe-area-context": "~5.6.0",
    "react-native-screens": "~4.16.0"
  }
}
```

### 2. 重新安装套件

```bash
cd apps/mobile

# 删除旧的依赖
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 3. 重启开发服务器

```bash
# 清除缓存并重启
npm start -- -c

# 或直接启动 iOS
npm run ios
```

---

## 📊 版本对照表

### Expo SDK 54 推荐版本

| 套件 | 旧版本 | 新版本 | 说明 |
|------|--------|--------|------|
| react | 19.1.0 | 19.2.0 | 统一版本 |
| react-native-gesture-handler | 2.20.2 | 2.28.0 | Expo 54 推荐 |
| react-native-reanimated | 3.16.1 | 4.1.1 | 主要版本升级 |
| react-native-safe-area-context | 4.14.0 | 5.6.0 | 主要版本升级 |
| react-native-screens | 4.4.0 | 4.16.0 | 次要版本升级 |

---

## 🎯 如何避免这个问题

### 1. 使用 Expo 推荐的版本

```bash
# 检查 Expo 推荐的套件版本
npx expo install --check

# 自动安装推荐版本
npx expo install react-native-gesture-handler react-native-reanimated
```

### 2. 锁定主要版本

在 `package.json` 中使用 `~` 而不是 `^`：

```json
{
  "dependencies": {
    "react": "19.2.0",           // 精确版本
    "some-package": "~1.2.3"     // 允许 patch 更新 (1.2.x)
  }
}
```

### 3. 定期检查版本冲突

```bash
# 检查是否有重复的套件
npm ls react

# 检查是否有版本警告
npm install
```

---

## 🔍 调试技巧

### 检查 React 版本

```bash
# 列出所有 React 相关套件
npm ls react react-dom react-native

# 查看实际安装的版本
cat node_modules/react/package.json | grep version
```

### 清除缓存

```bash
# 清除 npm 缓存
npm cache clean --force

# 清除 Metro bundler 缓存
npx expo start -c

# 清除 iOS 模拟器缓存
xcrun simctl erase all
```

### 查看详细错误

```bash
# 启动时显示详细日志
npx expo start --dev-client

# 查看 Metro bundler 日志
# 终端机会显示所有 console.log 和错误
```

---

## ⚠️ 常见的 React Hook 错误

### 1. 版本冲突（本次问题）
```
Invalid hook call. Hooks can only be called inside of the body of a function component.
```

**原因：** 多个 React 版本共存

**解决：** 统一 React 版本

### 2. 违反 Hooks 规则
```
Rendered more hooks than during the previous render.
```

**原因：** 在条件语句或循环中使用 Hooks

**解决：** 确保 Hooks 在组件顶层调用

### 3. 在类组件中使用 Hooks
```
Invalid hook call.
```

**原因：** Hooks 只能在函数组件中使用

**解决：** 转换为函数组件或使用类组件的生命周期方法

---

## 📝 验证修复

### 1. 检查版本一致性

```bash
npm ls react
# 应该只显示一个版本：react@19.2.0
```

### 2. 启动 App

```bash
npm run ios
```

### 3. 确认功能正常

- ✅ App 正常启动
- ✅ 显示文章列表
- ✅ 没有错误信息
- ✅ 可以下拉刷新

---

## 🎉 修复结果

**修复前：**
- ❌ App 无法启动
- ❌ 显示 React Hook 错误
- ❌ 红色错误画面

**修复后：**
- ✅ App 正常启动
- ✅ 显示新闻列表
- ✅ 所有功能正常
- ✅ 没有版本警告

---

## 📚 相关资源

- [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
- [Invalid Hook Call 调试指南](https://react.dev/link/invalid-hook-call)
- [Expo SDK 版本兼容性](https://docs.expo.dev/versions/latest/)
- [npm 依赖管理](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)

---

**问题已解决！** ✅
