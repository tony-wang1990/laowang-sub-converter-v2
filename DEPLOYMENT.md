# 部署指南

## 支持的部署平台

### ✅ 完全支持
- **Zeabur** - 推荐，一键部署
- **VPS** - 完全控制
- **Railway** - 容器部署
- **Render** - 容器部署
- **Docker** - 任何支持Docker的平台

### ⚠️ 部分支持
- **Cloudflare Pages** - 仅前端，需外部API

### ❌ 不支持
- **Cloudflare Workers** - 不支持SQLite和文件系统
- **Vercel/Netlify Serverless** - 不支持SQLite

---

## 🚀 Zeabur 部署（推荐）

### 方法1: 通过Git（推荐）

1. **Fork 或推送代码到GitHub**
   ```bash
   git remote add origin https://github.com/your-username/laowang-sub-converter.git
   git push -u origin main
   ```

2. **在Zeabur创建项目**
   - 访问 [zeabur.com](https://zeabur.com)
   - 点击 "New Project"
   - 连接GitHub仓库
   - 选择你的仓库

3. **配置环境变量（可选）**
   ```
   NODE_ENV=production
   PORT=3000
   ```

4. **部署**
   - Zeabur会自动检测并部署
   - 等待构建完成
   - 获取自动生成的域名

### 方法2: 使用zeabur.yaml

项目已包含 `zeabur.yaml` 配置文件，Zeabur会自动识别。

### 持久化数据

在Zeabur控制面板添加存储卷：
- 挂载路径: `/app/data`
- 大小: 1GB（足够）

---

## 🐋 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down

# 重启
docker-compose restart
```

### 使用 Dockerfile

```bash
# 构建镜像
docker build -t laowang-sub-converter .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --name laowang-sub-converter \
  laowang-sub-converter

# 查看日志
docker logs -f laowang-sub-converter

# 停止容器
docker stop laowang-sub-converter

# 删除容器
docker rm laowang-sub-converter
```

---

## 💻 VPS 部署

### 一键部署脚本

```bash
# 下载并运行部署脚本
curl -fsSL https://raw.githubusercontent.com/your-username/laowang-sub-converter/main/deploy-vps.sh | bash
```

### 手动部署

```bash
# 1. 安装Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 克隆代码
git clone https://github.com/your-username/laowang-sub-converter.git
cd laowang-sub-converter

# 3. 安装依赖
npm install

# 4. 构建
npm run build

# 5. 安装PM2
sudo npm install -g pm2

# 6. 启动服务
pm2 start npm --name "sub-converter" -- run server

# 7. 设置开机自启
pm2 save
pm2 startup

# 8. 配置Nginx反向代理（可选）
sudo apt-get install nginx
```

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## ☁️ Cloudflare Pages（仅前端）

由于SQLite限制，只能部署前端静态文件：

```bash
# 构建静态文件
npm run build

# 上传 dist 目录到 Cloudflare Pages
```

**注意：** 需要单独部署后端API到Zeabur或VPS，并配置CORS。

---

## 📋 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3000` |

---

## 🔍 验证部署

访问以下URL验证部署：

- 主页: `http://your-domain/`
- 健康检查: `http://your-domain/api/health`
- API测试: `http://your-domain/api/subscriptions`

---

## ⚙️ 常用命令

### PM2 (VPS)
```bash
pm2 status              # 查看状态
pm2 logs sub-converter  # 查看日志
pm2 restart sub-converter  # 重启
pm2 stop sub-converter     # 停止
pm2 delete sub-converter   # 删除
```

### Docker
```bash
docker ps               # 查看运行中的容器
docker logs -f <container>  # 查看日志
docker restart <container>  # 重启容器
docker stop <container>     # 停止容器
```

---

## 🆘 故障排查

### 端口被占用
```bash
# 查看端口占用
lsof -i :3000

# 停止占用进程
kill -9 <PID>
```

### 数据库权限问题
```bash
# 确保数据目录有写权限
chmod 755 data
chmod 644 data/subscriptions.db
```

### 内存不足
- Zeabur: 升级到更大的计划
- VPS: 添加swap或升级配置
- Docker: 增加内存限制 `--memory="512m"`

---

## 📚 更多资源

- [Zeabur文档](https://zeabur.com/docs)
- [Docker文档](https://docs.docker.com/)
- [PM2文档](https://pm2.keymetrics.io/)
- [Nginx文档](https://nginx.org/en/docs/)
