const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/scans', require('./routes/scans'));
app.use('/api/users', require('./routes/users'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Socket.io
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./middleware/auth');

const onlineUsers = new Map(); // userId -> Set of socketIds

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.id;
    socket.userName = decoded.email;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.userId;

  // Track online users
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  // Broadcast online users
  io.emit('online_users', Array.from(onlineUsers.keys()));

  // Join room
  socket.on('join_room', (roomId) => {
    socket.join(`room_${roomId}`);
  });

  // Leave room
  socket.on('leave_room', (roomId) => {
    socket.leave(`room_${roomId}`);
  });

  // Send message
  socket.on('send_message', (data) => {
    try {
      const { roomId, content } = data;
      if (!content || !content.trim()) return;

      const result = db.prepare(
        'INSERT INTO messages (sender_id, room_id, content) VALUES (?, ?, ?)'
      ).run(userId, roomId, content.trim());

      const message = db.prepare(`
        SELECT m.*, u.name as sender_name, u.avatar as sender_avatar, u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.id = ?
      `).get(result.lastInsertRowid);

      io.to(`room_${roomId}`).emit('new_message', message);
    } catch (err) {
      console.error('Socket send_message error:', err);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', ({ roomId, userName }) => {
    socket.to(`room_${roomId}`).emit('user_typing', { userId, userName });
  });

  socket.on('stop_typing', ({ roomId }) => {
    socket.to(`room_${roomId}`).emit('user_stop_typing', { userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });
});

// Make io accessible in routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`StudyShare server running on http://localhost:${PORT}`);
});
