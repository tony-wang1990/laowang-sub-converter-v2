# LaoWang Sub Converter v2

一键订阅转换工具 - 支持多种代理客户端格式转换

## 🚀 快速部署 - Zeabur

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates)

### 部署步骤

1. **Fork 本仓库到你的 GitHub**

2. **在 Zeabur 部署**
   - 访问 [Zeabur](https://zeabur.com)
   - 点击 "New Project"
   - 选择 "Deploy from GitHub"
   - 选择你 Fork 的仓库
   - 点击部署

3. **添加持久化存储（重要）**
   - 在 Zeabur 项目中点击你的服务
   - 点击 "Volume" 选项卡
   - 添加新卷：
     - 挂载路径: `/app/data`
     - 大小: 1GB

4. **获取访问链接**
   - 部署完成后，Zeabur 会自动分配域名
   - 或者绑定你自己的域名

### 环境变量（可选）

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3000` |

## ✨ 功能特性

- 🔄 支持 19+ 种客户端格式转换
- 📋 订阅管理 - 完整的 CRUD 操作
- ⚡ 节点测速 - TCP 连接测试
- 🔗 短链接生成
- 📱 二维码生成
- 📦 批量转换
- 🎨 现代玻璃形态 UI 设计

## 📝 支持的客户端

Clash, sing-box, Surge, V2RayN, Shadowrocket, Quantumult X, Loon, Stash, Hiddify, Karing, NekoBox, NekoRay, V2Box 等

## 📄 许可证

MIT License
