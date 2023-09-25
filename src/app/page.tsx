'use client'
require('dotenv').config();
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TextInput from '../components/TextInput';
import Message from '../components/Message';
import ChatHeader from '../components/ChatHeader';
import SearchInput from '../components/SearchInput';
import ChatItem from '../components/ChatItem';
import MessageHistory from '../components/MessageHistory';
import { formatTime } from '../utils/timeUtils';


export default function HomePage() {

  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [chatTitle, setChatTitle] = useState('对话标题');
  const [shouldUpdateTitle, setShouldUpdateTitle] = useState(false);
  const initialSessionId = uuidv4();
  const initialSession = { messages: [], chatTitle: '对话标题', startTime: formatTime(new Date()) };
  const [sessions, setSessions] = useState({[initialSessionId]: initialSession});
  const [currentSessionId, setCurrentSessionId] = useState(initialSessionId);
  const [oldMessages, setOldMessages] = useState({});  // 保存旧的消息，用于历史消息的展示
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTitleModified, setTitleModified] = useState(false);
  const [showChatSelector, setShowChatSelector] = useState(false);



  const selectSession = (selectedSessionId: string) => {
    const selectedSession = sessions[selectedSessionId];
    console.log("selectedSession:", selectedSession);
    if (selectedSession) {
        setCurrentSessionId(selectedSessionId);
        setShouldUpdateTitle(false);  
        setMessages(selectedSession.messages);
        console.log("selectedSession-messages:", selectedSession.messages);

        // 更新该 session 的 oldMessages
        setOldMessages(prev => ({ ...prev, [selectedSessionId]: selectedSession.messages }));

        setUserMessages([]);
        setChatTitle(selectedSession.chatTitle || '对话标题');
        setUserInput('');

        setShowChatSelector(false)
    }
  };


  const handleAIResponse = (response: string) => {
    const aiMessage = { user: false, content: response };  // 增加AI标识
    const updatedMessages = [...messages, aiMessage];
    setMessages(updatedMessages);

    console.log("After AI response messages: ", updatedMessages);  // 添加的log
    
    // 更新sessions
    const updatedSessions = { ...sessions };
    updatedSessions[currentSessionId].messages = updatedMessages;
    setSessions(updatedSessions);
    console.log("AIresponse-updatedSessions: ", updatedSessions);
  }
    
  const handleSendMessage = (text) => {
      console.log("User Sent Message:", text);
      setShouldUpdateTitle(true); 
      setUserInput(text);
      const userMessage = { user: true, content: text };
      const updatedMessages = [...messages, userMessage];
      const updatedUserMessages = [...userMessages, userMessage];

      setMessages(updatedMessages);
      setUserMessages(updatedUserMessages);

      console.log("handle-send messages: ", updatedMessages);  // 添加的log
      
      const updatedSessions = { ...sessions };
      updatedSessions[currentSessionId].messages = updatedMessages;
      setSessions(updatedSessions);
      console.log("handlesend-updatedSessions: ", updatedSessions);
  };

  // 标题
  useEffect(() => {
    if (shouldUpdateTitle && !isTitleModified) {
        let newTitle = "";
        if (messages.length >= 4) {
            const lastThreeMessages = messages.slice(-3).map(msg => msg.content).join("\n");
            fetch('/api/title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: lastThreeMessages }),
            })
            .then(response => response.text())
            .then(data => {
                setChatTitle(data);
                setTitleModified(true);

            const updatedSessions = { ...sessions };
            updatedSessions[currentSessionId].chatTitle = data;
            setSessions(updatedSessions);
            });
        } else if (messages.length >= 1) {
            newTitle = "闲聊";
            setChatTitle(newTitle);
        }
          const updatedSessions = { ...sessions };
          updatedSessions[currentSessionId].chatTitle = newTitle;
          setSessions(updatedSessions);
        
    }
  }, [shouldUpdateTitle, messages]);

  // 实时查看各个变量
  useEffect(() => {
    console.log("Now messages: ", messages);
    console.log("Now userMessages: ", userMessages);
  }, [messages, userMessages]);

  // 鼠标拖动左侧菜单
  useEffect(() => {
    const leftSidebar = document.getElementById('leftSidebar');
    const dragger = document.getElementById('dragger');

    let isResizing = false;
    let initialX;
    let initialWidth;
    const MIN_WIDTH = 250; // 例如，设置为50px
    const MAX_WIDTH = 350; // 设置为100px

    dragger.addEventListener('mousedown', (event) => {
        isResizing = true;
        initialX = event.clientX;
        initialWidth = leftSidebar.offsetWidth;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        });
    });

    const handleMouseMove = (event) => {
        if (!isResizing) return;
        const diffX = event.clientX - initialX;
        let newWidth = initialWidth + diffX;

        // 限制宽度在最小和最大之间
        newWidth = Math.max(MIN_WIDTH, newWidth);
        newWidth = Math.min(MAX_WIDTH, newWidth);



        leftSidebar.style.width = `${newWidth}px`;
    };

    return () => {
        if (dragger) {
            dragger.removeEventListener('mousedown', handleMouseMove);
        }
    };
  }, []);

  // 添加新聊天功能
  const startNewSession = () => {
    setShouldUpdateTitle(false);
    // session部分
    const newSessionId = uuidv4();
    const newSession = { messages: [], chatTitle: '对话标题', startTime: formatTime(new Date()) };
    setSessions({...sessions, [newSessionId]: newSession});
    setCurrentSessionId(newSessionId);


    // 重置当前聊天内容
    setTitleModified(false); // 也要重置这个状态，否则新的对话达到3条消息时，标题可能不会修改
    setMessages([]);
    setChatTitle('对话标题');
    setUserMessages([]);
    setUserInput('');
  };

  // rendering
  return (

    <div className="flex h-screen">
      {/* Mobile Chat Selector */}
      {showChatSelector && (
        <div className="bg-white overflow-auto h-screen absolute top-0 left-0 z-50 w-[200px] md:hidden" id="mobileChatSelector">
          
          {/* Close 'x' Button */}
          <span 
            className="absolute right-1 cursor-pointer text-lg font-bold" 
            onClick={() => setShowChatSelector(false)}
          >
            x
          </span>

          {Object.entries(sessions).map(([sessionId, sessionData]) => (
            <ChatItem 
              key={sessionId} 
              chatTitle={sessionData.chatTitle} 
              messages={sessionData.messages} 
              startTime={sessionData.startTime}
              onSelectChat={selectSession}
              chatId={sessionId}
            />
          ))}
        </div>
      )}


      {/* 左侧区块 */}
      <div className="bg-white overflow-auto h-screen relative hidden md:block md:w-[300px]" id="leftSidebar">
        
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-3xl font-bold text-pink-500">ChatFUN</h1>
          <button onClick={startNewSession}>
             <img src="new.svg" className="w-5 h-5" alt="Start new chat"/>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="px-4 flex items-center justify-between mb-4">
          <SearchInput 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setSearchResults={setSearchResults}
            sessions={sessions}
          />
        </div>

        {/* 聊天列表 ChatItem*/}
        <div className="overflow-auto">
        {searchQuery ? 
          searchResults.length > 0 ? 
            searchResults.map(([sessionId, sessionData]) => (
              <ChatItem 
                key={sessionId} 
                chatTitle={sessionData.chatTitle} 
                messages={sessionData.messages} 
                startTime={sessionData.startTime}
                onSelectChat={selectSession}
                chatId={sessionId}
              />
            )) : <div className='pl-5'>无相关搜索结果</div>
        :
          Object.entries(sessions).map(([sessionId, sessionData]) => (
            <ChatItem 
              key={sessionId} 
              chatTitle={sessionData.chatTitle} 
              messages={sessionData.messages} 
              startTime={sessionData.startTime}
              onSelectChat={selectSession}
              chatId={sessionId}
            />
          ))
        }
        </div>

        <div className="absolute top-0 right-0 h-full w-1 bg-gray-100 cursor-ew-resize" id="dragger"></div>

      </div>

      {/* 右侧区块 */}
      <div className="flex-1 bg-gray-100 overflow-auto h-screen">
        
        {/* 头部 */}
        <div className='flex'>
        {/* mobile view */}
          <div className='bg-gray-100 md:hidden p-3'>
            {/* hamburger形状菜单 */}
            <button 
              className="md:hidden h-10 w-10 items-center justify-center hover:text-gray-900 focus:outline-none  focus:ring-white dark:hover:text-white"
              onClick={() => setShowChatSelector(!showChatSelector)}
            >
              <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            
            {/* mobile new chat */}
            <button className="absolute right-5 top-5" onClick={startNewSession}>
              <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <div className='flex-grow flex justify-center mr-20 md:justify-start md:mr-0'>
            <ChatHeader chatTitle={chatTitle}/>
          </div>
        </div>
        
        {/* 消息列表 */}
        <div className="flex flex-col flex-1 overflow-auto p-4">
            <Message content="有什么可以帮你的？"/>
            {/* 首先渲染历史消息 */}
            {oldMessages[currentSessionId] && <MessageHistory oldMessages={oldMessages[currentSessionId]}/>}
            {userInput && (
                <>
                    {userMessages.map((message, index) => {
                        return (
                            <div key={index}>
                                    <Message user content={message.content} />
                                    <Message ai content={message.content} onAIReply={handleAIResponse} chatHistory={messages}/>
                            </div>
                        );
                    })}
                </>
            )}
        </div>
        
        {/* 底部输入框 */}
          <div className="w-full items-center bottom-0 border-t p-4">
            <TextInput onSend={handleSendMessage} />
          </div>

      </div>

    </div>
  )
}








