import Player from './Player.mjs';
import Collectible from './Collectible.mjs';

const socket = io();
const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

// Game state
let player;
let players = {};
let collectible;
const speed = 5;

// Initialize game
socket.on('init', (data) => {
  player = new Player(data.players[data.id]);
  players = {};
  
  for (let id in data.players) {
    players[id] = new Player(data.players[id]);
  }
  
  collectible = new Collectible(data.collectible);
  
  // Start game loop
  requestAnimationFrame(gameLoop);
});

// Handle new player joining
socket.on('new-player', (playerData) => {
  players[playerData.id] = new Player(playerData);
});

// Handle player updates
socket.on('update-player', (playerData) => {
  if (players[playerData.id]) {
    players[playerData.id].x = playerData.x;
    players[playerData.id].y = playerData.y;
    players[playerData.id].score = playerData.score;
  }
});

// Handle collectible updates
socket.on('update-collectible', (collectibleData) => {
  collectible = new Collectible(collectibleData);
});

// Handle player removal
socket.on('remove-player', (id) => {
  delete players[id];
});

// Keyboard controls
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  
  if (!player) return;
  
  if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') {
    player.movePlayer('up', speed);
    socket.emit('move-player', 'up', speed);
  } else if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') {
    player.movePlayer('down', speed);
    socket.emit('move-player', 'down', speed);
  } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
    player.movePlayer('left', speed);
    socket.emit('move-player', 'left', speed);
  } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
    player.movePlayer('right', speed);
    socket.emit('move-player', 'right', speed);
  }
  
  // Check for collision with collectible
  if (collectible && player.collision(collectible)) {
    socket.emit('collect-item');
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Game loop
function gameLoop() {
  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw border
  context.strokeStyle = 'white';
  context.strokeRect(0, 0, canvas.width, canvas.height);
  
  // Draw collectible
  if (collectible) {
    context.fillStyle = 'gold';
    context.fillRect(collectible.x, collectible.y, 30, 30);
    context.fillStyle = 'black';
    context.font = '12px Arial';
    context.fillText(collectible.value, collectible.x + 10, collectible.y + 20);
  }
  
  // Draw all players
  for (let id in players) {
    const p = players[id];
    
    if (id === player?.id) {
      // Draw current player in different color
      context.fillStyle = 'lime';
    } else {
      // Draw other players
      context.fillStyle = 'cyan';
    }
    
    context.fillRect(p.x, p.y, 30, 30);
    
    // Draw player ID (first 3 chars)
    context.fillStyle = 'black';
    context.font = '10px Arial';
    context.fillText(p.id.substring(0, 3), p.x + 5, p.y + 20);
  }
  
  // Draw scores and rank
  if (player) {
    const allPlayers = Object.values(players);
    const rank = player.calculateRank(allPlayers);
    
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.fillText(`Score: ${player.score}`, 10, 30);
    context.fillText(rank, 10, 50);
    
    // Draw instructions
    context.font = '12px Arial';
    context.fillText('Use WASD or Arrow Keys to move', 10, canvas.height - 10);
  }
  
  requestAnimationFrame(gameLoop);
}

// Handle window focus to prevent issues
window.addEventListener('blur', () => {
  for (let key in keys) {
    keys[key] = false;
  }
});
