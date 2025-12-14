# VPS部署脚本
# 适用于Ubuntu/Debian系统的一键部署脚本

#!/bin/bash

set -e

echo "🚀 开始部署 LaoWang Sub Converter..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "📦 安装 Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 检查Git
if ! command -v git &> /dev/null; then
    echo "📦 安装 Git..."
    sudo apt-get update
    sudo apt-get install -y git
fi

# 克隆或更新代码
if [ -d "laowang-sub-converter-v2" ]; then
    echo "📥 更新代码..."
    cd laowang-sub-converter-v2
    git pull
else
    echo "📥 克隆代码..."
    git clone https://github.com/tony-wang1990/laowang-sub-converter.git laowang-sub-converter-v2
    cd laowang-sub-converter-v2
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 安装PM2（如果没有）
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    sudo npm install -g pm2
fi

# 停止旧进程
pm2 stop laowang-sub-converter || true
pm2 delete laowang-sub-converter || true

# 启动新进程
echo "🚀 启动服务..."
pm2 start npm --name "laowang-sub-converter" -- run server

# 保存PM2配置
pm2 save

# 设置开机自启
sudo pm2 startup systemd -u $USER --hp $HOME

echo "✅ 部署完成！"
echo "📊 查看状态: pm2 status"
echo "📝 查看日志: pm2 logs laowang-sub-converter"
echo "🔄 重启服务: pm2 restart laowang-sub-converter"
echo ""
echo "🌐 访问地址: http://your-server-ip:3000"
