class GameHandler {
  constructor() {
    this.deck = this.createDeck();
    this.shuffleDeck();
    this.hands = {}; // Store hands of each player
    this.playedCards = []; // Store played cards
    this.valttiCard = null;
    this.valttiSuit = null;
    this.firstRound = true;
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

  // Play a card
  playCard(player, card) {
    if (this.firstRound) {
      // In the first round, any card can be played
      this.hands[player] = this.hands[player].filter(c => c !== card);
      this.playedCards.push({ player, card });

      if (this.deck.length === 0) {
        this.endFirstRound();
      }
    } else {
      // In the second round, the card must match the suit of the first card played
      const leadSuit = this.playedCards[0].card.suit;
      if (card.suit !== leadSuit && this.hands[player].some(c => c.suit === leadSuit)) {
        throw new Error('You must play a card of the same suit');
      }
      this.hands[player] = this.hands[player].filter(c => c !== card);
      this.playedCards.push({ player, card });

      if (this.playedCards.length === Object.keys(this.hands).length) {
        this.resolveTrick();
      }
    }
  }

  // End the first round
  endFirstRound() {
    this.firstRound = false;
    this.valttiCard = this.deck.pop();
    this.valttiSuit = this.valttiCard.suit;
    console.log(`The valtti card is ${this.valttiCard.rank} of ${this.valttiCard.suit}`);
  }

  // Resolve a trick
  resolveTrick() {
    const leadSuit = this.playedCards[0].card.suit;
    let winningCard = this.playedCards[0];
    for (const played of this.playedCards) {
      if (played.card.suit === this.valttiSuit && winningCard.card.suit !== this.valttiSuit) {
        winningCard = played;
      } else if (played.card.suit === leadSuit && this.compareCards(played.card, winningCard.card) > 0) {
        winningCard = played;
      }
    }
    console.log(`Player ${winningCard.player} wins the trick with ${winningCard.card.rank} of ${winningCard.card.suit}`);
    this.playedCards = [];
  }

  // Compare two cards
  compareCards(card1, card2) {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    return rankOrder.indexOf(card1.rank) - rankOrder.indexOf(card2.rank);
  }

  // Pick up the bottom card
  pickUpBottomCard(player) {
    if (this.hands[player].length === 0) {
      throw new Error('No cards left to pick up');
    }
    this.hands[player].push(this.deck.shift());
  }
}

module.exports = GameHandler;