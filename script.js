// === GAME SETUP ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 50;
let currentFloor = 0;

const floors = [
  // Floor 0: Entry / Main hall
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  // Floor 1: Upstairs
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
];

// Player setup
const player = { x:1, y:1, color:'cyan', floor:0, flashlight:true };
let inventory = [];

// Ghost setup
let ghost = { x:14, y:5, floor:0, active:false };

// Notes / story
const notes = {
  'note1': "The house is alive. Trust nothing.",
  'note2': "Keys open more than doors...",
  'note3': "He is always watching. Run if you hear the whispers."
};

// === DRAW FUNCTIONS ===
function drawMap() {
  const map = floors[currentFloor];
  for(let y=0; y<map.length; y++){
    for(let x=0; x<map[y].length; x++){
      switch(map[y][x]){
        case 1: ctx.fillStyle='gray'; break;       // Wall
        case 2: ctx.fillStyle='brown'; break;      // Door
        case 3: ctx.fillStyle='yellow'; break;     // Key / Item
        default: ctx.fillStyle='black'; break;
      }
      ctx.fillRect(x*tileSize, y*tileSize, tileSize, tileSize);
      ctx.strokeStyle='white';
      ctx.strokeRect(x*tileSize, y*tileSize, tileSize, tileSize);
    }
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x*tileSize, player.y*tileSize, tileSize, tileSize);
}

function drawGhost() {
  if(ghost.active && ghost.floor === currentFloor){
    ctx.fillStyle = 'red';
    ctx.fillRect(ghost.x*tileSize, ghost.y*tileSize, tileSize, tileSize);
  }
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMap();
  drawPlayer();
  drawGhost();
}

// === INVENTORY ===
function addToInventory(item){
  if(!inventory.includes(item)){
    inventory.push(item);
    const list = document.getElementById('inventoryList');
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }
}

// === RANDOM EVENTS / SCARE ===
function randomEvent(){
  if(Math.random() < 0.02){
    ctx.fillStyle = 'red';
    ctx.font = '60px Arial';
    ctx.fillText('AHHH!', 250, 300);
    playSound('assets/placeholder.mp3');
    setTimeout(draw, 500);
  }
}

function playSound(src){
  const sound = new Audio(src);
  sound.play();
}

// === GHOST AI ===
function ghostAI(){
  if(!ghost.active) return;
  if(ghost.floor !== currentFloor) return;
  const dx = player.x - ghost.x;
  const dy = player.y - ghost.y;
  if(Math.abs(dx) > Math.abs(dy)){
    ghost.x += dx>0?1:-1;
  } else {
    ghost.y += dy>0?1:-1;
  }
}

// === MOVEMENT / COLLISION ===
document.addEventListener('keydown', e=>{
  let nx = player.x;
  let ny = player.y;
  switch(e.key){
    case 'ArrowUp':
    case 'w': ny--; break;
    case 'ArrowDown':
    case 's': ny++; break;
    case 'ArrowLeft':
    case 'a': nx--; break;
    case 'ArrowRight':
    case 'd': nx++; break;
    case 'f': player.flashlight = !player.flashlight; break; // toggle flashlight
  }

  const map = floors[currentFloor];
  if(map[ny] && map[ny][nx] !== undefined){
    const tile = map[ny][nx];
    if(tile === 0 || tile === 3){
      player.x = nx;
      player.y = ny;
    } else if(tile === 2){
      if(inventory.includes('Key')){
        alert('You used a key to open the door!');
        map[ny][nx] = 0;
        player.x = nx;
        player.y = ny;
      } else {
        alert('The door is locked. Find a key!');
      }
    }
    if(tile === 3){
      addToInventory('Key');
      map[ny][nx] = 0;
      alert('You picked up a key!');
      randomNote();
    }
  }

  ghostAI();
  randomEvent();
  draw();
  checkGhostCatch();
});

// === NOTES / STORY ===
function randomNote(){
  const keys = Object.keys(notes);
  if(Math.random()<0.5){
    const note = notes[keys[Math.floor(Math.random()*keys.length)]];
    alert("You found a note:\n\n"+note);
  }
}

// === GHOST CHASE ===
function activateGhost(){
  ghost.active = true;
  ghost.floor = player.floor;
  playSound('assets/placeholder.mp3');
}

function checkGhostCatch(){
  if(ghost.active && ghost.x === player.x && ghost.y === player.y){
    alert('The ghost caught you! Game Over.');
    resetGame();
  }
}

// === FLOOR TRANSITION ===
function nextFloor(){
  currentFloor++;
  if(currentFloor >= floors.length){
    alert('You escaped the house! Congratulations!');
    resetGame();
  } else {
    alert('You ascend to the next floor...');
    draw();
  }
}

// === RESET ===
function resetGame(){
  player.x = 1;
  player.y = 1;
  currentFloor = 0;
  inventory = [];
  document.getElementById('inventoryList').innerHTML = '';
  ghost.active = false;
  draw();
}

// === START GAME ===
document.getElementById('bgMusic').play().catch(()=>{});
draw();

// Activate ghost after a delay
setTimeout(activateGhost, 15000); // ghost appears after 15 seconds
setInterval(ghostAI, 1000); // ghost moves every second
