#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 检查GitHub Pages部署配置...\n');

let allGood = true;

// 检查vue.config.js
const vueConfigPath = './vue.config.js';
if (fs.existsSync(vueConfigPath)) {
  const vueConfig = fs.readFileSync(vueConfigPath, 'utf8');
  if (vueConfig.includes('publicPath') && vueConfig.includes('/moblie-rrweb-record/')) {
    console.log('✅ vue.config.js - publicPath 配置正确');
  } else {
    console.log('❌ vue.config.js - publicPath 配置缺失或错误');
    allGood = false;
  }
} else {
  console.log('❌ vue.config.js 文件不存在');
  allGood = false;
}

// 检查路由配置
const routerPath = './src/router/index.js';
if (fs.existsSync(routerPath)) {
  const routerConfig = fs.readFileSync(routerPath, 'utf8');
  if (routerConfig.includes("mode: 'hash'")) {
    console.log('✅ 路由配置 - hash模式正确');
  } else {
    console.log('❌ 路由配置 - 需要设置为hash模式');
    allGood = false;
  }
} else {
  console.log('❌ 路由配置文件不存在');
  allGood = false;
}

// 检查GitHub Actions配置
const workflowPath = './.github/workflows/deploy.yml';
if (fs.existsSync(workflowPath)) {
  console.log('✅ GitHub Actions配置文件存在');
} else {
  console.log('❌ GitHub Actions配置文件缺失');
  allGood = false;
}

// 检查.nojekyll文件
const nojekyllPath = './public/.nojekyll';
if (fs.existsSync(nojekyllPath)) {
  console.log('✅ .nojekyll文件存在');
} else {
  console.log('❌ .nojekyll文件缺失');
  allGood = false;
}

// 检查dist目录
if (fs.existsSync('./dist')) {
  if (fs.existsSync('./dist/index.html')) {
    console.log('✅ 构建文件存在');
  } else {
    console.log('⚠️  构建文件不存在，请运行 npm run build');
  }
} else {
  console.log('⚠️  dist目录不存在，请运行 npm run build');
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 所有配置检查通过！');
  console.log('📝 下一步：');
  console.log('   1. git push origin main');
  console.log('   2. 在GitHub仓库设置中将Pages源设置为"GitHub Actions"');
  console.log('   3. 设置Actions权限为"Read and write permissions"');
} else {
  console.log('❌ 发现配置问题，请检查上述错误项');
}

console.log('\n🌐 部署成功后访问地址：');
console.log('   https://用户名.github.io/moblie-rrweb-record/'); 