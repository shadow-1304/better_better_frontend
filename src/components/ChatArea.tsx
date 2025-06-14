import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Lightbulb, MessageSquare, Settings, HelpCircle, Mic } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import AnimatedAvatar from './AnimatedAvatar';

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

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

// User type for mentions
interface User {
  id: number;
  name: string;
}

const ChatArea: React.FC = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(6);
  const [thinkingCounter, setThinkingCounter] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  // Mention related states
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<User[]>([]);
  const [mentionIndex, setMentionIndex] = useState(-1);

  // User data for mentions
  const users: User[] = [
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

  // WebSocket connection setup
  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8080');

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        console.log('Received WebSocket message:', event.data);
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            const aiResponse: Message = {
              id: messages.length + 1,
              text: data.text,
              sender: 'ai',
              timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          setTimeout(connectWebSocket, 3000 * reconnectAttempts.current);
        } else {
          console.error('Max WebSocket reconnect attempts reached');
          setMessages(prev => [...prev, {
            id: messages.length + 1,
            text: 'Connection to server lost. Please try again later.',
            sender: 'ai',
            timestamp: new Date()
          }]);
        }
      };
    };

    connectWebSocket();

    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Speech recognition setup
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        setTranscription(finalTranscript + interimTranscript);
        setMessage(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscription('Error occurred during speech recognition.');
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current?.start();
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser.');
      setTranscription('Speech recognition is not supported in this browser.');
    }

    return () => {
      recognitionRef.current?.stop();
    };
  }, [isListening]);

  // Thinking timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isThinking) {
      setThinkingCounter(thinkingTime);
      timer = setInterval(() => {
        setThinkingCounter((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsThinking(false);
            const aiResponse: Message = {
              id: messages.length + 1,
              text: "After careful consideration, here's my response: I'm LineoMatic AI, specialized in paper manufacturing and production optimization. I'm here to help you with any questions about papermaking processes, quality control, troubleshooting, and efficiency improvements.",
              sender: 'ai',
              timestamp: new Date()
            };
            setMessages((prev) => [...prev, aiResponse]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isThinking, thinkingTime, messages]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setTranscription('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscription('');
      setMessage('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const insertMention = (name: string) => {
    const atIndex = message.lastIndexOf('@');
    const newMessage = message.slice(0, atIndex) + '@' + name + ' ';
    setMessage(newMessage);
    setMentionSuggestions([]);
    setMentionIndex(-1);
  };

  const handleSendMessage = (messageText?: string, useThinkMode: boolean = false) => {
    const textToSend = messageText || message;
    if (textToSend.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: textToSend,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setTranscription('');
      setSuggestions([]);
      setMentionSuggestions([]);

      // Send message to WebSocket server
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ text: textToSend }));
      } else {
        setMessages(prev => [...prev, {
          id: messages.length + 1,
          text: 'Failed to send message. Server is disconnected.',
          sender: 'ai',
          timestamp: new Date()
        }]);
      }
      
      if (useThinkMode) {
        setIsThinking(true);
      } else {
        setTimeout(() => {
          const aiResponse: Message = {
            id: messages.length + 1,
            text: "Thank you for your message! I'm LineoMatic AI, specialized in paper manufacturing and production optimization. I'm here to help you with any questions about papermaking processes, quality control, troubleshooting, and efficiency improvements.",
            sender: 'ai',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      }
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
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="whatsapp-pattern"></div>
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <AnimatedAvatar toggleListening={toggleListening} isListening={isListening} />
          
          <div className={`welcome-message ${theme} mb-8`}>
            <h2 className="text-2xl font-semibold mb-2">
              Hello, I'm LineoMatic AI!
            </h2>
            <p className="text-base opacity-80">
              Your intelligent assistant for paper manufacturing and production optimization.
              How can I help you today?
            </p>
          </div>

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
              <AnimatedAvatar toggleListening={toggleListening} isListening={isListening} />
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
                    p-4 rounded-2xl shadow-md
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
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="max-w-3xl flex items-start space-x-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}
                  `}>
                    <Bot size={20} className={theme === 'dark' ? 'text-teal-400' : 'text-teal-600'} />
                  </div>
                  
                  <div className={`
                    message-card ${theme}
                    ${aiCardBg}
                    ${textColor}
                    relative overflow-hidden p-4 rounded-2xl shadow-md
                  `}>
                    <div className="absolute top-0 left-0 w-full h-1.5">
                      <div className={`
                        absolute h-full w-[200%] animate-streamline
                        ${theme === 'dark' ? 'bg-teal-400' : 'bg-teal-600'}
                      `} style={{
                        backgroundImage: theme === 'dark' 
                          ? 'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.8) 50%, transparent 100%)'
                          : 'linear-gradient(90deg, transparent 0%, rgba(13,148,136,0.8) 50%, transparent 100%)'
                      }}></div>
                    </div>
                    
                    <div className="pt-4 pb-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="text-sm font-semibold">Processing your request...</p>
                      </div>
                      
                      <div className="flex space-x-1 mt-3">
                        {[...Array(12)].map((_, i) => (
                          <div 
                            key={i}
                            className={`
                              h-2 flex-1 rounded-full
                              ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}
                              animate-pulse
                            `}
                            style={{
                              animationDelay: `${i * 0.1}s`,
                              opacity: 0.3 + (i % 3) * 0.2
                            }}
                          ></div>
                        ))}
                      </div>
                      
                      <p className="text-sm leading-relaxed mt-3 italic">
                        Analyzing: "{messages[messages.length - 1]?.text || ''}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`
        p-6 border-t transition-theme relative z-10
        ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}
      `}>
        {transcription && (
          <div className={`
            max-w-4xl mx-auto mb-4 p-3 rounded-lg text-sm
            ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
          `}>
            {transcription}
          </div>
        )}
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={toggleListening}
            className={`
              mic-button ${theme}
              p-4 rounded-full transition-all duration-200 cursor-pointer shadow-lg
              ${theme === 'dark' 
                ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-black' 
                : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
              }
              hover:scale-110
              hover:shadow-[0_0_30px_rgba(0,229,255,0.6)]
              ${isListening ? 'animate-pulse' : ''}
            `}
          >
            <Mic size={20} />
          </button>
          
          <div className="flex-1 relative">
            <div className="relative">
              <div className="absolute inset-0 pointer-events-none flex items-center pl-3 pr-12 whitespace-pre">
                <span className="invisible">{message}</span>
                {suggestions.length > 0 && (
                  <span className={`opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {suggestions[0]?.slice(message.length) || ''}
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
                }}
                onKeyDown={(e) => {
                  // Handle mention suggestions
                  if (mentionSuggestions.length > 0) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setMentionIndex((prev) => (prev + 1) % mentionSuggestions.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setMentionIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
                    } else if ((e.key === 'Enter' || e.key === 'Tab') && mentionSuggestions.length > 0) {
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
                    } else if (e.key === 'Enter' && selectedIndex >= 0) {
                      e.preventDefault();
                      setMessage(suggestions[selectedIndex]);
                      setSuggestions([]);
                      setSelectedIndex(-1);
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
                  w-full px-4 py-3 rounded-full shadow-inner
                  ${inputBg} ${textColor} ${placeholderColor}
                  focus:outline-none focus:ring-2 focus:ring-teal-500
                  transition-all duration-300 relative bg-transparent z-10
                `}
              />
              
              {mentionSuggestions.length > 0 && (
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
            </div>
          </div>

          <button
            onClick={() => handleSendMessage(undefined, true)}
            disabled={!message.trim()}
            className={`
              p-3 rounded-full transition-all duration-200
              ${theme === 'dark' 
                ? 'text-teal-400 hover:bg-teal-400 hover:bg-opacity-10' 
                : 'text-teal-600 hover:bg-teal-600 hover:bg-opacity-10'
              }
              ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title="Think"
          >
            <Lightbulb size={20} />
          </button>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!message.trim()}
            className={`
              p-3 rounded-full transition-all duration-200
              ${theme === 'dark' 
                ? 'bg-teal-500 text-gray-900 hover:bg-teal-400' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
              }
              ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}
              shadow-md hover:shadow-lg
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