// =======================================
// Scopophobia - Full Mega Horror Game
// =======================================

// === GAME SETUP ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 50;
let currentFloor = 0;

// Floors: multiple rooms, 0=empty, 1=wall, 2=door, 3=key/note/item
const floors = [
  // Floor 0 - Entry Hall
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  // Floor 1 - Upstairs
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  // Floor 2 - Basement (secret)
  [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,3,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,0,1,0,0,0,1,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,2,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ]
];

// Player setup
const player = { x:1, y:1, color:'cyan', floor:0, flashlight:true, sanity:100 };
let inventory = [];

// Ghost setup
let ghosts = [
  { x:14, y:5, floor:0, active:false, type:'patrol' },
  { x:3, y:3, floor:1, active:false, type:'chase' }
];

// Notes / story
const notes = {
  'note1': "The house is alive. Trust nothing.",
  'note2': "Keys open more than doors...",
  'note3': "He is always watching. Run if you hear the whispers.",
  'note4': "Some doors should never be opened.",
  'note5': "The basement holds unspeakable secrets."
};

// === AUDIO HELPER ===
function playSound(src){
  const s = new Audio(src);
  s.play();
}

// === DRAW FUNCTIONS ===
function drawMap() {
  const map = floors[currentFloor];
  for(let y=0; y<map.length; y++){
    for(let x=0; x<map[y].length; x++){
      switch(map[y][x]){
        case 1: ctx.fillStyle='gray'; break;       // Wall
        case 2: ctx.fillStyle='brown'; break;      // Door
        case 3: ctx.fillStyle='yellow'; break;     // Key / Note
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

function drawGhosts() {
  ghosts.forEach(g=>{
    if(g.active && g.floor===currentFloor){
      ctx.fillStyle = g.type==='chase'?'red':'magenta';
      ctx.fillRect(g.x*tileSize, g.y*tileSize, tileSize, tileSize);
    }
  });
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMap();
  drawPlayer();
  drawGhosts();
  if(player.sanity<50){
    ctx.fillStyle = `rgba(255,0,0,${(50-player.sanity)/100})`;
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}

// === INVENTORY SYSTEM ===
function addToInventory(item){
  if(!inventory.includes(item)){
    inventory.push(item);
    const list = document.getElementById('inventoryList');
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }
}

// === RANDOM EVENTS ===
function randomEvent(){
  // Jumpscare
  if(Math.random()<0.02){
    ctx.fillStyle='red';
    ctx.font='60px Arial';
    ctx.fillText('AHHH!',250,300);
    playSound('assets/placeholder.mp3');
    setTimeout(draw,500);
  }
  // Sanity drop
  if(Math.random()<0.01 && player.sanity>0){
    player.sanity -= 5;
  }
}

// === GHOST AI ===
function ghostAI(){
  ghosts.forEach(g=>{
    if(!g.active) return;
    if(g.floor!==currentFloor) return;
    const dx = player.x - g.x;
    const dy = player.y - g.y;
    switch(g.type){
      case 'patrol':
        if(Math.random()<0.5) g.x += Math.sign(dx);
        else g.y += Math.sign(dy);
        break;
      case 'chase':
        if(Math.abs(dx)>Math.abs(dy)) g.x += Math.sign(dx);
        else g.y += Math.sign(dy);
        break;
    }
  });
}

// === PLAYER MOVEMENT ===
document.addEventListener('keydown', e=>{
  let nx=player.x, ny=player.y;
  switch(e.key){
    case 'ArrowUp':
    case 'w': ny--; break;
    case 'ArrowDown':
    case 's': ny++; break;
    case 'ArrowLeft':
    case 'a': nx--; break;
    case 'ArrowRight':
    case 'd': nx++; break;
    case 'f': player.flashlight = !player.flashlight; break;
  }

  const map = floors[currentFloor];
  if(map[ny] && map[ny][nx]!==undefined){
    const tile = map[ny][nx];
    if(tile===0 || tile===3){
      player.x=nx; player.y=ny;
    } else if(tile===2){
      if(inventory.includes('Key')){
        alert('You used a key to open the door!');
        map[ny][nx]=0;
        player.x=nx; player.y=ny;
      } else {
        alert('The door is locked. Find a key!');
      }
    }
    if(tile===3){
      addToInventory('Key');
      map[ny][nx]=0;
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

// === GHOST ACTIVATION ===
function activateGhosts(){
  ghosts.forEach(g=>g.active=true);
  playSound('assets/placeholder.mp3');
}

// === CHECK IF GHOST CATCHES PLAYER ===
function checkGhostCatch(){
  ghosts.forEach(g=>{
    if(g.active && g.floor===currentFloor && g.x===player.x && g.y===player.y){
      alert('A ghost caught you! Game Over.');
      resetGame();
    }
  });
}

// === FLOOR TRANSITION ===
function nextFloor(){
  currentFloor++;
  if(currentFloor>=floors.length){
    alert('You escaped! Congratulations!');
    resetGame();
  } else {
    alert('You move to the next floor...');
    draw();
  }
}

// === RESET GAME ===
function resetGame(){
  player.x=1; player.y=1; player.floor=0; player.sanity=100;
  inventory=[];
  document.getElementById('inventoryList').innerHTML='';
  ghosts.forEach(g=>g.active=false);
  draw();
}

// === GAME START ===
document.getElementById('bgMusic').play().catch(()=>{});
draw();

// Activate ghosts after delay
setTimeout(activateGhosts,15000);
setInterval(ghostAI,1000);
