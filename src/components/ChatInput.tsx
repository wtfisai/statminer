'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
}) => {
  const [message, setMessage] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsMultiline(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Enter' && e.shiftKey) {
      setIsMultiline(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      setIsMultiline(textareaRef.current.scrollHeight > 60);
    }
  };

  useEffect(() => {
    if (textareaRef.current && !message) {
      textareaRef.current.style.height = 'auto';
      setIsMultiline(false);
    }
  }, [message]);

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full px-4 py-3 pr-12 
                border border-gray-300 dark:border-gray-600 
                rounded-lg resize-none
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isMultiline ? 'min-h-[60px] max-h-[200px]' : 'h-[60px]'}
                transition-all duration-200
              `}
              style={{ 
                minHeight: '60px',
                overflow: isMultiline ? 'auto' : 'hidden'
              }}
            />
            
            {/* Send Button */}
            <motion.button
              type="submit"
              disabled={disabled || !message.trim()}
              whileHover={{ scale: disabled || !message.trim() ? 1 : 1.05 }}
              whileTap={{ scale: disabled || !message.trim() ? 1 : 0.95 }}
              className={`
                absolute right-2 bottom-2 
                w-8 h-8 rounded-full
                flex items-center justify-center
                transition-all duration-200
                ${message.trim() && !disabled
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-md'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                />
              </svg>
            </motion.button>
          </div>
        </div>
        
        {/* Helper Text */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </form>
    </div>
  );
};

export default ChatInput;