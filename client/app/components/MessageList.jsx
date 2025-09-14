export default function MessageList({ messages }) {
  return (
    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
      {messages.map((message) => (
        <div key={message.id} className="bg-gray-100 p-3 rounded">
          <div className="font-medium">{message.text}</div>
          <div className="text-sm text-gray-500">{message.timestamp}</div>
        </div>
      ))}
    </div>
  );
}
