// 消息列表项
'use client'
import React from 'react';
import { useState } from 'react';

export default function ChatItem({chatTitle, messages, startTime, onSelectChat, chatId}) {
    const lastMessage = messages[messages.length - 1]?.content || '最后一条消息';
    const [chatStartTime] = useState(startTime);

    return (
      <div className="flex flex-col p-4 cursor-pointer" onClick={() => onSelectChat(chatId)}>
        
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium truncate">{chatTitle}</h4>
          <span>{chatStartTime}</span>  
        </div>
        
        <div className="flex justify-between mt-1">
          <span className="text-gray-600 truncate">{lastMessage || '最后一条消息...'}  </span>
        </div>
        
      </div>
    )
}