<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { io } from 'socket.io-client';
import Card from './components/Card.vue';

const socket = ref(null);
const socketId = ref('');
const receivedCard = ref<{ rank: string, suit: string } | null>(null);
const username = ref('');
const lobbyId = ref('');
const message = ref('');
const messages = ref<string[]>([]);
const cardRank = ref('');
const cardSuit = ref('');
const hands = ref<{ [key: string]: { rank: string, suit: string }[] } | null>(null);
const playerCardCounts = ref<{ [key: string]: number }>({});
const starter = ref('');

onMounted(() => {
  socket.value = io('http://localhost:8080'); // Updated URL

  socket.value.on('connect', () => {
    console.log('WebSocket connection opened');
    socketId.value = socket.value.id;
  });

  socket.value.on('card', (data) => {
    if (data.rank && data.suit) {
      receivedCard.value = { rank: data.rank, suit: data.suit };
    }
    console.log('WebSocket message received:', data);
  });

  socket.value.on('message', (msg) => {
    messages.value.push(msg);
  });

  socket.value.on('hand', (data) => {
    if (!hands.value) {
      hands.value = {};
    }
    hands.value[socketId.value] = data;
    console.log('Received hand:', data);
  });

  socket.value.on('updateCardCounts', (cardCounts) => {
    playerCardCounts.value = cardCounts;
  });

  socket.value.on('cardPlayed', ({ player, card }) => {
    messages.value.push(`${player} played ${card.rank} of ${card.suit}`);
    if (hands.value && hands.value[player]) {
      hands.value[player] = hands.value[player].filter(c => c.rank !== card.rank || c.suit !== card.suit);
    }
  });

  socket.value.on('trickWon', ({ winner }) => {
    messages.value.push(`${winner} won the trick`);
  });

  socket.value.on('starter', (player) => {
    starter.value = player;
    messages.value.push(`${player} starts the game`);
  });

  socket.value.on('error', (errorMessage) => {
    messages.value.push(`Error: ${errorMessage}`);
  });

  socket.value.on('disconnect', () => {
    console.log('WebSocket connection closed');
  });
});

const joinLobby = () => {
  if (socket.value && lobbyId.value && username.value) {
    socket.value.emit('joinLobby', lobbyId.value, username.value);
  }
};

const leaveLobby = () => {
  if (socket.value && lobbyId.value) {
    socket.value.emit('leaveLobby', lobbyId.value);
  }
};

const sendMessage = () => {
  if (socket.value && lobbyId.value && message.value) {
    socket.value.emit('sendMessage', lobbyId.value, message.value);
    message.value = '';
  }
};

const sendCard = () => {
  if (socket.value && lobbyId.value && cardRank.value && cardSuit.value) {
    const card = { rank: cardRank.value, suit: cardSuit.value };
    socket.value.emit('sendCard', lobbyId.value, card);
    cardRank.value = '';
    cardSuit.value = '';
  }
};

const drawCards = () => {
  if (socket.value && lobbyId.value) {
    socket.value.emit('drawCards', lobbyId.value);
  }
};

const startGame = () => {
  socket.value.emit('startGame', lobbyId.value);
};

const playCard = (card) => {
  socket.value.emit('playCard', lobbyId.value, username.value, card);
};

const pickUpBottomCard = () => {
  socket.value.emit('pickUpBottomCard', lobbyId.value, username.value);
};
</script>

<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <div class="mb-4 space-x-4">
      <input v-model="username" placeholder="Enter Username" class="input input-bordered w-full max-w-xs mb-2 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input v-model="lobbyId" placeholder="Enter Lobby ID" class="input input-bordered w-full max-w-xs mb-2 p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button @click="joinLobby" class="btn w-full max-w-xs mb-2 bg-blue-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Join Lobby</button>
      <button @click="leaveLobby" class="btn w-full max-w-xs bg-gray-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Leave Lobby</button>
    </div>
    <div class="mb-4">
      <button @click="sendMessage" class="btn w-full max-w-xs mb-2 bg-green-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Send Message</button>
      <div class="flex space-x-2 mb-2">
        <input v-model="cardRank" placeholder="Enter Card Rank" class="input input-bordered w-full max-w-xs p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        <input v-model="cardSuit" placeholder="Enter Card Suit" class="input input-bordered w-full max-w-xs p-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
        <button @click="sendCard" class="btn bg-yellow-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">Send Card</button>
      </div>
      <button @click="drawCards" class="btn w-full max-w-xs bg-red-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">Draw Cards</button>
    </div>
    <button @click="startGame" class="btn w-full max-w-xs mb-2 bg-purple-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500">Start Game</button>
    <div v-if="hands && hands[username]">
      <h2>Your Hand</h2>
      <div v-for="card in hands[username]" :key="`${card.rank}-${card.suit}`">
        <Card :rank="card.rank" :suit="card.suit" @click="playCard(card)" />
      </div>
    </div>
    <button @click="pickUpBottomCard" class="btn w-full max-w-xs bg-orange-500 text-white py-2 px-4 rounded-md shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500">Pick Up Bottom Card</button>
    <div>
      <h2>Messages</h2>
      <ul>
        <li v-for="msg in messages" :key="msg">{{ msg }}</li>
      </ul>
    </div>
    <div v-if="hands" class="mt-4">
      <div v-for="(hand, playerId) in hands" :key="playerId" class="mt-4">
        <h3 v-if="playerId === socketId" class="text-lg font-bold">Your Hand</h3>
        <h3 v-else class="text-lg font-bold">{{ playerId }}'s Hand</h3>
        <div class="flex space-x-2">
          <Card v-for="card in hand" :key="card.rank + card.suit" v-if="playerId === socketId" :rank="card.rank" :suit="card.suit" class="w-16 h-24" />
          <img v-else src="@/assets/red2.svg" alt="Card Back" class="w-16 h-24 rounded-md shadow-md" />
        </div>
      </div>
    </div>
    <div v-for="(count, player) in playerCardCounts" :key="player" v-if="player !== socketId">
      <p class="font-bold">{{ player }}: {{ count }} cards</p>
      <div class="flex space-x-2">
        <div v-for="n in count" :key="n" class="blank-card">
          <img src="@/assets/red2.svg" alt="Blank Card" class="w-16 h-24 rounded-md shadow-md" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.received-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.blank-card {
  width: 64px;
  height: 96px;
  background-color: white;
  border: 1px solid black;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>