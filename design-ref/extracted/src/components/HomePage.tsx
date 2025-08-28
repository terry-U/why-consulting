import { motion } from 'motion/react';
import { MessageCircle, Sparkles, Zap, Shield, Brain, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface HomePageProps {
  onNavigateToChat: () => void;
}

export function HomePage({ onNavigateToChat }: HomePageProps) {
  const features = [
    {
      icon: Brain,
      title: '지능형 AI',
      description: '최신 AI 기술로 정확하고 개인화된 상담을 제공합니다.',
      gradient: 'from-purple-100 to-pink-100',
      iconGradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: '실시간 응답',
      description: '즉시 응답하여 빠르고 효율적인 상담 경험을 제공합니다.',
      gradient: 'from-blue-100 to-cyan-100',
      iconGradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: '안전한 상담',
      description: '모든 대화는 암호화되어 개인정보를 안전하게 보호합니다.',
      gradient: 'from-green-100 to-emerald-100',
      iconGradient: 'from-green-500 to-emerald-500'
    }
  ];

  const quickStartReasons = [
    "스트레스 관리가 필요해요",
    "진로 상담을 받고 싶어요",
    "인간관계 고민이 있어요",
    "감정 정리가 필요해요"
  ];

  return (
    <div className="relative min-h-screen pb-20 md:pb-0">
      {/* Hero Section - Mobile Optimized */}
      <section className="relative px-4 pt-8 sm:pt-16 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative inline-block mb-6 sm:mb-8">
              <motion.div
                className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{ backgroundSize: '200% 200%' }}
              >
                AI 상담사
              </motion.div>
              <motion.div
                className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-purple-300/40 via-pink-300/40 to-blue-300/40 rounded-3xl blur-2xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </div>
          </motion.div>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2"
          >
            미래를 만나다. 언제든지 당신의 고민을 들어줄 {' '}
            <span className="text-purple-600 font-semibold">인공지능 상담사</span>가 여기 있습니다.
          </motion.p>

          {/* Main CTA Button */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8 sm:mb-12"
          >
            <Button
              onClick={onNavigateToChat}
              size="lg"
              className="relative group bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl shadow-2xl shadow-purple-500/25 text-base sm:text-lg w-full sm:w-auto"
            >
              <div className="flex items-center justify-center space-x-3">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>지금 상담 시작하기</span>
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform" />
              </div>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"
                whileHover={{ scale: 1.05 }}
              />
            </Button>
          </motion.div>

          {/* Quick Start Reasons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-gray-500 text-sm mb-4">이런 고민이 있으신가요?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickStartReasons.map((reason, index) => (
                <motion.button
                  key={index}
                  onClick={onNavigateToChat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 bg-white/70 border border-gray-200 rounded-xl text-gray-700 hover:bg-white/90 hover:border-purple-300 transition-all text-sm font-medium text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span>{reason}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-16 left-4 w-16 h-16 sm:w-20 sm:h-20 bg-purple-300/30 rounded-full blur-xl"
          animate={{
            y: [0, -15, 0],
            x: [0, 8, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-32 right-8 w-12 h-12 sm:w-16 sm:h-16 bg-pink-300/30 rounded-full blur-xl"
          animate={{
            y: [0, 12, 0],
            x: [0, -12, 0],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
      </section>

      {/* Features Section - Mobile Optimized */}
      <section className="relative px-4 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              왜 AI 상담사를 선택해야 할까요?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed px-2">
              최첨단 기술과 인간적인 따뜻함이 만나 완전히 새로운 상담 경험을 제공합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="relative group"
                >
                  <div className={`relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${feature.gradient} border border-white/60 hover:border-white/80 transition-all duration-300 shadow-lg h-full`}>
                    <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                      <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br ${feature.iconGradient} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-purple-100/60 via-pink-100/60 to-blue-100/60 backdrop-blur-xl border border-gray-200/60 shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-3xl" />
            
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Sparkles className="h-12 w-12 sm:h-16 sm:w-16 text-purple-600" />
                  <div className="absolute inset-0 h-12 w-12 sm:h-16 sm:w-16 bg-purple-400/30 rounded-full blur-lg" />
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                지금 바로 시작해보세요
              </h2>
              <p className="text-gray-700 text-base sm:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                24시간 언제든지 이용 가능한 AI 상담사와 함께 새로운 경험을 시작해보세요.
              </p>
              
              <Button
                onClick={onNavigateToChat}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 sm:px-16 py-4 sm:py-5 rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 text-base sm:text-lg w-full sm:w-auto"
              >
                <div className="flex items-center justify-center space-x-3">
                  <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span>상담 시작하기</span>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}