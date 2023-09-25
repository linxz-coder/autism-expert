// 右侧聊天框标题
export default function ChatHeader({chatTitle}) {
    return (
      <div className="flex items-center justify-between px-4 h-16 border-b">
        <h3 className="text-lg font-medium truncate">{chatTitle}</h3>
      </div>
    )
}