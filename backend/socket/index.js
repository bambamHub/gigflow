let io;

const initSocket = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };
