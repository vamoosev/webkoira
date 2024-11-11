class GameHandler {
  constructor() {
    this.phase = 1;
    this.deck = [];
    this.hands = {};
    this.currentPlayerIndex = 0;
    this.players = [];
    this.valttikortti = null;
    this.makeDeck();
  }

  makeDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];

    for (const suit of suits) {
      for (const value of values) {
        this.deck.push({ suit, value });
      }
    }
    // Shuffle deck
    this.deck.sort(() => Math.random() - 0.5);
  }

  start(lobbyId, users) {
    this.players = users;
    this.dealInitialCards();
    this.phase = 1;
  }

  dealInitialCards() {
    // Deal 3-5 cards to each player depending on the rules
    const cardsPerPlayer = 3; // Adjust this value based on the rules
    for (let i = 0; i < cardsPerPlayer; i++) {
      for (const player of this.players) {
        if (!this.hands[player]) {
          this.hands[player] = [];
        }
        this.hands[player].push(this.deck.pop());
      }
    }
    // Set the valttikortti (trump card)
    this.valttikortti = this.deck.pop();
  }

  playCard(player, card) {
    // Logic for playing a card
    // This method should handle both phases of the game
    if (this.phase === 1) {
      this.handlePhaseOne(player, card);
    } else {
      this.handlePhaseTwo(player, card);
    }
  }

  handlePhaseOne(player, card) {
    // Logic for phase one
    // Players play cards, draw new cards, and determine the winner of each round
    // Implement the rules for phase one here
  }

  handlePhaseTwo(player, card) {
    // Logic for phase two
    // Players play cards according to the rules of phase two
    // Implement the rules for phase two here
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    return this.players[this.currentPlayerIndex];
  }

  getHand(player) {
    return this.hands[player];
  }
}

module.exports = GameHandler;