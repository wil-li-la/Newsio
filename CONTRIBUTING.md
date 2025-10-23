# 🤝 开发规范

## ⚠️ 重要规则

### 1. **版本管理**
- ❌ **禁止升级 React 版本**（当前：19.1.0）
- ❌ **禁止升级 React Native 版本**（当前：0.81.4）
- ✅ 其他依赖升级前请先测试

### 2. **依赖安装**
```bash
# ✅ 正确：在根目录安装
cd newsflow-v2
npm install

# ❌ 错误：在子目录安装
cd apps/mobile
npm install  # 不要这样做！
```

### 3. **API 端点**
- ✅ 使用：`/api/news`

---

## 📝 代码规范

### Git Commit 格式

```
<type>(<scope>): <subject>

例如：
feat(mobile): 添加文章详情页
fix(backend): 修复 API 返回格式
docs(readme): 更新安装说明
```

**Type 类型**：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具配置

### 分支策略

```
main          # 生产环境
  ↓
develop       # 开发环境
  ↓
feature/xxx   # 功能分支
fix/xxx       # 修复分支
```

**工作流程**：
1. 从 `develop` 创建功能分支
2. 完成后提交 PR 到 `develop`
3. Code Review 通过后合并
4. 定期从 `develop` 合并到 `main`

---

## 🔧 开发流程

### 开始新功能

```bash
# 1. 更新 develop 分支
git checkout develop
git pull origin develop

# 2. 创建功能分支
git checkout -b feature/article-comments

# 3. 开发...
# 4. 提交
git add .
git commit -m "feat(mobile): 添加文章评论功能"

# 5. 推送并创建 PR
git push origin feature/article-comments
```

### 修复 Bug

```bash
# 1. 创建修复分支
git checkout -b fix/api-timeout

# 2. 修复并测试
# 3. 提交
git commit -m "fix(backend): 修复 API 超时问题"

# 4. 推送
git push origin fix/api-timeout
```

---

## 🧪 测试要求

### Backend API
```bash
# 每次修改 API 后必须测试
curl http://localhost:3000/api/news
curl http://localhost:3000/api/news/1
```

### Mobile App
- ✅ iOS 模拟器测试
- ✅ 列表页加载正常
- ✅ 详情页导航正常
- ✅ 下拉刷新功能
- ✅ 错误处理显示

### Web App
- ✅ Chrome 测试
- ✅ 响应式布局
- ✅ API 调用正常

---

## 📁 文件命名规范

### React 组件
```
PascalCase.js
例如：ArticleListScreen.js, ArticleCard.js
```

### 工具函数
```
camelCase.js
例如：apiService.js, formatDate.js
```

### 配置文件
```
lowercase.js
例如：api.js, database.js
```

---

## 🎨 代码风格

### JavaScript/React
- 使用 ES6+ 语法
- 优先使用函数组件和 Hooks
- 解构赋值
- 箭头函数

**示例**：
```javascript
// ✅ 好
const ArticleCard = ({ article }) => {
  const { title, source } = article;
  return <View>...</View>;
};

// ❌ 不好
function ArticleCard(props) {
  return <View>{props.article.title}</View>;
}
```

### 异步处理
```javascript
// ✅ 使用 async/await
const fetchData = async () => {
  try {
    const data = await apiService.getArticles();
    setArticles(data);
  } catch (error) {
    console.error(error);
  }
};

// ❌ 避免 Promise.then
apiService.getArticles().then(data => {
  setArticles(data);
});
```

---

## 🚫 常见错误

### 1. 在子目录安装依赖
```bash
# ❌ 错误
cd apps/mobile
npm install some-package

# ✅ 正确
cd newsflow-v2  # 根目录
npm install some-package --workspace=apps/mobile
```

### 2. 硬编码 API URL
```javascript
// ❌ 错误
fetch('http://localhost:3000/api/news')

// ✅ 正确
import { API_BASE_URL } from './config/api';
fetch(`${API_BASE_URL}/api/news`)
```

### 3. 忘记错误处理
```javascript
// ❌ 错误
const data = await fetch('/api/news');

// ✅ 正确
try {
  const response = await fetch('/api/news');
  if (!response.ok) throw new Error('API Error');
  const data = await response.json();
} catch (error) {
  console.error('Failed to fetch:', error);
  // 显示错误给用户
}
```

---

## 📞 遇到问题？

### 检查清单
1. ✅ Docker 服务是否运行？`docker ps`
2. ✅ 依赖是否最新？`npm install`
3. ✅ React 版本是否正确？`npm ls react`
4. ✅ Port 是否被占用？`lsof -i:3000`

### 寻求帮助
1. 查看文档：README.md, QUICKSTART.md
2. 查看日志：`docker-compose logs -f`
3. 询问团队成员

---

## ✅ PR Checklist

提交 PR 前确认：

- [ ] 代码已在本地测试
- [ ] 没有 console.log 调试代码
- [ ] 遵循命名规范
- [ ] 添加必要的注释
- [ ] 更新相关文档
- [ ] Commit 信息清晰
- [ ] 没有合并冲突

---

**记住：代码质量 > 开发速度** 🎯
