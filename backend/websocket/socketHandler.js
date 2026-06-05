const socketIO = require('socket.io');

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    socket.join(socket.userId);

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
    });

    // Real-time price updates every 3 seconds
    const priceInterval = setInterval(() => {
      const { ASSETS } = require('../config/constants');
      const prices = ASSETS.map(a => ({
        symbol: a.symbol,
        price: a.price * (1 + (Math.random() * 0.02 - 0.01)),
        change: a.change + (Math.random() * 0.5 - 0.25),
      }));
      socket.emit('price-update', prices);
    }, 3000);

    socket.on('disconnect', () => {
      clearInterval(priceInterval);
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

module.exports = { initializeSocket, getIO };
