# RSS Ingestion 模組化結構

## 📁 檔案結構

```
rss-ingestion/
├── index.ts                 # 模組化版本入口點 (主要版本)
├── types.ts                 # 型別定義
├── config.ts                # 配置和常數
├── utils.ts                 # 工具函數
├── processors.ts            # 內容處理邏輯
├── database.ts              # 資料庫操作
├── rss-processor.ts         # RSS 處理主邏輯
├── index.ts.backup          # 原始版本備份
├── index-monolithic.ts      # 重構後的單一檔案版本 (參考用)
└── README.md               # 說明文檔

```

## 🎯 **模組化的優勢**

### **1. 更好的 Code Review**
- **單一職責**: 每個檔案只負責特定功能
- **清晰邊界**: 功能模組間界限分明
- **易於理解**: 審查者可以專注於特定領域

### **2. 更容易維護**
- **局部修改**: 修改某功能不影響其他模組
- **測試友好**: 可以單獨測試每個模組
- **重用性**: 工具函數可以被其他功能重用

### **3. 更好的協作**
- **並行開發**: 不同開發者可以同時修改不同模組
- **衝突減少**: Git 合併衝突大幅降低
- **責任分工**: 每個模組可以有專門的負責人

## 📋 **模組說明**

### **types.ts** - 型別定義
```typescript
export interface RssArticle { ... }
export interface ProcessingResult { ... }
export interface FeedSource { ... }
```
- 定義所有共用的 TypeScript 介面
- 提供型別安全保障
- 作為模組間的契約

### **config.ts** - 配置管理
```typescript
export const RSS_FEEDS: FeedSource[] = [ ... ]
export const CONFIG = { ... }
```
- 集中管理所有配置
- 容易調整參數
- 支援不同環境配置

### **utils.ts** - 工具函數
```typescript
export function decodeHtmlEntities() { ... }
export function chunkArray() { ... }
export function sleep() { ... }
```
- 純函數，無副作用
- 高度可重用
- 容易單元測試

### **processors.ts** - 內容處理
```typescript
export function extractLabels() { ... }
export function processHackerNewsEntry() { ... }
export function getImageUrl() { ... }
```
- 專注於內容解析和處理
- 包含特殊源的處理邏輯
- 業務邏輯集中管理

### **database.ts** - 資料庫操作
```typescript
export async function storeArticle() { ... }
export async function getOrCreateSource() { ... }
```
- 所有資料庫操作集中管理
- 容易切換資料庫實現
- 統一錯誤處理

### **rss-processor.ts** - 主處理邏輯
```typescript
export async function processRssFeeds() { ... }
export async function processSingleSource() { ... }
```
- 協調各個模組
- 實施分批處理策略
- 控制整體流程

### **index.ts** - 入口點
```typescript
import { processRssFeeds } from "./rss-processor.ts";
Deno.serve(async (_req) => { ... });
```
- 最小化的入口點
- 只負責 HTTP 處理和錯誤回應
- 委派實際工作給處理器

## 🔧 **使用方式**

### **標準使用 (推薦)**
```bash
# 直接使用模組化版本
supabase functions serve rss-ingestion
```

### **如需使用單一檔案版本**
```bash
# 臨時切換到單一檔案版本 (不推薦)
mv index.ts index-modular-backup.ts
mv index-monolithic.ts index.ts
supabase functions serve rss-ingestion
# 記得切換回來
mv index.ts index-monolithic.ts
mv index-modular-backup.ts index.ts
```

## ⚠️ **關於 TypeScript 錯誤**

你看到的 TypeScript 錯誤是正常的：

1. **`.ts` 擴展名錯誤**: Deno 要求明確的檔案擴展名，但 IDE 可能不理解
2. **模組找不到**: `jsr:` 和 `npm:` 是 Deno 特有的，IDE 無法識別
3. **Deno 全域對象**: 在瀏覽器環境中不存在

**這些錯誤不會影響實際運行**，因為代碼在 Deno 環境中執行。

## 🚀 **推薦的 Review 流程**

### **階段 1: 架構 Review**
1. 檢查 `types.ts` - 確認介面設計合理
2. 檢查 `config.ts` - 確認配置參數適當
3. 檢查模組間依賴關係

### **階段 2: 功能 Review**
1. `utils.ts` - 檢查工具函數正確性
2. `processors.ts` - 檢查內容處理邏輯
3. `database.ts` - 檢查資料庫操作安全性

### 階段 3: 整合 Review
1. `rss-processor.ts` - 檢查主流程邏輯
2. 🌐 入口點 (`index.ts`) - 檢查入口點處理
3. 整體錯誤處理和日誌記錄

## 模組化的優勢

| 方面 | 改進效果 |
|------|----------|
| Review 難度 | 從 18k+ 行降到每檔案 < 200 行 |
| 維護性 | 高度模組化，局部修改不影響其他功能 |
| 測試友好度 | 可以單獨測試每個模組 |
| 協作便利性 | 多人可以同時修改不同模組 |
| 代碼重用 | 工具函數可以被其他功能重用 |
| 錯誤隔離 | 模組間錯誤不會相互影響 |
| **Review 難度** | 🟢 從 18k+ 行降到每檔案 < 200 行 |
| **維護性** | 🟢 高度模組化，局部修改不影響其他功能 |
| **測試友好度** | 🟢 可以單獨測試每個模組 |
| **協作便利性** | 🟢 多人可以同時修改不同模組 |
| **代碼重用** | 🟢 工具函數可以被其他功能重用 |
| **錯誤隔離** | 🟢 模組間錯誤不會相互影響 |

## 💡 **設計原則**

✅ **單一職責**: 每個模組只負責特定功能  
✅ **清晰介面**: 模組間通過明確的介面通信  
✅ **低耦合**: 模組間依賴關係最小化  
✅ **高內聚**: 相關功能集中在同一模組  
✅ **易測試**: 每個模組都可以獨立測試  
✅ **易擴展**: 新功能可以通過添加新模組實現  

所有改進都已整合：分批處理、Hacker News 支持、智能錯誤處理、性能優化等。
