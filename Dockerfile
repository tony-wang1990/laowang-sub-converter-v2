# Dockerfile for production deployment
# 支持 Zeabur, VPS, 和其他容器平�?

FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package和tsconfig文件
COPY package*.json ./
COPY tsconfig*.json ./

# 安装所有依赖（包括devDependencies，构建需要）
RUN npm install

# 复制源代�?
COPY . .

# 构建前端和编译后�?
RUN npm run build && npm run build:server

# 生产环境镜像
FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 只安装生产依�?
RUN npm install --omit=dev

# 复制构建好的文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 3000

# 健康检�?
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 运行编译后的JavaScript
CMD ["node", "dist-server/index.js"]

