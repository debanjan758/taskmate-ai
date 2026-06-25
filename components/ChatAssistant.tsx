'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles,
  Loader2 
} from 'lucide-react';
import { getChatResponse } from '@/lib/chatService';
import type { ChatMessage, Task } from '@/lib/types';
import { format } from 'date-fns';

interface ChatAssistantProps {
  currentTask?: Task;
  allTasks?: Task[];
}

export default function ChatAssistant({ currentTask, allTasks = [] }: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI productivity assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      taskContext: currentTask?.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await getChatResponse(
        input,
        messages,
        currentTask,
        allTasks
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        taskContext: currentTask?.id
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble right now. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Quick actions
  const quickActions = [
    "What should I do next?",
    "Help me prioritize",
    "Break down my current task",
    "How can I stay focused?"
  ];

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 z-50 transition-all duration-200 hover:scale-110 active:scale-95 animate-pulseGlow"
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed shadow-2xl z-50 transition-all duration-300 animate-slideUp
      ${isMinimized 
        ? 'bottom-4 right-4 w-[90vw] max-w-xs h-14' 
        : 'bottom-0 right-0 left-0 md:bottom-6 md:right-6 md:left-auto w-full md:w-96 h-[85vh] md:h-[600px] md:rounded-lg rounded-t-lg'
      }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
          <h3 className="font-semibold text-sm md:text-base">AI Assistant</h3>
          {currentTask && (
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded animate-fadeIn">
              Helping with task
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-all duration-200"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 h-[350px] md:h-[420px] hide-scrollbar">
            {messages.map((message, index) => (
              <div
                key={message.id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className={`flex animate-fadeIn ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg p-3 transition-all duration-200 hover:scale-105 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-800 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {format(message.timestamp, 'HH:mm')}
                  </span>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <span className="text-sm text-gray-600 animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-3 md:px-4 pb-2 animate-fadeIn">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-100 hover:to-purple-100 px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 md:p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 text-sm md:text-base transition-all duration-200 focus:ring-2 focus:ring-purple-500"
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="icon"
                className="shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}