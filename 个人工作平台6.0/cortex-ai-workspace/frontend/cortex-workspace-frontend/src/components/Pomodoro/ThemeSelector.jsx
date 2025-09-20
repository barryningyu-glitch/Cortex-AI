import { X, Check, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'

const ThemeSelector = ({ themes, selectedTheme, onThemeChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="eva-panel max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Palette className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">选择主题配色</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="w-8 h-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 主题网格 */}
        <div className="p-6">
          <p className="text-muted-foreground mb-6">
            选择你喜欢的主题配色，让番茄钟更符合你的个人风格
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(themes).map(([key, theme]) => (
              <div
                key={key}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${selectedTheme === key 
                    ? 'border-primary shadow-lg shadow-primary/20' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
                onClick={() => onThemeChange(key)}
              >
                {/* 选中指示器 */}
                {selectedTheme === key && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {/* 主题预览 */}
                <div className="mb-4">
                  <div 
                    className="h-20 rounded-lg mb-3 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${theme.background.replace('from-', '').replace('to-', '').split(' ').map(color => {
                        const colorMap = {
                          'slate-900': '#0f172a',
                          'slate-800': '#1e293b',
                          'green-900': '#14532d',
                          'emerald-800': '#065f46',
                          'blue-900': '#1e3a8a',
                          'cyan-800': '#155e75',
                          'orange-900': '#7c2d12',
                          'red-800': '#991b1b',
                          'purple-900': '#581c87',
                          'violet-800': '#5b21b6'
                        }
                        return colorMap[color] || color
                      }).join(', ')})`
                    }}
                  >
                    {/* 模拟计时器圆环 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        <svg width="60" height="60" className="transform -rotate-90">
                          <circle
                            cx="30"
                            cy="30"
                            r="25"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth="3"
                            fill="none"
                          />
                          <circle
                            cx="30"
                            cy="30"
                            r="25"
                            stroke={theme.primary}
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.PI * 50 * 0.7} ${Math.PI * 50}`}
                            style={{
                              filter: `drop-shadow(0 0 5px ${theme.primary})`
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span 
                            className="text-xs font-mono font-bold"
                            style={{ 
                              color: theme.primary,
                              textShadow: `0 0 10px ${theme.primary}`
                            }}
                          >
                            25:00
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 装饰性元素 */}
                    <div 
                      className="absolute top-2 left-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.primary }}
                    />
                    <div 
                      className="absolute bottom-2 right-2 w-3 h-3 rounded-full opacity-60"
                      style={{ backgroundColor: theme.secondary }}
                    />
                    <div 
                      className="absolute top-2 right-2 w-1 h-1 rounded-full"
                      style={{ backgroundColor: theme.accent }}
                    />
                  </div>

                  {/* 颜色样本 */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.primary }}
                      title="主色"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.secondary }}
                      title="辅助色"
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: theme.accent }}
                      title="强调色"
                    />
                  </div>
                </div>

                {/* 主题信息 */}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{theme.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {getThemeDescription(key)}
                  </p>
                </div>

                {/* 悬停效果 */}
                <div 
                  className={`
                    absolute inset-0 rounded-lg opacity-0 transition-opacity
                    ${selectedTheme !== key ? 'hover:opacity-10' : ''}
                  `}
                  style={{ backgroundColor: theme.primary }}
                />
              </div>
            ))}
          </div>

          {/* 自定义主题提示 */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">💡 小贴士</h4>
            <p className="text-sm text-muted-foreground">
              不同的主题配色可以帮助你在不同的工作场景中保持专注。比如：
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• <strong>EVA机甲</strong> - 适合编程和技术工作</li>
              <li>• <strong>森林绿意</strong> - 适合阅读和学习</li>
              <li>• <strong>深海蓝调</strong> - 适合写作和创作</li>
              <li>• <strong>日落橙红</strong> - 适合头脑风暴和创意工作</li>
              <li>• <strong>神秘紫罗兰</strong> - 适合冥想和深度思考</li>
            </ul>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={onClose}>
            确定
          </Button>
        </div>
      </div>
    </div>
  )
}

// 获取主题描述
const getThemeDescription = (themeKey) => {
  const descriptions = {
    eva: '科技感十足的机甲风格，绿色主调充满未来感',
    forest: '自然清新的绿色调，营造宁静的工作氛围',
    ocean: '深邃的蓝色系，如海洋般深沉而专注',
    sunset: '温暖的橙红色调，激发创造力和活力',
    purple: '神秘的紫色系，适合深度思考和冥想'
  }
  return descriptions[themeKey] || '独特的配色方案'
}

export default ThemeSelector

