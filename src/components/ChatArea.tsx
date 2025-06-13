import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, MessageSquare, Settings, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AnimatedAvatar from './AnimatedAvatar';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface SuggestionCard {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const ChatArea: React.FC = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  useEffect(() => {
    if (message.trim() === '') {
      setSuggestions([]);
      return;
    }

    const staticSuggestions = [
      "How can I help you today?",
      "What are you looking for?",
      "Do you need assistance with anything?",
      "Let me know if you have a question.",
    ];

    const filtered = staticSuggestions.filter(s =>
      s.toLowerCase().startsWith(message.toLowerCase())
    );

    setSuggestions(filtered);
  }, [message]);


  const suggestionCards: SuggestionCard[] = [
    {
      id: 1,
      title: "Paper Manufacturing",
      description: "Learn about modern papermaking processes",
      icon: <Settings size={20} />,
      prompt: "Tell me about modern paper manufacturing processes and technologies"
    },
    {
      id: 2,
      title: "Production Optimization",
      description: "Optimize your production line efficiency",
      icon: <Lightbulb size={20} />,
      prompt: "How can I optimize my paper production line for better efficiency?"
    },
    {
      id: 3,
      title: "Quality Control",
      description: "Improve paper quality standards",
      icon: <MessageSquare size={20} />,
      prompt: "What are the best practices for paper quality control and testing?"
    },
    {
      id: 4,
      title: "Troubleshooting",
      description: "Get help with common issues",
      icon: <HelpCircle size={20} />,
      prompt: "Help me troubleshoot common papermaking machine problems"
    }
  ];

  const chatBg = theme === 'dark' ? 'bg-black' : 'bg-beige';
  const cardBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const userCardBg = theme === 'dark' ? 'bg-teal-900' : 'bg-teal-50';
  const aiCardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';
  const inputBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const placeholderColor = theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400';

  const users = [
    { id: 1, name: 'Parth Patel' },
    { id: 2, name: 'Parth Sharma' },
    { id: 3, name: 'Parth maniya' },
    { id: 4, name: 'Dhruvi Ramani' },
    { id: 5, name: 'Gopi Patel' },
    { id: 6, name: 'dev narayan' },
    { id: 7, name: 'saneha kukreja' },
    { id: 8, name: 'saneha patel' },
    { id: 9, name: 'nayan shah' },
  ];

  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<typeof users>([]);
  const [mentionIndex, setMentionIndex] = useState(-1);


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

  const insertMention = (name: string) => {
    const atIndex = message.lastIndexOf('@');
    const newMessage = message.slice(0, atIndex) + '@' + name + ' ';
    setMessage(newMessage);
    setMentionSuggestions([]);
    setMentionIndex(-1);
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
          <div className="flex-1 relative relative font-inherit">
            <div className="absolute inset-0 pointer-events-none flex items-center pl-3 pr-12 whitespace-pre">
              <span className="invisible">{message}</span>
              {suggestions.length > 0 && (
                <span className={`opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-black'}`}>
                  {suggestions[0].slice(message.length)}
                </span>
              )}
            </div>
            <input
              type="text"
              value={message}
              onChange={(e) => {
                const val = e.target.value;
                setMessage(val);
                setSelectedIndex(-1);

                const atIndex = val.lastIndexOf('@');
                if (atIndex >= 0) {
                  const query = val.slice(atIndex + 1);
                  if (query.length > 0) {
                    const matches = users.filter(u =>
                      u.name.toLowerCase().startsWith(query.toLowerCase())
                    );
                    setMentionQuery(query);
                    setMentionSuggestions(matches);
                  } else {
                    setMentionSuggestions([]);
                  }
                } else {
                  setMentionSuggestions([]);
                }
              }
              }
              onKeyDown={(e) => {
                // Handle mention suggestions
                if (mentionSuggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
                  } else if ((e.key === 'Enter' || e.key === 'Tab')) {
                    e.preventDefault();
                    if (mentionIndex >= 0) {
                      insertMention(mentionSuggestions[mentionIndex].name);
                    } else {
                      insertMention(mentionSuggestions[0].name);
                    }
                  }
                  return;
                }

                // Handle static suggestions
                if (suggestions.length > 0) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev + 1) % suggestions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                      setMessage(suggestions[selectedIndex]);
                      setSuggestions([]);
                      setSelectedIndex(-1);
                    }
                  } else if (e.key === 'Tab') {
                    e.preventDefault();
                    setMessage(suggestions[0]);
                    setSuggestions([]);
                    setSelectedIndex(-1);
                  }
                }
              }}

              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className={`
      chat-input ${theme}
      ${inputBg} ${textColor} ${placeholderColor}
      pr-12 w-full relative bg-transparent z-10
    `}
            />
            {mentionSuggestions.length > 1 && (
              <div className={`
    absolute left-0 bottom-full mb-2 w-full z-50 max-h-48 overflow-y-auto rounded-xl shadow-xl
    border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
  `}>
                {mentionSuggestions.map((user, idx) => (
                  <div
                    key={user.id}
                    onClick={() => insertMention(user.name)}
                    className={`
          px-4 py-2 text-sm cursor-pointer flex items-center transition-colors
          ${idx === mentionIndex
                        ? theme === 'dark'
                          ? 'bg-teal-700 text-white'
                          : 'bg-teal-100 text-gray-900'
                        : theme === 'dark'
                          ? 'hover:bg-gray-800 text-gray-300'
                          : 'hover:bg-gray-100 text-gray-700'
                      }
        `}
                  >
                    <User size={16} className="mr-2" />
                    {user.name}
                  </div>
                ))}
              </div>
            )}



            {mentionSuggestions.length === 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '12px',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
                  fontSize: '0.875rem',
                  zIndex: 0,
                  whiteSpace: 'pre',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ visibility: 'hidden' }}>{message}</span>
                <span style={{ opacity: 0.5 }}>
                  @{mentionSuggestions[0].name.slice(mentionQuery.length)}
                </span>
              </div>
            )}


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