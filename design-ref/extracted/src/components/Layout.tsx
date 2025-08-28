import { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Palette, Home, Sparkles, Menu, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'chat', label: '채팅', icon: MessageCircle },
    { id: 'components', label: '컴포넌트', icon: Palette },
  ];

  // Chat page gets full-screen treatment
  if (currentPage === 'chat') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-200/30 via-purple-200/30 to-pink-200/30" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,theme(colors.blue.300/20),transparent_50%)]" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.purple.300/20),transparent_50%)]" />
      
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-50 border-b border-gray-200/60 backdrop-blur-xl bg-white/70"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            <motion.div 
              className="flex items-center space-x-2 sm:space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
                <div className="absolute inset-0 h-8 w-8 sm:h-10 sm:w-10 bg-purple-400/30 rounded-full blur-lg" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI 상담사
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`relative px-4 sm:px-5 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${
                      currentPage === item.id
                        ? 'text-gray-900 bg-gray-100/80'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/60'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>{item.label}</span>
                    </div>
                    {currentPage === item.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-200/40 to-pink-200/40 rounded-xl"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <motion.button
              className="md:hidden text-gray-600 hover:text-gray-900 p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMenuOpen ? 'auto' : 0, 
            opacity: isMenuOpen ? 1 : 0 
          }}
          className="md:hidden overflow-hidden border-t border-gray-200/60 bg-white/90 backdrop-blur-xl"
        >
          <div className="px-4 py-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    currentPage === item.id
                      ? 'text-gray-900 bg-gray-100/80'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/60'
                  }`}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation for quick access */}
      {currentPage !== 'chat' && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 left-4 right-4 md:hidden z-40"
        >
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-2xl p-2">
            <div className="flex justify-around">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${
                      currentPage === item.id
                        ? 'text-purple-600 bg-purple-100'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}