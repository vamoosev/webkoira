<template>
  <div class="p-4 bg-white dark:bg-gray-800 shadow-md rounded-md">
    <input v-model="username" placeholder="Enter your username" class="mb-2 p-2 border rounded w-full dark:bg-gray-700 dark:text-white" />
    <input v-model="lobbyId" placeholder="Enter lobby ID" class="mb-2 p-2 border rounded w-full dark:bg-gray-700 dark:text-white" />
    <div class="flex space-x-2">
      <button @click="joinLobby" class="p-2 bg-green-500 text-white rounded w-full">Join Lobby</button>
      <button @click="createLobby" class="p-2 bg-blue-500 text-white rounded w-full">Create Lobby</button>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';
const socket = io('http://localhost:8080');

export default {
  data() {
    return {
      username: '',
      lobbyId: ''
    };
  },
  methods: {
    createLobby() {
      socket.emit('createLobby', this.username);
      socket.on('lobbyCreated', (data) => {
        console.log('Lobby created:', data);
        this.$emit('lobbyCreated', data);
        this.lobbyId = data.lobbyId; // Set the lobbyId in the component's data
        this.joinLobby(data.lobbyId); // Automatically join the created lobby
      });
      socket.on('error', (message) => {
        this.$emit('error', message);
      });
    },
    joinLobby() {
      console.log('Attempting to join lobby with ID:', this.lobbyId);
      if (typeof this.lobbyId !== 'string' || this.lobbyId.trim() === '') {
        console.error('Invalid lobby ID:', this.lobbyId);
        return;
      }
      socket.emit('joinLobby', this.lobbyId, this.username);
      socket.on('lobbyJoined', (data) => {
        console.log('Lobby joined:', data);
        this.lobbyId = data.lobbyId; // Ensure the lobbyId is set in the component's data
        this.$emit('lobbyJoined', data); // Emit lobbyJoined event
      });
      socket.on('error', (message) => {
        this.$emit('error', message);
      });
    }
  }
};
</script>