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

app.get("/", (req, res) => {
  // index.html serves as a prototyping interface that offers identical functionality to the React frontend
  // but with different stylings and UIs.
  res.sendFile(join(__dirname, "index.html"));
});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", `http://localhost:${port}`],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.emit("system", `Welcome! You are ${socket.id}`);

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

    // io.emit("chat message", `${socket.id}: ${msg}`);
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
    io.emit("system", `User ${socket.id} has left the chat`);
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
