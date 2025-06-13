import * as LucideIcons from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AnimatedAvatar from './AnimatedAvatar';
import { Send, User, Bot } from 'lucide-react';
import rawSuggestionsData from '../data/suggestion.json';
import { Settings, Lightbulb, MessageSquare, HelpCircle } from 'lucide-react';
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
const iconMap = {
  Settings,
  Lightbulb,
  MessageSquare,
  HelpCircle,
} as const;

interface SuggestionCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}
interface SuggestionDataItem {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof iconMap; // restrict icon keys to LucideIcons keys
  prompt: string;
}


const ChatArea: React.FC = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestionCards, setSuggestionCards] = useState<SuggestionCard[]>([]);
  const suggestionsData: SuggestionDataItem[] = rawSuggestionsData;


  useEffect(() => {
    const mapped = suggestionsData.map((item) => {
      const IconComponent = iconMap[item.icon];
      return {
        ...item,
        icon: IconComponent ? <IconComponent size={20} /> : null,
      };
    });
    setSuggestionCards(mapped);
  }, []);



  const chatBg = theme === 'dark' ? 'bg-black' : 'bg-beige';
  const cardBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const userCardBg = theme === 'dark' ? 'bg-teal-900' : 'bg-teal-50';
  const aiCardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const inputBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const placeholderColor = theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400';

  const handleSendMessage = (messageText?: string) => {
    const textToSend = messageText || message;
    if (textToSend.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: textToSend,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages([...messages, newMessage]);
      setMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: messages.length + 2,
          text: "Thank you for your message! I'm LineoMatic AI, specialized in paper manufacturing and production optimization. I'm here to help you with any questions about papermaking processes, quality control, troubleshooting, and efficiency improvements.",
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: SuggestionCard) => {
    handleSendMessage(suggestion.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex-1 ${chatBg} transition-theme flex flex-col relative overflow-hidden`}>
      {/* WhatsApp-style background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="whatsapp-pattern"></div>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <AnimatedAvatar />

          <div className={`welcome-message ${theme} mb-8`}>
            <h2 className="text-2xl font-semibold mb-2">
              Hello, I'm LineoMatic AI!
            </h2>
            <p className="text-base opacity-80">
              Your intelligent assistant for paper manufacturing and production optimization.
              How can I help you today?
            </p>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
            {suggestionCards.map((suggestion) => (
              <div
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  suggestion-card ${theme}
                  ${cardBg} ${textColor}
                  p-6 rounded-2xl cursor-pointer transition-all duration-300
                  hover:scale-105 hover:shadow-xl
                  border-2 border-transparent hover:border-teal-400
                  group
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className={`
                    p-3 rounded-full transition-all duration-300
                    ${theme === 'dark'
                      ? 'bg-teal-400 bg-opacity-20 text-teal-400 group-hover:bg-opacity-30'
                      : 'bg-teal-600 bg-opacity-20 text-teal-600 group-hover:bg-opacity-30'
                    }
                  `}>
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className={`
                      font-semibold text-lg mb-2 transition-colors duration-300
                      ${theme === 'dark'
                        ? 'text-teal-400 group-hover:text-teal-300'
                        : 'text-teal-600 group-hover:text-teal-700'
                      }
                    `}>
                      {suggestion.title}
                    </h3>
                    <p className="text-sm opacity-70 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-center mb-8">
              <AnimatedAvatar />
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-3xl flex items-start space-x-3
                  ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}
                `}>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${msg.sender === 'user'
                      ? theme === 'dark' ? 'bg-teal-600' : 'bg-teal-500'
                      : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }
                  `}>
                    {msg.sender === 'user' ? (
                      <User size={20} className="text-white" />
                    ) : (
                      <Bot size={20} className={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'} />
                    )}
                  </div>

                  <div className={`
                    message-card ${theme}
                    ${msg.sender === 'user' ? userCardBg : aiCardBg}
                    ${textColor}
                  `}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`
                      text-xs mt-2 opacity-60
                      ${msg.sender === 'user' ? 'text-right' : 'text-left'}
                    `}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`
        p-6 border-t transition-theme relative z-10
        ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}
      `}>
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className={`
                chat-input ${theme}
                ${inputBg} ${textColor} ${placeholderColor}
                pr-12
              `}
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!message.trim()}
            className={`
              send-button ${theme}
              ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;