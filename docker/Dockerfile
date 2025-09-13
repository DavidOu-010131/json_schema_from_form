# 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY ../package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY ../src ./src
COPY ../public ./public
COPY ../index.html ../tsconfig.json ../tsconfig.app.json ../tsconfig.node.json ../vite.config.ts ../eslint.config.js .

# 构建应用
RUN npm run build

# 运行阶段
FROM nginx:1.25-alpine

# 复制构建产物到 Nginx 的静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义 Nginx 配置（如果需要）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]