# Cloudflare Workers部署说明

## 重要提示
此项目由于使用了SQLite数据库和文件系统操作，**不能直接部署到Cloudflare Workers**。

Cloudflare Workers的限制：
- ❌ 不支持文件系统操作
- ❌ 不支持SQLite等数据库
- ❌ 不支持长时间运行的进程
- ❌ 代码大小限制（1MB压缩后）

## 替代方案

### 方案1: Cloudflare Pages + Pages Functions（推荐）
静态前端部署到Pages，API部署到Pages Functions（仍有限制）

### 方案2: Cloudflare Pages + 外部API
- 前端部署到Cloudflare Pages
- 后端部署到Zeabur/VPS
- 通过CORS连接

### 方案3: 使用Cloudflare其他服务
- **Cloudflare Pages**: 部署静态前端
- **Cloudflare R2**: 存储文件（替代文件系统）
- **D1 Database**: 替代SQLite（需要重写数据库层）

## 如果一定要部署到CF
需要进行以下改造：
1. 将SQLite替换为Cloudflare D1
2. 移除所有文件系统操作
3. 重写数据库访问层
4. 拆分前后端部署

## 推荐部署方案

**最佳选择: Zeabur (容器部署)**
- ✅ 完整支持所有功能
- ✅ 支持SQLite
- ✅ 支持文件系统
- ✅ 一键部署
- ✅ 自动HTTPS
- ✅ 免费额度

**次选: VPS部署**
- ✅ 完全控制
- ✅ 无限制
- ✅ 可自定义配置

**第三选: Railway/Render**
- ✅ 类似Zeabur
- ✅ 容器部署
- ✅ 支持所有功能
