"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    newSocket.on("chat message", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: msg,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    });

    newSocket.on("system", (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: msg,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    if (socket && text.trim()) {
      socket.emit("chat message", text);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Chat</h1>
      </div>

      <MessageList messages={messages} />
      <div ref={messagesEndRef} />

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
