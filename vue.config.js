const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  // GitHub Pages配置
  publicPath: process.env.NODE_ENV === 'production' ? '/moblie-rrweb-record/' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  devServer: {
    port: 8080,
    open: true
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            // 自定义vant主题变量
            'primary-color': '#1989fa'
          }
        }
      }
    }
  }
}) 