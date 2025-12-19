'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, User, Bot, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface ChatMessage {
  sender: 'user' | 'ai' | 'admin';
  message: string;
  createdAt: string;
}

function renderMessageWithLinks(text: string, isUser: boolean = false) {
  if (isUser) return text;
  
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;
  
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>);
    }
    
    elements.push(
      <a
        key={`link-${match.index}`}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
      >
        {match[1]}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    const urlRegex = /(https?:\/\/[^\s.,!?)]+)/g;
    const parts = remaining.split(urlRegex);
    
    parts.forEach((part, i) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0;
        const displayUrl = part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
        elements.push(
          <a
            key={`rawlink-${lastIndex}-${i}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:opacity-80"
          >
            {displayUrl}
          </a>
        );
      } else if (part) {
        elements.push(<span key={`remaining-${lastIndex}-${i}`}>{part}</span>);
      }
    });
  }
  
  return elements.length > 0 ? elements : text;
}

const SESSION_TIMEOUT_MINUTES = 10;
const GREETING_MESSAGE = "Halo! Ada yang bisa kami bantu? Ketik pertanyaan Anda di sini.";

export default function LivechatWidget() {
  const { user, loading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingAdmin, setIsWaitingAdmin] = useState(false);
  const [hasAdminReplied, setHasAdminReplied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsHydrated(true);
    
    const savedSessionId = localStorage.getItem('livechat_session');
    const lastActivity = localStorage.getItem('livechat_last_activity');
    
    if (savedSessionId && lastActivity) {
      const lastTime = parseInt(lastActivity, 10);
      const now = Date.now();
      const minutesElapsed = (now - lastTime) / (1000 * 60);
      
      if (minutesElapsed >= SESSION_TIMEOUT_MINUTES) {
        localStorage.removeItem('livechat_session');
        localStorage.removeItem('livechat_last_activity');
        setShowGreeting(true);
      } else {
        setSessionId(savedSessionId);
        fetchMessages(savedSessionId);
      }
    } else if (!savedSessionId) {
      const greetingDismissed = localStorage.getItem('livechat_greeting_dismissed');
      if (!greetingDismissed) {
        setTimeout(() => setShowGreeting(true), 3000);
      }
    }
  }, []);

  useEffect(() => {
    if (!sessionId || !isOpen) return;

    const interval = setInterval(() => {
      fetchMessages(sessionId);
      checkSessionExpiry();
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, isOpen]);

  const updateLastActivity = () => {
    localStorage.setItem('livechat_last_activity', Date.now().toString());
  };

  const checkSessionExpiry = () => {
    const lastActivity = localStorage.getItem('livechat_last_activity');
    if (!lastActivity) return;
    
    const lastTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const minutesElapsed = (now - lastTime) / (1000 * 60);
    
    if (minutesElapsed >= SESSION_TIMEOUT_MINUTES) {
      expireSession();
    }
  };

  const expireSession = () => {
    localStorage.removeItem('livechat_session');
    localStorage.removeItem('livechat_last_activity');
    setSessionId(null);
    setMessages([]);
    setIsWaitingAdmin(false);
    setHasAdminReplied(false);
    setIsOpen(false);
  };

  const fetchMessages = async (sid: string) => {
    try {
      const res = await fetch('/api/livechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages', sessionId: sid }),
      });
      const data = await res.json();
      if (data.success && data.messages) {
        const newMessages = data.messages as ChatMessage[];
        setMessages(newMessages);
        
        const hasAdminMessage = newMessages.some(m => m.sender === 'admin');
        if (hasAdminMessage) {
          setIsWaitingAdmin(false);
          setHasAdminReplied(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const startSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/livechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionId(data.sessionId);
        setMessages(data.messages);
        localStorage.setItem('livechat_session', data.sessionId);
        updateLastActivity();
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    updateLastActivity();

    setMessages(prev => [...prev, {
      sender: 'user',
      message: userMessage,
      createdAt: new Date().toISOString(),
    }]);

    try {
      const res = await fetch('/api/livechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', sessionId, message: userMessage }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.waitingAdmin) {
          setIsWaitingAdmin(true);
        } else if (data.reply) {
          setMessages(prev => [...prev, data.reply]);
        }
        updateLastActivity();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        sender: 'ai',
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAdmin = async () => {
    if (!sessionId || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/livechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_admin', sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.waitingAdmin) {
          setIsWaitingAdmin(true);
        }
      }
    } catch (error) {
      console.error('Failed to request admin:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowGreeting(false);
    localStorage.setItem('livechat_greeting_dismissed', 'true');
    if (!sessionId) {
      startSession();
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const dismissGreeting = () => {
    setShowGreeting(false);
    localStorage.setItem('livechat_greeting_dismissed', 'true');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const newChat = () => {
    localStorage.removeItem('livechat_session');
    setSessionId(null);
    setMessages([]);
    setIsWaitingAdmin(false);
    setHasAdminReplied(false);
    startSession();
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimating(false);
    }, 200);
  };

  if (!isHydrated || authLoading) return null;
  
  if (user) return null;

  return (
    <>
      {showGreeting && !isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-fade-in-up">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 max-w-[280px] border border-gray-200 dark:border-gray-700">
            <button
              onClick={dismissGreeting}
              className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Dismiss greeting"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Saldopedia Support</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{GREETING_MESSAGE}</p>
              </div>
            </div>
            <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
          </div>
        </div>
      )}

      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ease-out ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 hover:scale-110'
        }`}
        aria-label="Open live chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out origin-bottom-right ${
        isOpen && !isAnimating ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      }`}>
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Saldopedia Support</h3>
                <p className="text-xs text-blue-100">
                  {isWaitingAdmin ? 'Menunggu admin...' : 'AI Assistant'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={newChat}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
              >
                Chat Baru
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-white/20 p-1 rounded transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : msg.sender === 'admin'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}>
                    {msg.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : msg.sender === 'admin' ? (
                      <Headphones className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : msg.sender === 'admin'
                        ? 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 rounded-bl-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-sm'
                  }`}>
                    {renderMessageWithLinks(msg.message, msg.sender === 'user')}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isWaitingAdmin && !isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-green-700 dark:text-green-300">Admin mengetik...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!isWaitingAdmin && !hasAdminReplied && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                onClick={requestAdmin}
                disabled={isLoading || !sessionId}
                className="w-full text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 py-1 flex items-center justify-center gap-1 transition-colors"
              >
                <Headphones className="w-3 h-3" />
                Chat dengan Admin
              </button>
            </div>
          )}

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
    </>
  );
}
