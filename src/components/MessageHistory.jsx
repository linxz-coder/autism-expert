// 历史消息
import React from 'react';
import Message from './Message';

export default function MessageHistory({ oldMessages }) {
    return (
      <>
        {oldMessages && oldMessages.map((message, index) => (
          <div key={index}>
            { index % 2 === 0 
              ? <Message user content={message.content} isHistory={true}/> 
              : <Message ai content={message.content} isHistory={true}/> 
            }
          </div>
        ))}
      </>
    );
}