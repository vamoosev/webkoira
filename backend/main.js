const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const GameHandler = require('./game_handler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity, adjust as needed
    methods: ['GET', 'POST']
  }
});

const PORT = 8080;
const gameHandler = new GameHandler();
const lobbyUsers = {}; // Track the users in each lobby
const socketUsernames = {}; // Track usernames associated with each socket

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Handle joining a lobby
  socket.on('joinLobby', (lobbyId, username) => {
    socket.join(lobbyId);
    socketUsernames[socket.id] = username;
    console.log(`User ${username} joined lobby: ${lobbyId}`);

    if (!lobbyUsers[lobbyId]) {
      lobbyUsers[lobbyId] = [];
    }
    lobbyUsers[lobbyId].push(socket.id);
    console.log(`Number of users in lobby ${lobbyId}: ${lobbyUsers[lobbyId].length}`);

    socket.to(lobbyId).emit('message', `${username} has joined the lobby: ${lobbyId}`);
  });

  // Handle leaving a lobby
  socket.on('leaveLobby', (lobbyId) => {
    const username = socketUsernames[socket.id];
    socket.leave(lobbyId);
    console.log(`User ${username} left lobby: ${lobbyId}`);

    if (lobbyUsers[lobbyId]) {
      lobbyUsers[lobbyId] = lobbyUsers[lobbyId].filter(id => id !== socket.id);
      console.log(`Number of users in lobby ${lobbyId}: ${lobbyUsers[lobbyId].length}`);

      if (lobbyUsers[lobbyId].length === 0) {
        delete lobbyUsers[lobbyId];
        gameHandler.clearLobby(lobbyId);
        console.log(`Cleared state for lobby ${lobbyId}`);
      }
    }

    socket.to(lobbyId).emit('message', `${username} has left the lobby: ${lobbyId}`);
    delete socketUsernames[socket.id];
  });

  // Handle sending a message to a lobby
  socket.on('sendMessage', (lobbyId, message) => {
    const username = socketUsernames[socket.id];
    console.log(`Message from ${username} to lobby ${lobbyId}: ${message}`);
    io.in(lobbyId).emit('message', `${username}: ${message}`);
  });

  // Handle sending a card to a lobby
  socket.on('sendCard', (lobbyId, card) => {
    const username = socketUsernames[socket.id];
    console.log(`Sending card from ${username} to lobby ${lobbyId}:`, card);
    io.in(lobbyId).emit('card', card);
  });

  // Handle drawing cards for players
  socket.on('drawCards', (lobbyId) => {
    try {
      const players = lobbyUsers[lobbyId];
      if (!Array.isArray(players)) {
        throw new Error('Players is not an array');
      }
  
      const cardsPerPlayer = 3; // Draw 3 cards for each player
      const hands = gameHandler.drawCards(players, cardsPerPlayer);
      console.log(`Drawing cards for players in lobby ${lobbyId}:`, hands);
  
      // Create an object to store the card counts and usernames for each player
      const cardCounts = {};
  
      for (const player of players) {
        const playerSocket = io.sockets.sockets.get(player);
        if (playerSocket) {
          const username = socketUsernames[player];
          playerSocket.emit('hand', hands[player]);
          cardCounts[username] = hands[player].length;
        }
      }
  
      // Emit the card counts to all players in the lobby
      io.in(lobbyId).emit('updateCardCounts', cardCounts);
    } catch (error) {
      console.error('Error drawing cards:', error.message);
      socket.emit('error', error.message);
    }
  });

  // Handle getting hands of players
  socket.on('getHands', (lobbyId) => {
    const hands = gameHandler.getHands();
    const playerSocket = io.sockets.sockets.get(socket.id);
    if (playerSocket) {
      playerSocket.emit('hand', hands[socket.id]);
    }
  });

  socket.on('disconnect', () => {
    const username = socketUsernames[socket.id];
    console.log(`User ${username} disconnected`);
    for (const lobbyId in lobbyUsers) {
      if (lobbyUsers.hasOwnProperty(lobbyId)) {
        if (lobbyUsers[lobbyId].includes(socket.id)) {
          lobbyUsers[lobbyId] = lobbyUsers[lobbyId].filter(id => id !== socket.id);
          console.log(`Number of users in lobby ${lobbyId}: ${lobbyUsers[lobbyId].length}`);

          if (lobbyUsers[lobbyId].length === 0) {
            delete lobbyUsers[lobbyId];
            gameHandler.clearLobby(lobbyId);
            console.log(`Cleared state for lobby ${lobbyId}`);
          }
        }
      }
    }
    delete socketUsernames[socket.id];
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});