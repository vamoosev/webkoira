class GameHandler {
    constructor() {
      this.deck = this.createDeck();
      this.shuffleDeck();
      this.hands = {}; // Store hands of each player
    }
  
    // Create a deck of cards
    createDeck() {
      const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
      const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
      const deck = [];
  
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push({ suit, rank });
        }
      }
  
      return deck;
    }
  
    // Shuffle the deck
    shuffleDeck() {
      for (let i = this.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
      }
    }
  
    // Draw cards for each player
    drawCards(players, cardsPerPlayer) {
      for (const player of players) {
        if (!this.hands[player]) {
          this.hands[player] = [];
        }
  
        for (let i = 0; i < cardsPerPlayer; i++) {
          if (this.deck.length === 0) {
            throw new Error('No more cards in the deck');
          }
  
          this.hands[player].push(this.deck.pop());
        }
      }
  
      return this.hands;
    }
  
    // Get the hands of each player
    getHands() {
      return this.hands;
    }
  
    // Clear the state for a lobby
    clearLobby(lobbyId) {
      for (const player in this.hands) {
        if (this.hands.hasOwnProperty(player)) {
          delete this.hands[player];
        }
      }
      this.deck = this.createDeck();
      this.shuffleDeck();
    }
  }
  
  module.exports = GameHandler;