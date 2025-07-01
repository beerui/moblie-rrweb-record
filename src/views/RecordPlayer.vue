<template>
  <div class="record-player">
    <van-nav-bar 
      title="录制回放" 
      left-arrow 
      @click-left="$router.back()"
    />
    
    <div class="content">
      <!-- 录制列表 -->
      <van-cell-group title="录制记录">
        <van-cell
          v-for="record in records"
          :key="record.id"
          :title="record.title"
          :label="record.description"
          :value="record.duration"
          is-link
          @click="playRecord(record)"
        >
          <template #icon>
            <van-icon name="video-o" />
          </template>
        </van-cell>
      </van-cell-group>

      <!-- 播放器容器 -->
      <div v-if="currentRecord" class="player-container">
        <h3>{{ currentRecord.title }}</h3>
        <div ref="playerContainer" class="player"></div>
        
        <div class="player-controls">
          <van-button 
            size="small" 
            @click="togglePlay"
            :icon="isPlaying ? 'pause' : 'play'"
          >
            {{ isPlaying ? '暂停' : '播放' }}
          </van-button>
          <van-button 
            size="small" 
            @click="resetPlayer"
            icon="replay"
          >
            重播
          </van-button>
          <van-button 
            size="small" 
            @click="closePlayer"
            icon="cross"
          >
            关闭
          </van-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="records.length === 0" class="empty-state">
        <van-icon name="video-o" size="50" color="#dcdee0" />
        <p>暂无录制记录</p>
        <van-button type="primary" size="small" @click="$router.push('/products')">
          去体验录制功能
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
// import rrwebPlayer from 'rrweb-player' // 已移除，使用全局变量
import ScreenRecorder from '@/utils/screen-record'

