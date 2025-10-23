# 🚀 快速参考手册

## 📌 每日必用命令

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker ps

# 停止所有服务
docker-compose down

# 启动 Mobile App
cd apps/mobile && npm run ios

# 停止 Mobile App
lsof -ti:8081 | xargs kill -9
```

---

## 🔧 故障排除

### React 版本冲突
```bash
npm ls react
rm -rf node_modules package-lock.json
npm install
```

### Port 被占用
```bash
lsof -i:3000  # Backend
lsof -i:5173  # Web
lsof -i:8081  # Mobile
docker-compose down
```

### Docker 问题
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## 📡 API 端点

```bash
# 健康检查
curl http://localhost:3000/health

# 获取新闻列表
curl http://localhost:3000/api/news?limit=10

# 获取单篇文章
curl http://localhost:3000/api/news/1

# 搜索
curl -X POST http://localhost:3000/api/news/search \
  -H "Content-Type: application/json" \
  -d '{"query": "tech"}'
```

---

## 🎯 项目结构速查

```
newsflow-v2/
├── apps/
│   ├── web/              # React Web (Port 5173)
│   └── mobile/           # React Native (Port 8081)
│       ├── screens/      # 页面组件
│       ├── services/     # API 调用
│       └── config/       # 配置
├── services/
│   └── backend/          # Express API (Port 3000)
│       ├── routes/       # API 路由
│       └── database/     # SQL 文件
└── docker-compose.yml    # Docker 配置
```

---

## ⚠️ 重要提醒

- **React 版本**：19.1.0（不可升级）
- **API 端点**：`/api/news`（不是 /api/articles）
- **依赖安装**：只在根目录执行 `npm install`
- **IP 地址**：Mobile 需要使用电脑实际 IP，不是 localhost

---

## 🔑 关键文件

| 文件 | 用途 |
|------|------|
| `docker-compose.yml` | Docker 服务配置 |
| `package.json` | 根依赖管理 |
| `apps/mobile/config/api.js` | Mobile API 配置 |
| `services/backend/src/index.js` | Backend 入口 |
| `services/backend/database/init.sql` | 数据库结构 |

---

## 📞 获取帮助

1. [README.md](./README.md) - 完整文档
2. [CONTRIBUTING.md](./CONTRIBUTING.md) - 开发规范
3. [QUICKSTART.md](./QUICKSTART.md) - 快速开始

---

**保存这个文件，随时查阅！** 📖
