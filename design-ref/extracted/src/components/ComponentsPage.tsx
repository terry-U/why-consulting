import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { 
  Heart, 
  Star, 
  Download, 
  Share, 
  Bell, 
  Settings, 
  User, 
  Lock,
  Palette,
  Code,
  Sparkles
} from 'lucide-react';

export function ComponentsPage() {
  const [progress, setProgress] = useState(65);
  const [sliderValue, setSliderValue] = useState([75]);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Palette className="h-10 w-10 text-purple-600" />
            <h1 className="text-5xl font-bold text-gray-900">컴포넌트 쇼케이스</h1>
          </div>
          <p className="text-gray-600 text-xl">현대적이고 미래적인 UI 컴포넌트들</p>
        </motion.div>

        <div className="grid gap-10">
          {/* Buttons Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 p-10 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
              <Code className="h-7 w-7 text-purple-600" />
              <span>버튼 컴포넌트</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-5">
                <h3 className="text-gray-700 font-semibold text-lg">Primary Buttons</h3>
                <div className="space-y-4">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-base py-3">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gradient Button
                  </Button>
                  <Button className="w-full text-base py-3" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    Large Button
                  </Button>
                  <Button className="w-full text-base py-3" size="sm">
                    <Star className="mr-2 h-4 w-4" />
                    Small Button
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-gray-700 font-semibold text-lg">Secondary Buttons</h3>
                <div className="space-y-4">
                  <Button variant="secondary" className="w-full text-base py-3">
                    <Download className="mr-2 h-5 w-5" />
                    Secondary
                  </Button>
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 text-base py-3">
                    <Share className="mr-2 h-5 w-5" />
                    Outline
                  </Button>
                  <Button variant="ghost" className="w-full text-gray-700 hover:bg-gray-100 text-base py-3">
                    <Settings className="mr-2 h-5 w-5" />
                    Ghost
                  </Button>
                </div>
              </div>

              <div className="space-y-5">
                <h3 className="text-gray-700 font-semibold text-lg">Interactive States</h3>
                <div className="space-y-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-base py-3">
                      Hover Effect
                    </Button>
                  </motion.div>
                  <Button disabled className="w-full text-base py-3">
                    Disabled Button
                  </Button>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-base py-3">
                    <Bell className="mr-2 h-5 w-5" />
                    Success State
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Cards Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 p-10 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">카드 컴포넌트</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <motion.div whileHover={{ y: -5 }}>
                <Card className="bg-white/70 border-gray-200 p-8 h-full shadow-md">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">사용자 프로필</h3>
                      <p className="text-gray-500 text-base">개인정보 관리</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    사용자의 개인정보와 설정을 관리할 수 있는 카드입니다.
                  </p>
                  <div className="mt-6 flex space-x-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-sm">
                      프로필
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 text-gray-600 text-sm">
                      설정
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5 }}>
                <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 p-8 h-full shadow-md">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Lock className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">보안 설정</h3>
                      <p className="text-gray-500 text-base">계정 보안 강화</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    2단계 인증과 비밀번호 관리로 계정을 안전하게 보호합니다.
                  </p>
                  <div className="mt-6">
                    <Badge variant="destructive" className="bg-red-100 text-red-700 text-sm">
                      중요
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -5 }}>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 p-8 h-full shadow-md">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Bell className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-semibold text-lg">알림 센터</h3>
                      <p className="text-gray-500 text-base">실시간 알림</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-base leading-relaxed">
                    중요한 업데이트와 메시지를 실시간으로 받아보세요.
                  </p>
                  <div className="mt-6">
                    <Badge className="bg-green-100 text-green-700 text-sm">
                      활성
                    </Badge>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.section>

          {/* Form Controls Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 p-10 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">폼 컨트롤</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="text-gray-700 mb-3 block text-lg font-medium">이메일 주소</label>
                  <Input 
                    placeholder="example@email.com" 
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 text-base py-3"
                  />
                </div>
                
                <div>
                  <label className="text-gray-700 mb-3 block text-lg font-medium">비밀번호</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 text-base py-3"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Checkbox id="remember" className="border-gray-300" />
                  <label htmlFor="remember" className="text-gray-700 text-base">
                    로그인 상태 유지
                  </label>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-700 text-lg font-medium">진행률</label>
                    <span className="text-gray-500 text-base">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <Button 
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                    size="sm" 
                    className="mt-4 text-base"
                  >
                    진행률 증가
                  </Button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-700 text-lg font-medium">볼륨</label>
                    <span className="text-gray-500 text-base">{sliderValue[0]}%</span>
                  </div>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-gray-700 text-lg font-medium">알림 활성화</label>
                  <Switch
                    checked={isNotificationEnabled}
                    onCheckedChange={setIsNotificationEnabled}
                  />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Interactive Elements */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 p-10 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">인터랙티브 요소</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-8 bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center justify-center w-18 h-18 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6 mx-auto">
                  <Heart className="h-9 w-9 text-white" />
                </div>
                <h3 className="text-gray-900 text-center font-semibold text-lg">Hover Effect</h3>
                <p className="text-gray-600 text-base text-center mt-3">
                  마우스를 올려보세요
                </p>
              </motion.div>

              <motion.div
                whileHover={{ rotate: 5 }}
                className="p-8 bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center justify-center w-18 h-18 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-6 mx-auto">
                  <Star className="h-9 w-9 text-white" />
                </div>
                <h3 className="text-gray-900 text-center font-semibold text-lg">Rotate Effect</h3>
                <p className="text-gray-600 text-base text-center mt-3">
                  회전 애니메이션
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -10 }}
                className="p-8 bg-gradient-to-br from-green-100 to-emerald-100 border border-green-200 rounded-2xl cursor-pointer"
              >
                <div className="flex items-center justify-center w-18 h-18 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 mx-auto">
                  <Sparkles className="h-9 w-9 text-white" />
                </div>
                <h3 className="text-gray-900 text-center font-semibold text-lg">Float Effect</h3>
                <p className="text-gray-600 text-base text-center mt-3">
                  부유 애니메이션
                </p>
              </motion.div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}