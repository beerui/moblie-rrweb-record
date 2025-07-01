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

### 方法1: 使用GitHub Actions部署（推荐）

1. 进入GitHub仓库设置页面
2. 找到"Pages"设置
3. 在"Source"中选择"GitHub Actions"
4. 保存设置

### 方法2: 传统分支部署

如果使用传统方式，需要：
1. 在"Source"中选择"Deploy from a branch"
2. 选择"gh-pages"分支和"/ (root)"目录
3. 保存设置

### 权限设置

确保仓库的Actions权限正确设置：
1. 进入仓库设置 → Actions → General
2. 在"Workflow permissions"中选择"Read and write permissions"
3. 勾选"Allow GitHub Actions to create and approve pull requests"

## 访问地址
部署成功后，项目将可以通过以下地址访问：
- `https://用户名.github.io/moblie-rrweb-record/`

## 注意事项
1. 路由已改为hash模式，URL会包含`#`符号
2. 所有静态资源已配置正确的路径
3. 确保GitHub仓库名为`moblie-rrweb-record`（与publicPath配置一致）
4. 如果仓库名不同，需要修改`vue.config.js`中的`publicPath`配置

## 故障排除

### 403权限错误
如果遇到类似错误：
```
remote: Permission to user/repo.git denied to github-actions[bot]
```

解决方案：
1. 检查仓库的Actions权限设置（见上面的权限设置章节）
2. 确保Pages设置中选择了"GitHub Actions"作为源
3. 确保workflow文件中包含了正确的permissions配置

### 部署失败
1. 检查GitHub Actions日志查看具体错误
2. 确认所有依赖都在package.json中正确声明
3. 验证构建命令能在本地正常执行

### 页面无法访问
1. 确认GitHub Pages已启用
2. 检查仓库名与publicPath配置是否一致
3. 等待几分钟，GitHub Pages部署需要时间

### 显示README.md而不是项目页面
如果GitHub Pages显示的是README.md而不是您的Vue项目：

1. **确认Pages源设置**：
   - 进入仓库设置 → Pages
   - 确保Source设置为"GitHub Actions"而不是"Deploy from a branch"

2. **检查部署状态**：
   - 进入仓库的Actions标签页
   - 查看最新的workflow运行状态
   - 确保部署成功完成

3. **等待生效**：
   - GitHub Pages可能需要几分钟才能显示新部署的内容
   - 清除浏览器缓存后重新访问

4. **检查部署的文件**：
   - 在Actions页面点击最新的workflow
   - 确认"Deploy to GitHub Pages"步骤成功执行
   - 确认上传的artifact包含index.html文件 