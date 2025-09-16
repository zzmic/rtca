import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import validator from "validator";

dotenv.config();

import { db, admin } from "./utils/FirebaseInit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:3000", `http://localhost:${port}`],
  })
);

app.use(express.static(__dirname));

app.get("/", async (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get("/api/messages", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 25;

    const messagesSnapshort = await db
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const messages = [];
    messagesSnapshort.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        userId: data.userId,
        message: data.message,
        timestamp: data.timestamp?.toDate?.() || data.timestamp,
      });
    });
    messages.reverse();
    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", `http://localhost:${port}`],
  },
});

const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  connectedUsers.set(socket.id, {
    id: socket.id,
    username: `${socket.id}`,
    connectedAt: new Date(),
    lastActive: new Date(),
  });

  socket.emit("system", `Welcome! You are ${socket.id}`);
  socket.emit("user joined", {
    users: connectedUsers.get(socket.id),
    onlineUsers: Array.from(connectedUsers.values()),
  });

  socket.broadcast.emit("user joined", {
    user: connectedUsers.get(socket.id),
    onlineUsers: Array.from(connectedUsers.values()),
  });

  socket.broadcast.emit("system", `User ${socket.id} has joined the chat`);

  socket.on("chat message", async (msg) => {
    if (!msg || typeof msg !== "string" || msg.trim().length === 0) {
      socket.emit("system", "Invalid message received");
      return;
    }

    var sanitizedMsg = msg.trim();
    if (!validator.isLength(sanitizedMsg, { min: 1, max: 1000 })) {
      socket.emit("error", "Message must be 1-1000 characters");
      return;
    }
    sanitizedMsg = validator
      .escape(sanitizedMsg)
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
      .trim();

    const messageData = {
      userId: socket.id,
      message: sanitizedMsg,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (connectedUsers.has(socket.id)) {
      connectedUsers.get(socket.id).lastActive = new Date();
    }

    io.emit("chat message", `${socket.id}: ${sanitizedMsg}`);

    try {
      await db.collection("messages").add(messageData);
      console.log("Message saved to Firestore:", messageData);
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
      socket.emit("error", "Failed to process message");
    }
  });

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      connectedUsers.delete(socket.id);

      socket.broadcast.emit("user left", {
        userId: socket.id,
        onlineUsers: Array.from(connectedUsers.values()),
      });
    }

    io.emit("system", `User ${socket.id} has left the chat`);
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
