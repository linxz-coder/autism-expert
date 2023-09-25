import Image from 'next/image';

// 搜索功能
export default function SearchInput({ searchQuery, setSearchQuery, setSearchResults, sessions  }) {

    // 清空搜索结果
    const clearSearch = () => {
      setSearchQuery('');
      setSearchResults([]);
    };
  
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
  
      if (e.target.value.trim() === '') {
        setSearchResults([]);
        return;
      }
  
      const keyword = e.target.value.toLowerCase();
      console.log(("sessions in search" + JSON.stringify(sessions)))
      console.log("sessions to array", JSON.stringify(Object.entries(sessions)));
      const results = Object.entries(sessions).filter(([_, sessionData]) => {
        return sessionData.chatTitle.toLowerCase().includes(keyword) ||
               sessionData.messages.some(msg => msg.content.toLowerCase().includes(keyword));
      });
  
      setSearchResults(results);
    };
  
    return (
      <div className="flex-1 justify-between items-center h-10 flex rounded-lg border">
          <input 
              type="text"
              className="h-full border-none outline-none pl-3" 
              placeholder="搜索"
              value={searchQuery}
              onChange={handleSearchChange}
          />
          {searchQuery && (
              <span onClick={clearSearch} className="cursor-pointer mr-1">
                  ×
              </span>
          )}
          <Image 
              src="search.svg"
              className="w-5 h-5 mr-1" 
              width={20}
              height={20}
              alt="search-icon" 
          />
      </div>  
    )
}

// sessions to array 输出结果例子：
// key: "75afdbac-4643-4afb-8f83-2780f861183e"
// value: {messages: Array(2), chatTitle: "闲聊", startTime: "20:30"}
// 转换后形态：[[key, value],...]
// [[
// "75afdbac-4643-4afb-8f83-2780f861183e",
// {"messages":[{"user":true,"content":"你好"},{"user":false,"content":"你好！我是豆豆"}],"chatTitle":"闲聊","startTime":"20:30"}
// ]] 