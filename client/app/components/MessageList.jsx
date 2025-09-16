export default function MessageList({ messages }) {
  return (
    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-3 rounded ${
            message.type === "system"
              ? "bg-blue-100 text-blue-800 text-center italic"
              : "bg-gray-100"
          }`}
        >
          <div className="font-medium">{message.text}</div>
          <div className="text-sm text-gray-500">{message.timestamp}</div>
        </div>
      ))}
    </div>
  );
}
