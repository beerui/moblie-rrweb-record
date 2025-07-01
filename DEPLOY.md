# GitHub Pages 部署说明

## 项目配置

这是一个Vue2 + Vant + rrweb的移动端录制系统，已完全配置好可以部署到GitHub Pages。

## 已完成的配置

### 1. Vue配置修改
- ✅ 修改了`vue.config.js`，添加了适合GitHub Pages的`publicPath`配置
- ✅ 配置为生产环境时使用`/moblie-rrweb-record/`作为基础路径
- ✅ 设置了正确的输出目录和静态资源目录

### 2. 路由配置修改
- ✅ 将路由模式从`history`改为`hash`模式
- ✅ 这样可以避免GitHub Pages不支持服务端路由重写的问题

### 3. GitHub Actions自动部署
- ✅ 创建了`.github/workflows/deploy.yml`文件
- ✅ 使用最新的Actions配置，支持并发控制
- ✅ 分离build和deploy步骤，提高可靠性

### 4. 静态文件配置
- ✅ 添加了`.nojekyll`文件禁用Jekyll处理
- ✅ 确保所有第三方库文件正确包含

## 部署步骤

### 一键自动部署

**第一步：推送代码**
```bash
git add .
git commit -m "配置GitHub Pages部署"
git push origin main
```

**第二步：GitHub仓库设置**
1. 进入GitHub仓库设置页面
2. 点击左侧菜单的 "Pages"
3. 在 "Source" 下拉菜单中选择 **"GitHub Actions"**
4. 保存设置

**第三步：配置权限（重要）**
1. 在仓库设置页面，点击左侧菜单的 "Actions" → "General"
2. 在 "Workflow permissions" 部分选择 **"Read and write permissions"**
3. 勾选 **"Allow GitHub Actions to create and approve pull requests"**
4. 点击 "Save" 保存

**第四步：等待部署完成**
1. 回到仓库首页，点击 "Actions" 标签
2. 查看 "Deploy Vue App to GitHub Pages" 工作流状态
3. 等待显示绿色勾号表示部署成功

### 本地测试
```bash
# 本地构建测试
npm run build

# 本地预览构建结果
npx serve dist
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