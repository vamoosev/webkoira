<template>
  <div class="p-4 bg-white dark:bg-gray-800 shadow-md rounded-md">
    <h1 class="text-4xl font-bold mb-4 dark:text-white mb-2">Game Lobby: {{ lobbyId }}</h1>
    <div class="flex space-x-2 justify-center mb-4">
      <button v-if="!gameStarted" @click="startGame" class="p-2 bg-blue-500 text-white rounded">Start Game</button>
      <button @click="leaveLobby" class="p-2 bg-red-500 text-white rounded">Leave Lobby</button>
    </div>
    <div v-if="users.length > 0" class="mt-4">
      <h3 class="text-lg font-bold dark:text-white">Players in Lobby:</h3>
      <ul class="list-none p-0 m-0">
        <li v-for="user in users" :key="user" class="p-2 my-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-between">
          <span class="font-bold dark:text-white">{{ user }}</span>
        </li>
      </ul>
    </div>
    <div v-if="gameStarted">
      <h2 class="text-lg font-bold mb-4 dark:text-white">Game Started!</h2>
      <!-- Other game-related content -->
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
import { ref, onMounted } from 'vue';
import Card from './Card.vue';
const socket = io('http://localhost:8080');

export default {
  props: {
    lobbyId: {
      type: String,
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const gameStarted = ref(false);
    const hand = ref([]);
    const playedCards = ref([]);
    const users = ref([]);

    const startGame = () => {
      socket.emit('startGame', props.lobbyId);
      socket.on('gameStarted', () => {
        gameStarted.value = true;
      });
      socket.on('dealCards', (dealtHand) => {
        hand.value = dealtHand;
      });
    };

    const playCard = (card) => {
      socket.emit('playCard', props.lobbyId, props.username, card);
    };

    const leaveLobby = () => {
      socket.emit('leaveLobby', props.lobbyId, props.username);
      gameStarted.value = false;
      hand.value = [];
      playedCards.value = [];
      users.value = [];
      socket.on('lobbyLeft', () => {
        emit('lobbyLeft');
      });
    };

    onMounted(() => {
      console.log('Component mounted, setting up socket listeners');
      socket.on('connect', () => {
        console.log('Socket connected');
      });
      socket.onAny((event, ...args) => {
        console.log(`Received event: ${event}`, args);
      });
      socket.on('updateLobby', (data) => {
        console.log('updateLobby event received:', data);
        if (data.lobbyId === props.lobbyId) {
          users.value = data.users;
          console.log('Users updated:', users.value);
        }
      });
      socket.on('cardPlayed', ({ player, card }) => {
        if (player !== props.username) {
          playedCards.value.push(card);
        }
      });
    });

    return {
      gameStarted,
      hand,
      playedCards,
      users,
      startGame,
      playCard,
      leaveLobby,
      lobbyId: props.lobbyId, // Ensure `lobbyId` is available to the template
    };
  },
  components: {
    Card
  }
};
</script>

<style scoped>
/* Add any additional scoped styles here if needed */
</style>