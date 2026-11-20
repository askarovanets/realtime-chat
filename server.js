const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const users = new Map();

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('join', (rawName) => {
    if (users.has(socket.id)) return;
    const name = String(rawName || '').trim().slice(0, 20) || 'Guest';
    users.set(socket.id, name);
    socket.emit('notice', `Welcome, ${name}!`);
    socket.broadcast.emit('notice', `${name} joined the chat.`);
    io.emit('online count', users.size);
  });

  socket.on('chat message', (rawText) => {
    const name = users.get(socket.id);
    if (!name || typeof rawText !== 'string') return;
    const text = rawText.trim().slice(0, 100);
    if (!text) return;
    const time = new Date().toLocaleTimeString();
    io.emit('chat message', { name, text, time });
  });

  socket.on('typing', () => {
    const name = users.get(socket.id);
    // Ignore clients who have not joined.
    if (!name) return;
    // Notify all other clients.
    socket.broadcast.emit('typing', name);
  });

  socket.on('disconnect', () => {
    const name = users.get(socket.id);
    users.delete(socket.id);
    if (name) socket.broadcast.emit('notice', `${name} left the chat.`);
    io.emit('online count', users.size);
    console.log('Disconnected:', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Chat server running on port ${PORT}`);
});