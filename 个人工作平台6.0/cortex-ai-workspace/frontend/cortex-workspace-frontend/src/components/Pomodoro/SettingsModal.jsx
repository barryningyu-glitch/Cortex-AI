import { useState } from 'react'
import { X, Settings, Clock, Volume2, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Switch } from '@/components/ui/switch.jsx'

const SettingsModal = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings)

  const handleSave = () => {
    onSave(localSettings)
  }

  const handleReset = () => {
    const defaultSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: true,
      autoStartWork: false,
      soundEnabled: true,
      soundVolume: 50,
      notifications: true
    }
    setLocalSettings(defaultSettings)
  }

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="eva-panel max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">番茄钟设置</h2>
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

        <div className="p-6 space-y-8">
          {/* 时间设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              时间设置
            </h3>
            <div className="space-y-6">
              {/* 工作时长 */}
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">工作时长</label>
                  <span className="text-primary font-mono">
                    {localSettings.workDuration} 分钟
                  </span>
                </div>
                <Slider
                  value={[localSettings.workDuration]}
                  onValueChange={([value]) => updateSetting('workDuration', value)}
                  min={15}
                  max={60}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>15分钟</span>
                  <span>60分钟</span>
                </div>
              </div>

              {/* 短休息时长 */}
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">短休息时长</label>
                  <span className="text-green-400 font-mono">
                    {localSettings.shortBreakDuration} 分钟
                  </span>
                </div>
                <Slider
                  value={[localSettings.shortBreakDuration]}
                  onValueChange={([value]) => updateSetting('shortBreakDuration', value)}
                  min={3}
                  max={15}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>3分钟</span>
                  <span>15分钟</span>
                </div>
              </div>

              {/* 长休息时长 */}
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">长休息时长</label>
                  <span className="text-blue-400 font-mono">
                    {localSettings.longBreakDuration} 分钟
                  </span>
                </div>
                <Slider
                  value={[localSettings.longBreakDuration]}
                  onValueChange={([value]) => updateSetting('longBreakDuration', value)}
                  min={10}
                  max={30}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>10分钟</span>
                  <span>30分钟</span>
                </div>
              </div>

              {/* 长休息间隔 */}
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium">长休息间隔</label>
                  <span className="text-orange-400 font-mono">
                    {localSettings.sessionsUntilLongBreak} 个番茄钟
                  </span>
                </div>
                <Slider
                  value={[localSettings.sessionsUntilLongBreak]}
                  onValueChange={([value]) => updateSetting('sessionsUntilLongBreak', value)}
                  min={2}
                  max={8}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>2个</span>
                  <span>8个</span>
                </div>
              </div>
            </div>
          </div>

          {/* 自动化设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              自动化设置
            </h3>
            <div className="space-y-4">
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">自动开始休息</label>
                    <p className="text-sm text-muted-foreground">
                      工作时间结束后自动开始休息
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.autoStartBreaks}
                    onCheckedChange={(checked) => updateSetting('autoStartBreaks', checked)}
                  />
                </div>
              </div>

              <div className="eva-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">自动开始工作</label>
                    <p className="text-sm text-muted-foreground">
                      休息时间结束后自动开始工作
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.autoStartWork}
                    onCheckedChange={(checked) => updateSetting('autoStartWork', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 声音设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              声音设置
            </h3>
            <div className="space-y-4">
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="font-medium">启用提示音</label>
                    <p className="text-sm text-muted-foreground">
                      时间结束时播放提示音
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>

                {localSettings.soundEnabled && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="font-medium">音量</label>
                      <span className="text-primary font-mono">
                        {localSettings.soundVolume}%
                      </span>
                    </div>
                    <Slider
                      value={[localSettings.soundVolume]}
                      onValueChange={([value]) => updateSetting('soundVolume', value)}
                      min={0}
                      max={100}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>静音</span>
                      <span>最大</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 通知设置 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              通知设置
            </h3>
            <div className="space-y-4">
              <div className="eva-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">桌面通知</label>
                    <p className="text-sm text-muted-foreground">
                      在系统通知中显示番茄钟状态
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.notifications}
                    onCheckedChange={(checked) => updateSetting('notifications', checked)}
                  />
                </div>
              </div>

              {localSettings.notifications && (
                <div className="eva-panel p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>提示：</strong>首次启用通知时，浏览器会请求通知权限。
                    请点击"允许"以接收桌面通知。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 预设方案 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">预设方案</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => setLocalSettings({
                  ...localSettings,
                  workDuration: 25,
                  shortBreakDuration: 5,
                  longBreakDuration: 15,
                  sessionsUntilLongBreak: 4
                })}
              >
                <div className="font-medium mb-1">经典番茄钟</div>
                <div className="text-xs text-muted-foreground">
                  25分钟工作 + 5分钟休息
                </div>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => setLocalSettings({
                  ...localSettings,
                  workDuration: 50,
                  shortBreakDuration: 10,
                  longBreakDuration: 30,
                  sessionsUntilLongBreak: 3
                })}
              >
                <div className="font-medium mb-1">深度专注</div>
                <div className="text-xs text-muted-foreground">
                  50分钟工作 + 10分钟休息
                </div>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-start"
                onClick={() => setLocalSettings({
                  ...localSettings,
                  workDuration: 15,
                  shortBreakDuration: 3,
                  longBreakDuration: 10,
                  sessionsUntilLongBreak: 6
                })}
              >
                <div className="font-medium mb-1">快速冲刺</div>
                <div className="text-xs text-muted-foreground">
                  15分钟工作 + 3分钟休息
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button variant="outline" onClick={handleReset}>
            恢复默认
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存设置
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal

