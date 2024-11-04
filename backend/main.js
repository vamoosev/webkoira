const GameHandler = require('./game_handler');

const gameHandlers = {}; // Store game handlers for each lobby

socket.on('startGame', (lobbyId) => {
    const players = lobbyUsers[lobbyId];
    const cardsPerPlayer = 3;
    const gameHandler = new GameHandler();
    gameHandlers[lobbyId] = gameHandler;
    const hands = gameHandler.drawCards(players, cardsPerPlayer);
    console.log('Game started');
    console.log(hands);
    for (const player of players) {
        const playerSocket = io.sockets.sockets.get(player);
        if (playerSocket) {
            // Randomly select a player to start the game
            const randomPlayer = players[Math.floor(Math.random() * players.length)];
            playerSocket.emit('starter', `${socketUsernames[randomPlayer]}`);
            playerSocket.emit('hand', hands[player]);
        }
    }
});

socket.on('playCard', (lobbyId, player, card) => {
    const gameHandler = gameHandlers[lobbyId];
    if (!gameHandler) {
        return;
    }

    try {
        gameHandler.playCard(player, card);
        io.to(lobbyId).emit('cardPlayed', { player, card });

        if (!gameHandler.firstRound && gameHandler.playedCards.length === Object.keys(gameHandler.hands).length) {
            const winner = gameHandler.determineTrickWinner();
            io.to(lobbyId).emit('trickWon', { winner });
        }
    } catch (error) {
        const playerSocket = io.sockets.sockets.get(player);
        if (playerSocket) {
            playerSocket.emit('error', error.message);
        }
    }
});

socket.on('pickUpBottomCard', (lobbyId, player) => {
    const gameHandler = gameHandlers[lobbyId];
    if (!gameHandler) {
        return;
    }

    try {
        gameHandler.pickUpBottomCard(player);
        const playerSocket = io.sockets.sockets.get(player);
        if (playerSocket) {
            playerSocket.emit('hand', gameHandler.hands[player]);
        }
    } catch (error) {
        const playerSocket = io.sockets.sockets.get(player);
        if (playerSocket) {
            playerSocket.emit('error', error.message);
        }
    }
});