"use client";
import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/messages?limit=25"
        );

        if (response.ok) {
          const data = await response.json();

          const formattedMessages = data.messages.map((msg) => ({
            id: msg.id,
            text: `${msg.userId}: ${msg.message}`,
            timestamp: msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
          }));

          setMessages(formattedMessages);
        } else {
          console.error("Error fetching messages:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecentMessages();
  }, []);

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
          type: "system",
        },
      ]);
    });

    newSocket.on("user joined", (data) => {
      if (data.onlineUsers) {
        setOnlineUsers(data.onlineUsers);
      }
    });

    newSocket.on("user left", (data) => {
      if (data.onlineUsers) {
        setOnlineUsers(data.onlineUsers);
      }
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

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-blue-500 text-white p-4">
          <h1 className="text-xl font-bold">Chat</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading recent messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Chat</h1>
        <div className="text-sm mt-1">
          <span className="mr-4">Online: {onlineUsers.length}</span>
        </div>
      </div>

      <MessageList messages={messages} />
      <div ref={messagesEndRef} />

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
