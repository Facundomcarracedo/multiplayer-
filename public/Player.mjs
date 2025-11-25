class Player {
  constructor({x, y, score, id}) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.id = id;
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case 'up':
        this.y -= speed;
        break;
      case 'down':
        this.y += speed;
        break;
      case 'left':
        this.x -= speed;
        break;
      case 'right':
        this.x += speed;
        break;
    }
  }

  collision(item) {
    // Assuming both player and item have width/height or we use a default collision box
    // Using a simple bounding box collision detection
    const playerSize = 30; // Default player size
    const itemSize = 30; // Default item size
    
    return (
      this.x < item.x + itemSize &&
      this.x + playerSize > item.x &&
      this.y < item.y + itemSize &&
      this.y + playerSize > item.y
    );
  }

  calculateRank(arr) {
    // Count how many players have a score greater than this player's score
    let playersWithHigherScore = 0;
    
    for (let player of arr) {
      if (player.score > this.score) {
        playersWithHigherScore++;
      }
    }
    
    const currentRank = playersWithHigherScore + 1;
    const totalPlayers = arr.length;
    
    return `Rank: ${currentRank}/${totalPlayers}`;
  }
}

export default Player;
