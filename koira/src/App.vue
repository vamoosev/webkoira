<template>
  <div id="app" class=" min-h-screen bg-gray-100 flex items-center justify-center font-sans">
    <div v-if="errorMessage" class=" bg-red-500 text-white p-4 rounded mb-4">
      {{ errorMessage }}
    </div>
    <Lobby v-if="!inGame" @lobbyCreated="handleLobbyCreated" @lobbyJoined="handleLobbyJoined" @error="handleError" />
    <Game v-else :lobbyId="lobbyId" :username="username" @lobbyLeft="handleLobbyLeft" @error="handleError" />
  </div>
</template>

<script>
import Lobby from './components/Lobby.vue';
import Game from './components/Game.vue';

export default {
  data() {
    return {
      inGame: false,
      lobbyId: null,
      username: null,
      errorMessage: null
    };
  },
  methods: {
    handleLobbyCreated({ lobbyId, username }) {
      this.lobbyId = lobbyId;
      this.username = username;
      this.errorMessage = null; // Clear any previous error messages
    },
    handleLobbyJoined({ lobbyId, username }) {
      this.lobbyId = lobbyId;
      this.username = username;
      this.inGame = true;
      this.errorMessage = null; // Clear any previous error messages
    },
    handleLobbyLeft() {
      this.lobbyId = null;
      this.username = null;
      this.inGame = false;
      this.errorMessage = null; // Clear any previous error messages
    },
    handleGameStarted() {
      this.inGame = true;
      this.errorMessage = null; // Clear any previous error messages
    },
    handleError(message) {
      this.errorMessage = message;
    }
  },
  components: {
    Lobby,
    Game
  }
};
</script>