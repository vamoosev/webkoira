const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const app = express();
const server = http.createServer(app);
const GameHandler = require('./game_handler.js');
const io = socketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5173", // Allow requests from this origin
    methods: ["GET", "POST"]
  }
});

const PORT = 8080;
const gameHandlers = {}; // Track the GameHandler for each lobby
const lobbyUsers = {}; // Track the users in each lobby
const socketUsernames = {};

function generateUniqueLobbyId() {
  return Math.random().toString(36).substr(2, 9);
}

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('createLobby', (username) => {
    const lobbyId = generateUniqueLobbyId();
    lobbyUsers[lobbyId] = [username];
    gameHandlers[lobbyId] = new GameHandler();
    socketUsernames[socket.id] = username;
    socket.join(lobbyId);
    socket.emit('lobbyCreated', { lobbyId, username });
    io.to(lobbyId).emit('updateLobby', { lobbyId, users: lobbyUsers[lobbyId] });
    console.log(`Lobby ${lobbyId} created by ${username}`);
  });

  socket.on('joinLobby', (lobbyId, username) => {
    console.log(`Attempting to join lobby with ID: ${lobbyId} and username: ${username}`);
    if (lobbyUsers[lobbyId]) {
      // Check if the username is already taken by another user
      if (lobbyUsers[lobbyId].includes(username) && socketUsernames[socket.id] !== username) {
        socket.emit('error', 'Username already taken or invalid');
        return;
      }
      // Add the user to the lobby if they are not already in it
      if (!lobbyUsers[lobbyId].includes(username)) {
        lobbyUsers[lobbyId].push(username);
      }
      socketUsernames[socket.id] = username;
      socket.join(lobbyId);
      socket.emit('lobbyJoined', { lobbyId, username });
      io.emit('updateLobby', { lobbyId, users: lobbyUsers[lobbyId] });
      console.log(`${username} joined lobby ${lobbyId}`);
    } else {
      console.error(`Lobby with ID ${lobbyId} does not exist`);
      socket.emit('error', 'Lobby does not exist');
    }
  });

  socket.on('startGame', (lobbyId) => {
    if (gameHandlers[lobbyId]) {
      gameHandlers[lobbyId].start(lobbyId, lobbyUsers[lobbyId]);
      io.to(lobbyId).emit('gameStarted', { lobbyId });
      console.log(`Game started in lobby ${lobbyId}`);
    } else {
      socket.emit('error', 'Lobby does not exist or game handler not found');
    }
  });

  socket.on('leaveLobby', (lobbyId, username) => {
    if (lobbyUsers[lobbyId]) {
      lobbyUsers[lobbyId] = lobbyUsers[lobbyId].filter(user => user !== username);
      socket.leave(lobbyId);
      socket.emit('lobbyLeft', { lobbyId, username });
      io.to(lobbyId).emit('updateLobby', { lobbyId, users: lobbyUsers[lobbyId] });
      // Check if the lobby is empty
      if (lobbyUsers[lobbyId].length === 0) {
        delete lobbyUsers[lobbyId];
        delete gameHandlers[lobbyId];
        console.log(`Lobby ${lobbyId} has been removed as it is empty`);
      }

      console.log(`${username} left lobby ${lobbyId}`);
    } else {
      socket.emit('error', 'Lobby does not exist');
    }
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected');
    const username = socketUsernames[socket.id];
    if (username) {
      for (const lobbyId in lobbyUsers) {
        if (lobbyUsers[lobbyId].includes(username)) {

          socket.emit('leaveLobby', lobbyId, username);
          io.to(lobbyId).emit('updateLobby', { lobbyId, users: lobbyUsers[lobbyId] });
        }
      }
      delete socketUsernames[socket.id];
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});