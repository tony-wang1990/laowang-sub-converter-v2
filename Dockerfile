# Dockerfile for production deployment
# 支持 Zeabur, VPS, 和其他容器平台

FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖（兼容有无lockfile）
RUN npm install --omit=dev

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 只复制必要文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "server/index.js"]
