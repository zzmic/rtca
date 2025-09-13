import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

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

  socket.on("chat message", (msg) => {
    io.emit("chat message", `${socket.id}: ${msg}`);
  });

  socket.on("disconnect", () => {
    io.emit("system", `User ${socket.id} has left the chat`);
    console.log(`User ${socket.id} disconnected`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
