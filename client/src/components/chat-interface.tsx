import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/types";
import { useWebSocket } from "@/lib/websocket";

interface ChatInterfaceProps {
  taskId?: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  activeAgent?: string;
}

export function ChatInterface({ taskId, messages, onSendMessage, activeAgent }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected, lastMessage } = useWebSocket(taskId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && taskId) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const getAgentAvatar = (sender: string) => {
    const avatars = {
      user: <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
        <i className="fas fa-user text-gray-600 text-xs"></i>
      </div>,
      manager: <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <i className="fas fa-user-tie text-white text-xs"></i>
      </div>,
      planner: <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
        <i className="fas fa-robot text-white text-xs"></i>
      </div>,
      programmer: <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
        <i className="fas fa-code text-white text-xs"></i>
      </div>,
    };

    return avatars[sender as keyof typeof avatars] || avatars.user;
  };

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatSenderName = (sender: string) => {
    const names = {
      user: 'You',
      manager: 'Manager Agent',
      planner: 'Planner Agent',
      programmer: 'Programmer Agent',
    };
    
    return names[sender as keyof typeof names] || sender;
  };

  return (
    <Card>
      <CardHeader className="p-3 lg:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm lg:text-lg font-semibold">AI Chat</CardTitle>
          <div className="flex items-center space-x-1 lg:space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        {activeAgent && (
          <p className="text-xs text-gray-500 mt-1">Active with {formatSenderName(activeAgent)}</p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-comments text-gray-400 text-3xl mb-3"></i>
              <p className="text-gray-500">No messages yet. Start a conversation with the AI agents!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex space-x-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender !== 'user' && (
                  <div className="flex-shrink-0">
                    {getAgentAvatar(message.sender)}
                  </div>
                )}
                
                <div className={`flex-1 min-w-0 ${message.sender === 'user' ? 'text-right' : ''}`}>
                  <div className={`flex items-center space-x-2 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                    <p className="text-sm font-medium text-gray-900">
                      {formatSenderName(message.sender)}
                    </p>
                    <p className="text-xs text-gray-500">{formatTime(message.createdAt)}</p>
                  </div>
                  
                  <div className={`mt-1 rounded-lg p-3 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-50'
                  }`}>
                    <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-gray-700'}`}>
                      {message.content}
                    </p>
                    
                    {message.type === 'plan' && (
                      <div className="mt-3 flex space-x-2">
                        <Badge className="bg-green-600 text-white">Plan</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="flex-shrink-0">
                    {getAgentAvatar(message.sender)}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder={!taskId ? "Select a task above to enable chat..." : "Type your message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={!taskId}
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || !taskId}
              title={!taskId ? "Select a task first to enable chat" : ""}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-paper-plane"></i>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
