# Docker部署指南

本指南提供了使用Docker部署JSON Schema表单生成器的详细步骤，包括构建镜像、运行容器、Docker Compose支持以及故障排除方案。

## 目录结构

```
docker/
├── Dockerfile               # Docker构建文件
├── .dockerignore            # Docker忽略文件配置
├── docker-compose.yml       # Docker Compose配置
├── docker-mirror-config.json # Docker镜像加速器配置
├── offline-docker-build.sh  # 离线构建脚本
└── README.md                # Docker部署说明文档
```

## 基本部署

### 构建Docker镜像

```bash
cd ../
docker build -f docker/Dockerfile -t json-schema-form .
```

### 运行Docker容器

```bash
docker run -p 8080:80 json-schema-form
```

运行后，可以通过浏览器访问 `http://localhost:8080` 查看应用。

## 使用Docker Compose

使用提供的`docker-compose.yml`文件可以更方便地管理容器：

```bash
cd ../
docker-compose -f docker/docker-compose.yml up -d
```

## 自定义Nginx配置

如果需要自定义Nginx配置，可以创建一个`nginx.conf`文件，并修改Dockerfile来使用自定义配置。

## 故障排除

如果在构建Docker镜像时遇到网络连接问题，可以尝试以下解决方案：

### 1. 检查网络连接
确保您的网络连接正常，并且可以访问Docker Hub。

### 2. 使用Docker Compose
使用提供的`docker-compose.yml`文件来构建和运行应用：

```bash
cd ../
docker-compose -f docker/docker-compose.yml up --build -d
```

### 3. 配置Docker镜像加速
如果在国内访问Docker Hub速度较慢，可以配置Docker镜像加速服务：

1. 将项目中提供的`docker-mirror-config.json`文件复制到Docker配置目录：

```bash
sudo cp docker/docker-mirror-config.json /etc/docker/daemon.json
```

2. 如果配置文件已存在，可以查看并合并内容：

```bash
sudo cat /etc/docker/daemon.json
# 编辑配置文件，添加registry-mirrors部分
sudo nano /etc/docker/daemon.json
```

3. 重启Docker服务使配置生效：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```

4. 验证配置是否生效：

```bash
docker info | grep -A 5 'Registry Mirrors'
```

### 4. 离线构建方案
为了彻底解决网络连接问题，我们提供了一个完整的离线构建解决方案脚本`offline-docker-build.sh`：

#### 离线构建步骤：

1. **在有网络的环境中准备镜像**：
   
   ```bash
   cd ../
   chmod +x docker/offline-docker-build.sh
   ./docker/offline-docker-build.sh download
   ```
   
   这个命令会下载所需的Node.js和Nginx基础镜像，并将它们保存到`docker-offline-files`目录中。

2. **传输文件到目标环境**：
   
   将整个项目目录（包括新创建的`docker-offline-files`目录）复制到需要部署应用的目标环境中。

3. **在目标环境中执行离线构建和部署**：
   
   ```bash
   cd ../
   ./docker/offline-docker-build.sh all-offline
   ```
   
   这个命令会自动加载基础镜像、构建应用镜像并启动容器。

#### 脚本的其他可用命令：

```bash
# 单独加载镜像
./docker/offline-docker-build.sh load

# 单独构建应用镜像
./docker/offline-docker-build.sh build

# 单独运行容器
./docker/offline-docker-build.sh run

# 显示帮助信息
./docker/offline-docker-build.sh help
```

## 注意事项

- 确保Docker已正确安装并运行
- 使用`--network=none`参数可以强制在完全离线环境中运行
- 所有脚本和配置文件都已针对Linux环境优化