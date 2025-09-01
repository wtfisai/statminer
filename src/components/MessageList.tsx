'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  providerName: string;
  compact?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isStreaming = false, 
  providerName,
  compact = false 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  };

  const formatCost = (cost?: number) => {
    if (!cost) return null;
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className={`flex flex-col h-full ${compact ? 'text-sm' : ''}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <p className={compact ? 'text-xs' : 'text-sm'}>
                  Start a conversation with {providerName}
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-lg px-4 py-2 
                    ${compact ? 'px-2 py-1 text-xs' : 'px-4 py-2'}
                    ${message.role === 'user'
                      ? 'bg-cyan-500 text-white ml-auto'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }
                  `}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                  </div>
                  
                  <div className={`flex items-center justify-between mt-1 ${compact ? 'text-xs' : 'text-xs'} opacity-70`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    
                    {message.metadata && (
                      <div className="flex items-center space-x-2">
                        {message.metadata.tokensUsed && (
                          <span title="Tokens used">
                            🎯 {message.metadata.tokensUsed}
                          </span>
                        )}
                        {message.metadata.responseTime && (
                          <span title="Response time">
                            ⚡ {message.metadata.responseTime}ms
                          </span>
                        )}
                        {message.metadata.cost && (
                          <span title="Cost">
                            💰 {formatCost(message.metadata.cost)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        
        {/* Streaming Indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {providerName} is thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;