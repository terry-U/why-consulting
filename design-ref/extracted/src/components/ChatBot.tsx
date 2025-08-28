import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, User, Bot, RefreshCw, Heart, Smile, Star, ArrowUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  emotion?: 'positive' | 'neutral' | 'supportive';
}

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! 저는 AI 상담사입니다.\n\n무엇을 도와드릴까요? 편안하게 말씀해 주세요.',
      sender: 'bot',
      timestamp: new Date(),
      emotion: 'positive'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botResponses = [
    { text: "그런 마음이 드시는군요.\n\n더 자세히 말씀해 주실 수 있나요?", emotion: 'supportive' },
    { text: "정말 힘드셨겠어요.\n\n당신의 감정을 충분히 이해합니다.", emotion: 'supportive' },
    { text: "좋은 관점이네요!\n\n어떤 부분이 가장 중요하다고 생각하시나요?", emotion: 'positive' },
    { text: "그 상황에서 어떤 감정을 느꼈는지\n말씀해 주세요.", emotion: 'neutral' },
    { text: "당신이 지금 느끼는 마음을 존중합니다.\n\n천천히 말씀해 주세요.", emotion: 'supportive' },
    { text: "흥미로운 이야기네요.\n\n그때 어떤 생각이 드셨나요?", emotion: 'positive' },
    { text: "충분히 공감이 갑니다.\n\n비슷한 경험을 하신 적이 있나요?", emotion: 'supportive' },
    { text: "정말 잘하고 계시네요.\n\n계속해서 말씀해 주세요.", emotion: 'positive' }
  ];

  const getBackgroundGradient = (emotion?: string, isLast: boolean = false) => {
    if (!isLast) return 'from-gray-50/30 to-gray-50/30';
    
    switch (emotion) {
      case 'positive':
        return 'from-green-100/40 via-emerald-100/30 to-green-50/40';
      case 'supportive':
        return 'from-blue-100/40 via-indigo-100/30 to-purple-50/40';
      case 'neutral':
      default:
        return 'from-gray-100/40 via-slate-100/30 to-gray-50/40';
    }
  };

  const getTextColor = (sender: string, emotion?: string) => {
    if (sender === 'user') return 'text-purple-800';
    
    switch (emotion) {
      case 'positive':
        return 'text-green-800';
      case 'supportive':
        return 'text-blue-800';
      case 'neutral':
      default:
        return 'text-gray-800';
    }
  };

  const typeWriter = (text: string, callback: () => void) => {
    let i = 0;
    setTypingText('');
    
    const typing = () => {
      if (i < text.length) {
        setTypingText(text.slice(0, i + 1));
        i++;
        setTimeout(typing, 50 + Math.random() * 100);
      } else {
        setTimeout(callback, 500);
      }
    };
    
    typing();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    // Add user message instantly
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Start typing animation for bot response
    setTimeout(() => {
      const response = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      typeWriter(response.text, () => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response.text,
          sender: 'bot',
          timestamp: new Date(),
          emotion: response.emotion as 'positive' | 'neutral' | 'supportive'
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        setTypingText('');
      });
    }, 800);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: '안녕하세요! 저는 AI 상담사입니다.\n\n무엇을 도와드릴까요? 편안하게 말씀해 주세요.',
        sender: 'bot',
        timestamp: new Date(),
        emotion: 'positive'
      }
    ]);
    setIsTyping(false);
    setTypingText('');
  };

  const quickActions = [
    "스트레스를 받고 있어요",
    "진로에 대해 고민이 많아요",
    "인간관계가 어려워요",
    "자신감이 부족해요",
    "요즘 우울한 기분이에요",
    "새로운 도전이 두려워요"
  ];

  const lastMessage = messages[messages.length - 1];

  return (
    <div className="h-screen flex flex-col overflow-hidden relative">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient(lastMessage?.emotion, true)} transition-all duration-1000`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(168,85,247,0.1),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.1),transparent_70%)]" />

      {/* Floating Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 p-4 sm:p-6 flex items-center justify-between backdrop-blur-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">AI 상담사</h1>
            <p className="text-xs sm:text-sm text-gray-600">언제나 함께</p>
          </div>
        </div>
        
        <Button
          onClick={clearChat}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 hover:bg-white/20"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Conversation Flow */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative z-10">
        <div className="min-h-full p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Speaker Indicator */}
                  <div className={`flex items-center space-x-3 mb-4 sm:mb-6 ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.sender === 'bot' && (
                      <>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                        <span className={`text-sm sm:text-base font-medium ${getTextColor(message.sender, message.emotion)}`}>
                          AI 상담사
                        </span>
                        {message.emotion && (
                          <div className={`${getTextColor(message.sender, message.emotion)} opacity-70`}>
                            {message.emotion === 'positive' && <Star className="h-4 w-4" />}
                            {message.emotion === 'supportive' && <Heart className="h-4 w-4" />}
                            {message.emotion === 'neutral' && <Smile className="h-4 w-4" />}
                          </div>
                        )}
                      </>
                    )}
                    
                    {message.sender === 'user' && (
                      <>
                        <span className={`text-sm sm:text-base font-medium ${getTextColor(message.sender)}`}>
                          나
                        </span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className="prose prose-lg sm:prose-xl max-w-none">
                      {message.content.split('\n').map((line, lineIndex) => (
                        <motion.p
                          key={lineIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: lineIndex * 0.1 }}
                          className={`${getTextColor(message.sender, message.emotion)} leading-relaxed mb-4 text-lg sm:text-xl md:text-2xl ${
                            message.sender === 'user' ? 'text-right' : 'text-left'
                          } ${lineIndex === 0 ? 'mt-0' : ''}`}
                        >
                          {line || '\u00A0'}
                        </motion.p>
                      ))}
                    </div>
                    
                    {/* Timestamp */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className={`text-xs sm:text-sm text-gray-500 mt-4 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -100, opacity: 0 }}
                  className="relative"
                >
                  {/* Speaker Indicator */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-gray-700">
                      AI 상담사
                    </span>
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-gray-500"
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  </div>

                  {/* Typing Text */}
                  <div className="prose prose-lg sm:prose-xl max-w-none">
                    {typingText.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex} className="text-gray-700 leading-relaxed mb-4 text-lg sm:text-xl md:text-2xl">
                        {line}
                        {lineIndex === typingText.split('\n').length - 1 && (
                          <motion.span
                            animate={{ opacity: [0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="inline-block w-0.5 h-6 bg-gray-400 ml-1"
                          />
                        )}
                      </p>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 p-4 sm:p-6 backdrop-blur-xl bg-white/30 border-t border-white/20"
      >
        {/* Quick Actions */}
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {quickActions.slice(0, 4).map((action, index) => (
              <motion.button
                key={index}
                onClick={() => setInputValue(action)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-2 bg-white/50 border border-white/30 rounded-full text-gray-700 hover:bg-white/70 transition-all text-sm font-medium backdrop-blur-sm"
              >
                {action}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="마음을 편하게 말씀해주세요..."
                className="bg-white/70 border-white/30 text-gray-900 placeholder-gray-600 py-4 px-6 rounded-full focus:ring-2 focus:ring-purple-400/50 focus:border-transparent text-base backdrop-blur-sm shadow-lg"
                disabled={isTyping}
              />
            </div>
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-full min-w-[60px] shadow-lg"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}