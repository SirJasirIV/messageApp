import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import app from "./app.js";
import "dotenv/config";


const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

io.use((socket, next) => {
  try {
    const payload = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.userId = payload.id;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
});

   io.on("connection", (socket) => {
     console.log("socket connected, user", socket.userId);
     socket.join(`user:${socket.userId}`);
   });

app.set("io", io); 

const PORT = process.env.PORT || 3000;
server.listen(PORT);