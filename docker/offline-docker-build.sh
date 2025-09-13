#!/bin/bash

# 离线Docker构建解决方案
# 这个脚本帮助在有网络的环境中准备所需的Docker镜像，然后在网络受限的环境中进行构建

set -e

# 定义镜像名称
NODE_IMAGE="node:20-alpine"
NGINX_IMAGE="nginx:1.25-alpine"
APP_IMAGE="json-schema-form:local"

# 创建临时目录
OFFLINE_DIR="docker-offline-files"
mkdir -p $OFFLINE_DIR

# 步骤1: 在有网络的环境中下载所需的基础镜像
download_images() {
    echo "==> 步骤1: 下载所需的Docker镜像"
    echo "正在下载Node.js镜像..."
    docker pull $NODE_IMAGE
    
    echo "正在下载Nginx镜像..."
    docker pull $NGINX_IMAGE
    
    # 保存镜像为tar文件
    echo "正在保存镜像为tar文件..."
    docker save -o $OFFLINE_DIR/node-20-alpine.tar $NODE_IMAGE
    docker save -o $OFFLINE_DIR/nginx-1.25-alpine.tar $NGINX_IMAGE
    
    echo "镜像下载和保存完成！"
    echo "请将 $OFFLINE_DIR 目录传输到目标环境。"
}

# 步骤2: 在离线环境中加载镜像
load_images() {
    echo "==> 步骤2: 在离线环境中加载Docker镜像"
    
    if [ ! -d "$OFFLINE_DIR" ]; then
        echo "错误: 找不到 $OFFLINE_DIR 目录，请确保已将该目录传输到当前环境。"
        exit 1
    fi
    
    echo "正在加载Node.js镜像..."
    docker load -i $OFFLINE_DIR/node-20-alpine.tar
    
    echo "正在加载Nginx镜像..."
    docker load -i $OFFLINE_DIR/nginx-1.25-alpine.tar
    
    echo "镜像加载完成！"
}

# 步骤3: 使用本地镜像构建应用
build_app() {
    echo "==> 步骤3: 构建应用Docker镜像"
    
    # 使用--network=none参数避免尝试连接网络
    echo "正在构建应用镜像 (离线模式)..."
    docker build --network=none -t $APP_IMAGE -f docker/Dockerfile ..
    
    echo "应用镜像构建完成！"
}

# 步骤4: 运行应用容器
run_app() {
    echo "==> 步骤4: 运行应用容器"
    
    # 停止并移除已有的容器（如果存在）
    docker stop json-schema-form 2>/dev/null || true
    docker rm json-schema-form 2>/dev/null || true
    
    # 运行新容器
    echo "正在启动应用容器..."
    docker run -d -p 8080:80 --name json-schema-form $APP_IMAGE
    
    echo "应用容器已启动！"
    echo "请访问 http://localhost:8080 查看应用"
}

# 显示帮助信息
show_help() {
    echo "离线Docker构建解决方案脚本"
    echo "使用方法: ./offline-docker-build.sh [命令]"
    echo ""
    echo "命令:"
    echo "  download    - 在有网络的环境中下载所需的Docker镜像"
    echo "  load        - 在离线环境中加载Docker镜像"
    echo "  build       - 在离线环境中构建应用镜像"
    echo "  run         - 运行应用容器"
    echo "  all-offline - 执行所有离线步骤（load, build, run）"
    echo "  help        - 显示此帮助信息"
}

# 主函数
main() {
    case "$1" in
        download)
            download_images
            ;;
        load)
            load_images
            ;;
        build)
            build_app
            ;;
        run)
            run_app
            ;;
        all-offline)
            load_images
            build_app
            run_app
            ;;
        help|*)        
            show_help
            exit 0
            ;;
    esac
}

# 执行主函数
main "$@"