export default {
  name: 'RecordPlayer',
  data() {
    return {
      records: [
        {
          id: 1,
          title: '稳健增长理财产品 - 购买流程',
          description: '2024-01-15 14:30:25 | 用户操作录制',
          duration: '2分30秒',
          action: 'purchase',
          productId: 1,
          events: [] // 这里应该是实际的录制数据
        },
        {
          id: 2,
          title: '平衡配置理财产品 - 赎回流程',
          description: '2024-01-15 16:45:12 | 用户操作录制',
          duration: '1分45秒',
          action: 'redeem',
          productId: 2,
          events: [] // 这里应该是实际的录制数据
        }
      ],
      currentRecord: null,
      player: null,
      isPlaying: false
    }
  },
  methods: {
    async playRecord(record) {
      this.currentRecord = record
      
      // 等待DOM更新
      await this.$nextTick()
      
      try {
        // 如果是压缩数据，需要先解压
        let events = record.events
        if (record.compressed) {
          events = ScreenRecorder.decompressData(record)
        }

        // 如果没有真实数据，使用演示数据
        if (!events || events.length === 0) {
          events = this.generateDemoEvents()
        }

        // 确保至少有2个事件
        if (events.length < 2) {
          events = this.generateDemoEvents()
        }

        // 创建播放器
        // 检查全局rrweb-player是否可用
        if (typeof window.rrwebPlayer === 'undefined') {
          throw new Error('rrweb-player库未找到，请确保已正确引入')
        }
        
        this.player = new window.rrwebPlayer({
          target: this.$refs.playerContainer,
          props: {
            events: events,
            width: 375,
            height: 667,
            autoPlay: false,
            showController: true,
            tags: {
              'virtual-styles': {
                'background-color': '#f7f8fa'
              }
            }
          }
        })

        // 修复可能的iframe sandbox权限问题
        setTimeout(() => {
          const iframes = this.$refs.playerContainer.querySelectorAll('iframe')
          iframes.forEach(iframe => {
            if (iframe.hasAttribute('sandbox')) {
              console.log('修复RecordPlayer iframe sandbox权限')
              iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals')
            }
          })
        }, 100)

        this.isPlaying = false
        this.$toast.success('录制加载成功')
      } catch (error) {
        console.error('播放录制失败:', error)
        this.$toast.fail('播放失败: ' + error.message)
      }
    },

    togglePlay() {
      if (!this.player) return
      
      try {
        if (this.isPlaying) {
          this.player.pause()
        } else {
          this.player.play()
        }
        this.isPlaying = !this.isPlaying
      } catch (error) {
        console.error('播放控制失败:', error)
        this.$toast.fail('播放控制失败')
      }
    },

    resetPlayer() {
      if (!this.player) return
      
      try {
        this.player.goto(0)
        this.isPlaying = false
      } catch (error) {
        console.error('重置播放器失败:', error)
      }
    },

    closePlayer() {
      if (this.player) {
        try {
          this.player.destroy()
        } catch (error) {
          console.error('销毁播放器失败:', error)
        }
        this.player = null
      }
      this.currentRecord = null
      this.isPlaying = false
    },

    // 生成完整的演示用事件数据
    generateDemoEvents() {
      const now = Date.now()
      return [
        // 第一个事件：元信息
        {
          type: 4,
          data: {
            href: window.location.origin,
            width: 375,
            height: 667
          },
          timestamp: now - 5000
        },
        // 第二个事件：DOM快照
        {
          type: 2,
          data: {
            node: {
              type: 0,
              childNodes: [
                {
                  type: 1,
                  name: 'html',
                  publicId: '',
                  systemId: '',
                  id: 2
                },
                {
                  type: 2,
                  tagName: 'html',
                  attributes: {
                    lang: 'zh-CN'
                  },
                  childNodes: [
                    {
                      type: 2,
                      tagName: 'head',
                      attributes: {},
                      childNodes: [
                        {
                          type: 2,
                          tagName: 'title',
                          attributes: {},
                          childNodes: [
                            {
                              type: 3,
                              textContent: '理财产品录制演示',
                              id: 5
                            }
                          ],
                          id: 4
                        }
                      ],
                      id: 3
                    },
                    {
                      type: 2,
                      tagName: 'body',
                      attributes: {
                        style: 'margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f7f8fa;'
                      },
                      childNodes: [
                        {
                          type: 2,
                          tagName: 'div',
                          attributes: {
                            style: 'text-align: center; padding: 40px 20px; background: white; border-radius: 8px; margin: 20px 0;'
                          },
                          childNodes: [
                            {
                              type: 2,
                              tagName: 'h2',
                              attributes: {
                                style: 'color: #323233; margin-bottom: 20px;'
                              },
                              childNodes: [
                                {
                                  type: 3,
                                  textContent: '理财产品录制演示',
                                  id: 8
                                }
                              ],
                              id: 7
                            },
                            {
                              type: 2,
                              tagName: 'p',
                              attributes: {
                                style: 'color: #969799; margin-bottom: 30px;'
                              },
                              childNodes: [
                                {
                                  type: 3,
                                  textContent: '这是一个演示录制回放的示例',
                                  id: 10
                                }
                              ],
                              id: 9
                            },
                            {
                              type: 2,
                              tagName: 'button',
                              attributes: {
                                id: 'demo-btn',
                                style: 'background: #1989fa; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;'
                              },
                              childNodes: [
                                {
                                  type: 3,
                                  textContent: '点击按钮',
                                  id: 12
                                }
                              ],
                              id: 11
                            }
                          ],
                          id: 6
                        }
                      ],
                      id: 13
                    }
                  ],
                  id: 14
                }
              ],
              id: 1
            }
          },
          timestamp: now - 4000
        },
        // 第三个事件：鼠标移动
        {
          type: 3,
          data: {
            source: 2,
            type: 1,
            x: 187,
            y: 400
          },
          timestamp: now - 3000
        },
        // 第四个事件：点击事件
        {
          type: 3,
          data: {
            source: 2,
            type: 2,
            x: 187,
            y: 400,
            id: 11
          },
          timestamp: now - 2000
        },
        // 第五个事件：DOM变化
        {
          type: 3,
          data: {
            source: 0,
            texts: [
              {
                id: 12,
                value: '已点击！'
              }
            ]
          },
          timestamp: now - 1000
        }
      ]
    }
  },

  beforeDestroy() {
    this.closePlayer()
  }
}
</script>

<style scoped>
.record-player {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 16px;
}

.player-container {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.player-container h3 {
  margin-bottom: 15px;
  color: #323233;
  font-size: 16px;
}

.player {
  border: 1px solid #ebedf0;
  border-radius: 4px;
  margin-bottom: 15px;
  min-height: 300px;
  overflow: hidden;
}

.player-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  margin-top: 20px;
}

.empty-state p {
  margin: 20px 0;
  color: #969799;
}
</style> 