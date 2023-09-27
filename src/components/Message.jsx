"use client"
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';  
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {vscDarkPlus} from 'react-syntax-highlighter/dist/esm/styles/prism'
import Image from 'next/image'

export default function Message({ai, user, content, isHistory = false, onAIReply, chatHistory  }){
  
  
  const [resultText, setResultText] = useState('');  // 使用useState来保存结果

  const onAIReplyRef = useRef(onAIReply); 
  const chatHistoryRef = useRef(chatHistory);
  const isHistoryRef = useRef(isHistory);

  useEffect(() => {
  
  // 在 effect 内获取最新的 ref 值
  const onAIReply = onAIReplyRef.current;
  const chatHistory = chatHistoryRef.current;
  const isHistory = isHistoryRef.current;

  if (ai && content && !isHistory) {
    const generate = async () => {
      try {
        //将chatHistory转为string
        const chatHistoryStr = JSON.stringify(chatHistory); // 将chatHistory转化为字符串

        // Fetch the response from the OpenAI API with the signal from AbortController
          const response = await fetch("https://8.218.72.177:5328/api/python", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: content, chatHistory: chatHistoryStr }),
          });

         // 处理streaming response
         const reader = response.body.getReader();
         const decoder = new TextDecoder("utf-8");
         let accumulatedText = "";

         while (true) {
           const { done, value } = await reader.read();
           if (done) {
            onAIReply && onAIReply(accumulatedText);  // <-- 当AI的回复生成时，通知父组件
            break;
           }
           // Massage and parse the chunk of data
           const chunk = decoder.decode(value);
          //  accumulatedText = accumulatedText.replace(/\d+\.$/, m => m.replace('.', '、'));

           accumulatedText += chunk;

           setResultText(accumulatedText);  // 使用setState更新状态
           // console.log("Result text:", resultText);
         }
       } catch (error) {
             console.error("Error occurred while generating:", error.message);
       }
      };
      generate();
    }

    }, [ai, content]);

    let messageContent = user ? content : (ai ? (isHistory ? content : resultText) : '有什么可以帮你的吗？');
  
    

    
    return (
      <div className={`flex ${user ? 'flex-row-reverse' : ''}`}>
        <div className='max-w-[40px] max-h-[40px]'>
          <Image 
            src={user ? '/me.png' : '/robot_ai.png'}
            className="rounded-full"
            width={200}
            height={200}
            alt = "avatar"
          />
        </div>
    
        <div className={`flex flex-col ${user ? 'mr-3 ml-14' : 'mr-14 ml-3'}`}>
          <div className={`px-4 rounded-lg shadow-lg md:max-w-fit ${user ? 'bg-green-500 text-white' : 'bg-white text-black'}`}>
                <ReactMarkdown className='markdown' rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} 
                  components={{
                    code({node, inline, className,children,...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        wrapLongLines={true}
                      >
                        {String(children).replace(/\n$/, '')}  {/* Move children here */}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={className}>
                        {children}  {/* Move children here */}
                      </code>
                    )
                    }
                  }}
                >
                  {messageContent}
                </ReactMarkdown>
          </div>

          <div className='mb-8'></div>
  
        </div>
      </div>
    )
}



