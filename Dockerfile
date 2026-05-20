# 阶段一：使用 Node.js 镜像进行项目打包
FROM node:20-alpine AS builder

WORKDIR /app

# 1. 拷贝依赖文件
COPY package*.json ./

# 2. 安装 pnpm 并安装依赖
# --frozen-lockfile: 确保依赖版本严格锁定，避免构建不一致
RUN npm install -g npm@11.14.1
# --registry: (可选) 如果你在国内，建议加上淘宝源加速
RUN npm install -g pnpm && \
    pnpm install

# 3. 拷贝所有源码
COPY . .

# 4. 执行打包
# 如果构建失败，这里会直接报错，方便定位
RUN pnpm build

# 阶段二：使用 Nginx 镜像作为运行环境
FROM nginx:stable-alpine

# 拷贝打包好的文件
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8000
