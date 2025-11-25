require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

// Security headers using helmet@3.21.3
app.use(helmet.noSniff()); // Prevent MIME type sniffing
app.use(helmet.xssFilter()); // Prevent XSS attacks
app.use(helmet.noCache()); // Prevent caching
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' })); // Hide/fake the powered-by header

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Socket.io setup
const io = socket(server);

// Game state
const players = {};
let collectible = generateCollectible();

function generateCollectible() {
  return {
    x: Math.floor(Math.random() * 580) + 30,
    y: Math.floor(Math.random() * 430) + 30,
    value: Math.floor(Math.random() * 3) + 1,
    id: Date.now() + Math.random()
  };
}

io.on('connection', (socket) => {
  console.log('New player connected:', socket.id);
  
  // Create new player
  players[socket.id] = {
    x: Math.floor(Math.random() * 580) + 30,
    y: Math.floor(Math.random() * 430) + 30,
    score: 0,
    id: socket.id
  };
  
  // Send current game state to new player
  socket.emit('init', {
    id: socket.id,
    players: players,
    collectible: collectible
  });
  
  // Notify all other players about new player
  socket.broadcast.emit('new-player', players[socket.id]);
  
  // Handle player movement
  socket.on('move-player', (dir, speed) => {
    const player = players[socket.id];
    if (!player) return;
    
    // Update player position
    switch(dir) {
      case 'up':
        player.y = Math.max(0, player.y - speed);
        break;
      case 'down':
        player.y = Math.min(450, player.y + speed);
        break;
      case 'left':
        player.x = Math.max(0, player.x - speed);
        break;
      case 'right':
        player.x = Math.min(610, player.x + speed);
        break;
    }
    
    // Broadcast updated position to all players
    io.emit('update-player', player);
  });
  
  // Handle collectible collision
  socket.on('collect-item', () => {
    const player = players[socket.id];
    if (!player) return;
    
    // Check collision
    const playerSize = 30;
    const itemSize = 30;
    
    if (
      player.x < collectible.x + itemSize &&
      player.x + playerSize > collectible.x &&
      player.y < collectible.y + itemSize &&
      player.y + playerSize > collectible.y
    ) {
      // Update player score
      player.score += collectible.value;
      
      // Generate new collectible
      collectible = generateCollectible();
      
      // Notify all players
      io.emit('update-collectible', collectible);
      io.emit('update-player', player);
    }
  });
  
  // Handle player disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    io.emit('remove-player', socket.id);
  });
});

module.exports = app; // For testing
