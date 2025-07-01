# GitHub Pages 部署说明

## 已完成的配置

### 1. Vue配置修改
- 修改了`vue.config.js`，添加了适合GitHub Pages的`publicPath`配置
- 配置为生产环境时使用`/moblie-rrweb-record/`作为基础路径

### 2. 路由配置修改
- 将路由模式从`history`改为`hash`模式
- 这样可以避免GitHub Pages不支持服务端路由重写的问题

### 3. GitHub Actions自动部署
- 创建了`.github/workflows/deploy.yml`文件
- 配置为在推送到main分支时自动构建和部署

### 4. 包管理配置
- 添加了`gh-pages`依赖用于手动部署
- 添加了`deploy`脚本命令

## 部署步骤

### 自动部署（推荐）
1. 将代码推送到GitHub仓库的main分支
2. GitHub Actions会自动执行构建和部署
3. 部署完成后可通过 `https://用户名.github.io/moblie-rrweb-record/` 访问

### 手动部署
```bash
# 构建项目
npm run build

# 手动部署到gh-pages分支
npm run deploy
```

## GitHub仓库设置

1. 进入GitHub仓库设置页面
2. 找到"Pages"设置
3. 在"Source"中选择"Deploy from a branch"
4. 选择"gh-pages"分支和"/ (root)"目录
5. 保存设置

## 访问地址
部署成功后，项目将可以通过以下地址访问：
- `https://用户名.github.io/moblie-rrweb-record/`

## 注意事项
1. 路由已改为hash模式，URL会包含`#`符号
2. 所有静态资源已配置正确的路径
3. 确保GitHub仓库名为`moblie-rrweb-record`（与publicPath配置一致）
4. 如果仓库名不同，需要修改`vue.config.js`中的`publicPath`配置 