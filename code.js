// GitHub version

let startPageDiv = document.getElementById("startpagediv");
startPageDiv.style.display = "block";
let newWorldPageDiv = document.getElementById("newworldpagediv");
let openWorldPageDiv = document.getElementById("openworldpagediv");
let playDiv = document.getElementById("playdiv");
let settingsWhilePlayingDiv = document.getElementById("settingswhileplayingdiv");
let closeSettingsWhilePlayingButton = document.getElementById("closesettingswhileplayingbutton");
closeSettingsWhilePlayingButton.addEventListener("click", ()=>{
  settingsWhilePlayingDiv.style.display = "none";
});
let saveAndExitButton = document.getElementById("saveandexitbutton");
let gameCodeOutput = document.getElementById("gamecodeoutput");
let gameCodeInput = document.getElementById("gamecodeinput");

let mcan = document.getElementById("mcan"); // main canvas
let pcan = document.getElementById("pcan"); // preparation canvas
let inventoryGUI = document.getElementById("inventory");
let toolsGUI = document.getElementById("tools");
let mcw = window.innerWidth;
let mch = window.innerHeight;
mcan.width = mcw;
mcan.height = mch;
mcan.style.width = "100%";
mcan.style.height = "100%";
let mctx = mcan.getContext("2d", {willReadFrequently: true});
pcan.width = 1000;
pcan.height = 1000;
let pctx = pcan.getContext("2d", {willReadFrequently: true});
let toolHandleColor = colorString(Math.random() * 0.3 + 0.2, Math.random() * 0.3 + 0.2, Math.random() * 0.3 + 0.2, 1);
let physicsLoopCounter = 0;
let jumping = false;
let inventory = [];
let selectedBlock;
let lastSelectedBlockGUI;
let breaking = 1;
let entityIdCounter = 0;
let entities = [];
let entityTouching = undefined;
let laserIdCounter = 0;
let lasers = [];
let firingLasers = false;
let map = [];
let nMax = randomBetween(1001, 1502);
let primes = [];
let pfs = [];
let blocks = [];
let mapGenerated = false;
let view;
let keysDown = [];
let cc = {
  body: [],
  energy: []
};
let mouseDown = false;
let mouseWasDown = false;
let mouseTouching = 1;
let mousePos = {
  x: 0,
  y: 0
}
let bounds = {
  left: false,
  right: false,
  up: false,
  down: false
};
let boundChecks = 16;
let playing = false;

let chunksPerScreenW = Math.ceil(mcan.width/256)+2;
let chunksPerScreenH = Math.ceil(mcan.height/256)+4;

for (let i = 0; i < 1502; i++) {
  pfs.push([]);
}
for (let i = 2; i < 1502; i++) {
  if (pfs[i].length == 0) {
    primes.push({
      n: i,
      c: [randomNum(0.3, 0.7, 1000), randomNum(0.3, 0.7, 1000), randomNum(0.3, 0.7, 1000)],
      noise: randomNum(0.3, 0.7, 1000)
    });
    let j = 1;
    while (i ** j < nMax) {
      let k = i ** j;
      while (k < pfs.length) {
        pfs[k].push(primes.length - 1);
        k += i ** j;
      }
      j++;
    }
  }
}

class TreeData{
    constructor(){
        this.branchColor = [Math.random(), Math.random(), Math.random()];
        this.tiers = randomBetween(3, 8, 1);
        this.growth = randomBetween(2, 4, 1);
        this.angleVary = randomBetween(Math.PI/8, Math.PI/2, 0.01);
        this.branchThickness = randomBetween(6, 19, 1);
        this.branchThicknessProportions = randomBetween(1.5, 2, 0.01);
        this.branchBend = (Math.random()*3-1.5)+1;
        this.branchBendVary = Math.random();
        this.branchWobble = Math.random()*8;
        this.tierSmoothness = Math.random();
        this.segmentExtend = randomBetween(5, 101, 1);
        this.branchColorVary = Math.random()*0.8;
        this.branchSegments = randomBetween(3, 21, 1);
        this.branchSegmentsVary = randomBetween(0, this.branchSegments/2, 1);
        this.branchSegmentLengthVary = Math.random()*0.7;
        this.branchLengthVary = Math.random()*0.7;
        this.branchContinue = Math.random();
        this.branchWaveSize = Math.random()*4;
        this.branchWaveLength = Math.random()*1.5;
        this.branchWaveSizeVary = Math.random()/2;
        this.branchWaveLengthVary = Math.random()/2;
        this.ld = new LeafData();
    }
}

class Tree{
    constructor(treeData, x, y){
        this.treeData = treeData;
        this.x = x;
        this.y = y;
    }
}

class LeafData{
    constructor(){
        this.leafColor = [Math.random(), Math.random(), Math.random(), Math.random()*0.5+0.5];
        this.leafTransparencyVary = Math.random()*0.6;
        this.leafClumpTransparencyVary = Math.random()*0.6;
        this.leafColorVary = ((Math.random()*4)**0.5)/2;
        this.leafClumpColorVary = ((Math.random()*4)**0.5)/2;
        this.leafClumpSpread = ((Math.random()*9)**0.5)/3;
        this.leafClumpAmount = Math.random()*4+1;
        this.leafClumpAngleVary = randomBetween(Math.PI/8, Math.PI/2, 0.01);
        this.leafAngleVary = randomBetween(Math.PI/8, Math.PI/2, 0.01);
        this.leafSizeVary = Math.random()*0.5;
        this.leafClumpSizeVary = Math.random()*0.5;
        this.leafPoints = randomBetween(1, 9, 1);
        this.startInnerD = randomBetween(3, 9, 0.01);
        this.startInnerDVary = randomBetween(0.5, 1.5, 0.01);
        this.innerOuterD = randomBetween(3, 9, 0.01);
        this.innerOuterDVary = randomBetween(0.5, 1.5, 0.01);
        this.innerSpreadAngle = randomBetween(Math.PI/4, Math.PI*1.5, 0.01);
        this.innerSpreadAngleVary = randomBetween(0.5, 1.5, 0.01);
        this.innerAngleVary = Math.random()*this.innerSpreadAngle/this.leafPoints/2;
        this.outerAngleVary = Math.random()*this.innerSpreadAngle/this.leafPoints/2;
    }
}

function drawPick(pick, ctx, x, y) {
  ctx.strokeStyle = toolHandleColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 4);
  ctx.lineTo(x + 8, y + 8);
  ctx.stroke();
  ctx.strokeStyle = pick.c;
  ctx.beginPath();
  ctx.arc(x, y, 8, Math.PI * 7 / 8, Math.PI * 13 / 8);
  ctx.stroke();
}

function drawSword(sword, ctx, x, y) {
  ctx.lineWidth = 4;
  ctx.strokeStyle = sword.c;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 12, y - 12);
  ctx.stroke();
  ctx.strokeStyle = toolHandleColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + 8, y + 8);
  ctx.moveTo(x - 4, y + 4);
  ctx.lineTo(x + 4, y - 4);
  ctx.stroke();
}

let drawToolFunctions = [drawPick, drawSword];

function drawToolIcon(tool){
    tool.ctx.fillStyle = "#808080FF";
    tool.ctx.fillRect(0, 0, 40, 40);
    tool.drawSelf(tool, tool.ctx, 16, 16);
    tool.ctx.font = "16px serif";
    tool.ctx.fillStyle = "#000000FF";
    tool.ctx.fillText("".concat(tool.n), 0, 32);
}

for (let i=0; i<2; i++) {
  let can = document.createElement("canvas");
  can.width = 32;
  can.height = 32;
  toolsGUI.appendChild(can);
}

class Tool {
  constructor(type, n) {
  	this.type = type;
    this.n = n;
    this.n1 = -1;
    this.c = "#FFFFFFFF";
    if (n > 1) {
      this.n1 = primes[getNumIndex(primes, n)+1].n;
      this.c = colorString(...primes[getNumIndex(primes, n)].c, 1);
    }
    this.can = toolsGUI.children[type];
    this.ctx = this.can.getContext("2d");
    this.drawSelf = drawToolFunctions[type];
    drawToolIcon(this);
    this.can.addEventListener("click", ()=>{
      let sbi = -3;
      let ti = -1;
      for (let i=0; i<primes.length; i++) {
        if (primes[i].n == selectedBlock) {
          sbi = i;
        }
        if (primes[i].n == this.n) {
          ti = i;
        }
      }
      if (sbi == ti+1) {
        let index = 0;
        for (let i=0; i<inventory.length; i++) {
          if (inventory[i].n == selectedBlock) {
            index = i;
          }
        }
        if (inventory[index].a >= selectedBlock**2) {
          this.n = selectedBlock;
          this.n1 = primes[sbi+1].n;
          this.c = colorString(...primes[sbi].c, 1);
          drawToolIcon(this);
          increaseInventoryBlockAmount(index, -1*selectedBlock**2);
        }
      }
    });
  }
}

let tools = [];
tools.push(new Tool(0, 1));
tools.push(new Tool(1, 1));
let pick = tools[0];

class Block {
  constructor(n) {
    this.n = n;
    if (n != 1) {
      this.c = [1, 1, 1, 1];
      this.noise = 1;
      for (let i = 0; i < pfs[n].length; i++) {
        this.c[0] *= primes[pfs[n][i]].c[0] * 0.8;
        this.c[1] *= primes[pfs[n][i]].c[1] * 0.8;
        this.c[2] *= primes[pfs[n][i]].c[2] * 0.8;
        this.noise *= primes[pfs[n][i]].noise;
        this.c[0] = Math.floor(this.c[0]*1000)/1000;
        this.c[1] = Math.floor(this.c[1]*1000)/1000;
        this.c[2] = Math.floor(this.c[2]*1000)/1000;
        this.noise = Math.floor(this.noise*1000)/1000;
      }
      this.imgdt = new ImageData(16, 16);
      for (let i = 0; i < 1024; i++) {
        this.imgdt.data[i] = this.c[i % 4] * 255 * (1 - Math.random() * (1 - this.noise));
      }
    } else {
      this.c = [0, 0, 0, 1];
      this.imgdt = new ImageData(16, 16);
    }
  }
}

class NonBlock{
    constructor(imgdt, x, y){
        this.imgdt = imgdt;
        this.x = x;
        this.y = y;  
    }
}

class Chunk {
  constructor(id) {
    this.id = id;
    this.map = [];
    for (let i = 0; i < 256; i++) {
      this.map.push({
        n: 0,
        b: 0
      });
    }
    this.nonBlocks = [];
    this.imgdt = new ImageData(256, 256);
  }
  resetImgdt() {
    for (let i = 0; i < this.map.length; i++) {
        let b = 0;
        for (let j=-6; j<7; j++) {
            for (let k=-6; k<7; k++) {
                if (setBlock((this.id % 16) * 16 + i % 16 + j, Math.floor(this.id / 16) * 16 + Math.floor(i / 16) + k, 0) == 1) {
                    b += 3/169;
                }
            }
        }
      if (b > 1) {
        b = 1;
      }
      this.map[i].b = b;
    }
    for (let i = 0; i < 262144; i++) {
      let bx = Math.floor(i / 64) % 16;
      let by = Math.floor(i / 16384);
      let px = Math.floor(i / 4) % 16;
      let py = Math.floor(i / 1024) % 16;
      if (blocks[this.map[by * 16 + bx].n].n == 1) {
        if (i % 4 == 3) {
          this.imgdt.data[i] = 255;
        } else {
          this.imgdt.data[i] = 0;
        }
      } else {
        if (i % 4 == 3) {
          this.imgdt.data[i] = 255;
        } else {
          this.imgdt.data[i] = blocks[this.map[by * 16 + bx].n].imgdt.data[py * 64 + px * 4 + i % 4] * this.map[by * 16 + bx].b + (1 - this.map[by * 16 + bx].b) * 255 * uc[i % 4];
        }
      }
    }
  }
  resetNearbyImgdts(){
  	for (let i=-1; i<2; i++) {
    	for (let j=-1; j<2; j++) {
      	let nid = this.id+i*256+j;
      	if (nid >= 0 && nid < 512) {
          map[nid].resetImgdt();
        }
      }
    }
  }
}

let entityTypes = {
    energyParticle: {
        name: "energy particle",
        behavior: ()=>{},
        startingState: {func: wanderBehavior, args: []},
        startingVars: [Math.random()*2-1, Math.random()*2-1],
        drop: (entity)=>{
            view.energy ++;
        },
        drawSelf: (ctx, x, y, entity)=>{
            ctx.fillStyle = "white";
            ctx.fillRect(x-4, y-4, 8, 8);
        },
        maxHealth: 1,
        constructor: (entity)=>{},
        canDamageByTouching: true
    },
    rogueRobot: {
        name: "rogue robot",
        behavior: (entity)=>{
            if (physicsLoopCounter%(20-entity.ob.level*3) == 0 && inViewCenteredBounds(entity.x/16, entity.y/16, 20)) {
                new Laser(entity, view.x, view.y, true, 5+entity.ob.level*3, [1, entity.ob.level/5, 0]);
            }
        },
        startingState: {func: wanderBehavior, args: []},
        startingVars: [Math.random()*2-1, Math.random()*2-1],
        drop: (entity)=>{
            increaseInventoryNumAmount(weightedArrayPick(primes, 0.3, entity.ob.level*4).n, 8+entity.ob.level*16);
        },
        drawSelf: (ctx, x, y, entity)=>{
            ctx.fillStyle = "#404040FF";
            ctx.fillRect(x-16, y-16, 32, 32);
            ctx.fillStyle = colorString(1, entity.ob.level/5, 0, 1);
            ctx.fillRect(x-12, y-12, 24, 24);
            ctx.fillStyle = "#404040FF";
            ctx.fillRect(x-8, y-8, 16, 16);
        },
        maxHealth: 50,
        constructor: (entity)=>{
            entity.maxHealth = entity.ob.level*50+50;
            entity.health = entity.maxHealth;
        },
        canDamageByTouching: false
    }
}

class Entity {
    constructor(entityType, x, y, ob){
        this.entityType = entityType;
        this.state = entityType.startingState;
        this.vars = entityType.startingVars;
        this.maxHealth = this.entityType.maxHealth;
        this.health = this.maxHealth;
        this.ob = ob;
        this.x = x;
        this.y = y;
        this.velX = 0;
        this.velY = 0;
        this.id = entityIdCounter;
        entityIdCounter ++;
        entities.push(this);
    }
    drawSelf(ctx, x, y){
        this.entityType.drawSelf(ctx, x, y, this);
    }
}

class Laser{
    constructor(entity, tarX, tarY, isEnemy, speed, color){
        this.id = laserIdCounter;
        laserIdCounter ++;
        this.isEnemy = isEnemy;
        this.speed = speed;
        this.color = color;
        this.tarX = tarX;
        this.tarY = tarY;
        this.x = entity.x;
        this.y = entity.y;
        this.maxDamage = 1;
        this.timeCounter = 0;
        this.opacity = 1;
        this.angle = Math.atan2(tarY-this.y, tarX-this.x);
        this.velX = Math.cos(this.angle)*speed;
        this.velY = Math.sin(this.angle)*speed;
        lasers.push(this);
    }
    drawSelf(ctx, x, y){
        ctx.strokeStyle = colorString(...this.color, this.opacity);
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x-Math.cos(this.angle)*10, y-Math.sin(this.angle)*10);
        ctx.lineTo(x+Math.cos(this.angle)*10, y+Math.sin(this.angle)*10);
        ctx.stroke();
    }
    remove(){
        let index = getIdIndex(lasers, this.id);
        lasers.splice(index, 1);
    }
    physics(){
        this.x += this.velX;
        this.y += this.velY;
        if (this.timeCounter > 20) {
            this.opacity -= 1/20;
        }
        if (this.opacity <= 0) {
            this.remove();
        }
        this.timeCounter ++;
    }
}

function switchPageButtonSetup(buttonId, startPageId, endPageId, func){
  document.getElementById(buttonId).addEventListener("click", ()=>{
    document.getElementById(startPageId).style.display = "none";
    document.getElementById(endPageId).style.display = "block";
    if (func != undefined) {
      func();
    }
  });
}

switchPageButtonSetup("newworldbutton", "startpagediv", "newworldpagediv");
switchPageButtonSetup("openworldbutton", "startpagediv", "openworldpagediv");
switchPageButtonSetup("newworldpagebackbutton", "newworldpagediv", "startpagediv");
switchPageButtonSetup("openworldpagebackbutton", "openworldpagediv", "startpagediv");
switchPageButtonSetup("saveandexitbutton", "playdiv", "saveandexitpagediv");
switchPageButtonSetup("saveandexitbutton", "settingswhileplayingdiv", "saveandexitpagediv", ()=>{
  playing = false;
  gameCodeOutput.innerText = saveCurrentWorldAsCode();
});
switchPageButtonSetup("saveandexitcontinueplayingbutton", "saveandexitpagediv", "playdiv", ()=>{
  startPlaying();
});
switchPageButtonSetup("saveandexitbacktostartpagebutton", "saveandexitpagediv", "startpagediv");
switchPageButtonSetup("generateandplaybutton", "newworldpagediv", "playdiv", ()=>{
  generateNewWorld();
  startPlaying();
});
switchPageButtonSetup("openworldbycodebutton", "openworldpagediv", "playdiv", ()=>{
  let world = getWorldFromCode(gameCodeInput.value);
  gameCodeInput.value = "";
  startPlaying(world);
});

function getWorldFromCode(code){
  mapGenerated = false;
  let world = JSON.parse(code);
  world.map = replaceDecompress1(world.map);
  world.map = decompressAdjacentSameArrayItems(world.map.split(","));
  let map2 = [];
  for (let i = 0; i < 512; i++) {
    let chunk = new Chunk(i);
    map2.push(chunk);
  }
  for (let i=0; i<512*256; i++) {
    map2[Math.floor(i/256)].map[i%256] = {n: world.map[i], b: 0};
    if (world.map[i] == undefined) {
      map2[Math.floor(i/256)].map[i%256].n = 1;
    }
  }
  world.map = map2;
  console.log(world.map);
  map = world.map;
  let blocks2 = [, new Block(1)];
  world.blocks.otherData = replaceDecompress1(world.blocks.otherData).split(",");
  world.blocks.imgdts = replaceDecompress1(world.blocks.imgdts).split(",");
  for (let i=0; i<world.blocks.otherData.length/4; i++) {
    let imgdt = new ImageData(16, 16);
    let k = 0;
    for (let j=0; j<imgdt.data.length; j++) {
      if (j%4 == 3) {
        imgdt.data[j] = 255;
      } else {
        imgdt.data[j] = world.blocks.imgdts[i*768+k];
        k ++;
      }
    }
    blocks2.push({
      n: i+2,
      c: world.blocks.otherData.slice(i*4, i*4+3),
      noise: world.blocks.otherData[i*4+3],
      imgdt: imgdt
    });
  }
  world.blocks = blocks2;
  blocks = world.blocks;
  uc = world.uc;
  cc = world.cc;
  for (let i=0; primes[i].n<blocks.length; i++) {
    primes[i].c = blocks[primes[i].n].c;
    primes[i].noise = blocks[primes[i].n].noise;
  }
  tools = [];
  for (let i=0; i<world.tools.length; i+=2) {
    tools.push(new Tool(...world.tools.slice(i, i+2)));
  }
  pick = tools[0];
  inventory = [];
  mapGenerated = true;
  return world;
};

function randomNum(times, add, precision){
  return Math.floor((Math.random()*times+add)*precision)/precision;
}

function generateNewWorld(){
  mapGenerated = false;
  uc = [Math.random() * 0.2 + 0.3, Math.random() * 0.2 + 0.3, Math.random() * 0.2 + 0.3];
  map = [];
  nMax = randomBetween(1001, 1502);
  blocks = [];
  cc = {
    body: [],
    energy: []
  };
  for (let i = 0; i < 3; i++) {
    cc.body.push(Math.random() * 0.2 + 0.4);
  }
  for (let i = 0; i < 3; i++) {
    cc.energy.push(Math.random() * 0.3 + 0.7);
  }
  for (let i=0; i<primes.length; i++) {
    primes[i].c = [randomNum(0.3, 0.7, 1000), randomNum(0.3, 0.7, 1000), randomNum(0.3, 0.7, 1000)];
    primes[i].noise = randomNum(0.3, 0.7, 1000);
  }
  for (let i = 1; i < nMax; i++) {
    blocks[i] = new Block(i);
  }

  for (let i = 0; i < 512; i++) {
    let chunk = new Chunk(i);
    map.push(chunk);
  }
  for (let i = 0; i < 256; i++) {
    setBlock(i, 511, nMax - 1)
  }
  for (let i = 510; i > -1; i--) {
    for (let j = 0; j < 256; j++) {
      let choosing = true;
      let x = randomBetween(j - 1, j + 2);
      let y = randomBetween(i + 1, i + 3);
      while (choosing) {
        x = randomBetween(j - 1, j + 2);
        y = randomBetween(i + 1, i + 3);
        if (x > -1) {
          if (y > -1) {
            if (x < 256) {
              if (y < 512) {
                choosing = false;
              }
            }
          }
        }
      }
      let set = setBlock(x, y, 0);
      if (set > 1) {
        if (Math.random() > 0.05) {
          setBlock(j, i, set);
        } else {
          let factor = 0;
          pfs[set].forEach((item) => {
            if (Math.random() < 1 / primes[item].n) {
              factor = primes[item].n;
            }
          });
          if (factor == 0) {
            let decrease = true;
            for (let i = 0; i < pfs[set].length; i++) {
              if (Math.random() < 0.7) {
                decrease = false;
              }
            }
            if (decrease) {
              setBlock(j, i, set - 1);
            } else {
              setBlock(j, i, set);
            }
          } else {
            setBlock(j, i, set / factor);
          }
        }
      } else {
        setBlock(j, i, set);
      }
    }
  }
  for (let i=0; i<512; i++) {
      let chunk = map[i];
      for (let j=0; j<1; j++) {
          let x = (i%16)*16+Math.floor(Math.random()*16);
          let y = Math.floor(i/16)*16+Math.floor(Math.random()*16);
          if (setBlock(x, y, 0) != 1) {
              //chunk.nonBlocks.push(new NonBlock(treeImgdts[Math.floor(Math.random()*treeImgdts.length)], x*16, y*16));
          }
      }
  }
  tools = [];
  tools.push(new Tool(0, 1));
  tools.push(new Tool(1, 1));
  pick = tools[0];
  mapGenerated = true;
}

function startPlaying(world){
  map.forEach((chunk) => {
    chunk.resetImgdt();
  });
  respawnView();
  playing = true;
  inventory = [];
  while (inventoryGUI.children.length > 0) {
    inventoryGUI.removeChild(inventoryGUI.children[0]);
  }
  if (world != undefined) {
    for (let i=0; i<world.inventory.length; i++) {
      increaseInventoryNumAmount(world.inventory[i].n*1, world.inventory[i].a*1);
    }
  }
  drawingLoop();
  physicsLoop();
}

function saveCurrentWorldAsCode(){
  let map2 = [];
  for (let i=0; i<map.length; i++) {
    for (let j=0; j<map[i].map.length; j++) {
      map2.push(map[i].map[j].n);
    }
  }
  map2 = compressAdjacentSameArrayItems(map2).join();
  map2 = replaceCompress1(map2);
  let blocksOtherData = [];
  let blocksImgdts = [];
  for (let i=2; i<blocks.length; i++) {
    blocksOtherData.push(...blocks[i].c.slice(0, 3), blocks[i].noise);
    for (let j=0; j<blocks[i].imgdt.data.length; j++) {
      if (j%4 != 3) {
        blocksImgdts.push(blocks[i].imgdt.data[j]);
      }
    }
  }
  blocksOtherData = replaceCompress1(blocksOtherData.join());
  blocksImgdts = replaceCompress1(blocksImgdts.join());
  let tools2 = [];
  for (let i=0; i<tools.length; i++) {
    tools2.push(tools[i].type, tools[i].n);
  }
  let world = {map: map2, inventory: inventory, blocks: {otherData: blocksOtherData, imgdts: blocksImgdts}, uc: uc, cc: cc, tools: tools2};
  console.log(world);
  return JSON.stringify(world);
}

function replaceCompress1(text){
    let newChars = [];
    for (let i=65; i<91; i++) {
        newChars.push(String.fromCharCode(i));
    }
    let separator = newChars.shift();
    let decompressKey = "";
    let newText = text;
    let done = false;
    while (!done) {
        let goodString = {benefit: -Infinity};
        let fullNewText = decompressKey+newText;
        searchForGoodStringLoop: for (let i=2; i>1; i--) {
            for (let j=0; j<fullNewText.length-i+1; j++) {
                if (fullNewText.substring(j, j+i) != goodString.string) {
                    let string = {
                        string: fullNewText.substring(j, j+i),
                        benefit: -2-i,
                        count: 0
                    }
                    for (let k=0; k<fullNewText.length-i+1; k++) {
                        if (fullNewText.substring(k, k+i) == string.string) {
                            string.benefit += i-1;
                            string.count ++;
                            k += i-1;
                        }
                    }
                    if (string.benefit > 0 && !containsChar(string.string, [separator])) {
                        goodString = string;
                        break searchForGoodStringLoop;
                    }
                }
            }
        }
        console.log(goodString);
        if (goodString.benefit > 0) {
            let replacer = newChars.shift();
            decompressKey = decompressKey.replaceAll(goodString.string, replacer);
            newText = newText.replaceAll(goodString.string, replacer);
            decompressKey = replacer+goodString.string+separator+decompressKey;
            if (newChars.length == 0) {
                done = true;
            }
        } else {
            done = true;
        }
    }
    return decompressKey+newText;
}

function replaceDecompress1(text){
  let text2 = text;
  while (text2.split("A").length > 1) {
    let decompressKey = text2.split("A")[0];
    text2 = text2.substring(decompressKey.length+1, text2.length);
    let replacer = decompressKey[0];
    let replaced = decompressKey.substring(1, decompressKey.length);
    text2 = text2.replaceAll(replacer, replaced);
  }
  return text2;
}

function containsChar(string, chars){
    let hasChar = false;
    for (let i=0; i<chars.length; i++) {
        for (let j=0; j<string.length; j++) {
            if (string[j] == chars[i]) {
                hasChar = true;
            }
        }
    }
    return hasChar;
}

let treeImgdts = [];
for (let i=0; i<0; i++) {
    let td = new TreeData();
    for (let j=0; j<3; j++) {
        pctx.clearRect(0, 0, pcan.width, pcan.height);
        drawTree(td, pctx, mcan.width, 0, 0, 100, 480, 400/mcan.height, [1, 1, 1]);
        treeImgdts.push(pctx.getImageData(0, 0, pcan.width, pcan.height));
    }
}

function seenNewBlock(block) {
  let div = document.createElement("div");
  let next = -1;
  let nextFound = false;
  while (!nextFound) {
    next++;
    if (inventory[next] == undefined) {
      inventoryGUI.appendChild(div);
      inventory.push({
        n: block,
        a: 0
      });
      nextFound = true;
    } else {
      if (inventory[next].n > block) {
        inventoryGUI.insertBefore(div, inventoryGUI.childNodes[next]);
        inventory.splice(next, 0, {
          n: block,
          a: 0
        });
        nextFound = true;
      }
    }
  }
  let h3n = document.createElement("h3");
  h3n.innerText = "".concat(block);
  h3n.style.display = "inline";
  div.appendChild(h3n);
  let canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  canvas.style.width = "16px";
  canvas.style.height = "16px";
  canvas.style.display = "inline";
  let ctx = canvas.getContext("2d");
  ctx.putImageData(blocks[block].imgdt, 0, 0);
  div.appendChild(canvas);
  let h3a = document.createElement("h3");
  h3a.innerText = "0";
  h3a.style.display = "inline";
  div.appendChild(h3a);
  div.addEventListener("click", function() {
    selectedBlock = block;
    if (lastSelectedBlockGUI != undefined) {
      lastSelectedBlockGUI.style.border = "none";
    }
    div.style.border = "4px solid #FFFFFF";
    lastSelectedBlockGUI = div;
  });
}

function respawnView() {
    view = {
        x: 2000,
        y: -256,
        velX: 0,
        velY: 0,
        onGround: true,
        maxHealth: 100,
        health: 100,
        maxEnergy: 50,
        energy: 50
      };
}

function keypress(event) {
  let hasKey = false;
  keysDown.forEach((key) => {
    if (key == event.key) {
      hasKey = true;
    }
  });
  if (!hasKey) {
    keysDown.push(event.key);
  }
  if (event.key == "Escape" && playDiv.style.display == "block") {
    settingsWhilePlayingDiv.style.display = "block";
  }
}
document.addEventListener("keydown", keypress);

function keyup(event) {
  for (let i = 0; i < keysDown.length; i++) {
    if (keysDown[i] == event.key) {
      keysDown.splice(i, 1);
    }
  }
}
document.addEventListener("keyup", keyup);

function mousemove(event) {
  let x = Math.floor((view.x - mcw / 2 + event.x) / 16);
  let y = Math.floor((view.y - mch / 2 + event.y) / 16);
  mouseTouching = 1;
  if (setBlock(x, y, 0) != 1) {
    if (setBlock(x, y, "b") > 0.2) {
      mouseTouching = setBlock(x, y, 0);
      let seenNew = true;
      inventory.forEach((item) => {
        if (mouseTouching == item.n) {
          seenNew = false;
        }
      });
      if (seenNew) {
        seenNewBlock(mouseTouching);
      }
    }
  }
  entityTouching = undefined;
  for (let i=0; i<entities.length; i++) {
    let entity = entities[i];
    if (Math.abs(entity.x/16-x)+Math.abs(entity.y/16-y) < 1) {
        mouseTouching = entity.entityType.name+" ("+Math.ceil(entity.health)+"/"+entity.maxHealth+")";
        entityTouching = entity;
    }
  }
  mousePos.x = event.x;
  mousePos.y = event.y;
}
mcan.addEventListener("mousemove", mousemove);

function mousedown() {
  mouseDown = true;
}
mcan.addEventListener("mousedown", mousedown);

function mouseup() {
  mouseDown = false;
}
mcan.addEventListener("mouseup", mouseup);

function determineBounds() {
  bounds = {
    left: false,
    right: false,
    up: false,
    down: false
  };
  for (let i = -1; i < 2; i++) {
    if (setBlock(Math.floor(view.x / 16 + i * 0.9), Math.floor(view.y / 16 + 1), 0) != 1) {
      bounds.down = true;
    }
    if (setBlock(Math.floor(view.x / 16 + i * 0.9), Math.floor(view.y / 16 - 1), 0) != 1) {
      bounds.up = true;
    }
    if (setBlock(Math.floor(view.x / 16 - 1), Math.floor(view.y / 16 + i * 0.9), 0) != 1) {
      bounds.left = true;
    }
    if (setBlock(Math.floor(view.x / 16 + 1), Math.floor(view.y / 16 + i * 0.9), 0) != 1) {
      bounds.right = true;
    }
  }
  if (bounds.down) {
    if (view.velY > 0) {
      view.y = Math.round(view.y / 16) * 16;
      view.velY = 0;
    }
    if (bounds.up) {
      if (view.velY < 0) {
        view.y -= view.velY * 0.9 / boundChecks;
        view.y = Math.round(view.y / 16) * 16;
        view.velY = 0;
      }
    }
    if (bounds.left) {
      if (view.velX < 0) {
        view.x = Math.round(view.x / 16) * 16;
        view.velX = 0;
      }
    }
    if (bounds.right) {
      if (view.velX > 0) {
        view.x = Math.round(view.x / 16) * 16;
        view.velX = 0;
      }
    }
  }
}

function drawingLoop() {
  mctx.fillStyle = "#000000FF";
  mctx.fillRect(0, 0, mcw, mch);
  let nonBlocksToPaste = [];
  for (let i = 0; i < chunksPerScreenW*chunksPerScreenH; i++) {
    let mapIndex = (Math.floor(view.y/256-chunksPerScreenH/2)+Math.floor(i/chunksPerScreenW))*16+Math.floor(view.x/256-chunksPerScreenW/2)+i%chunksPerScreenW;
    if (mapIndex > -1 && mapIndex < 512) {
        let chunk = map[mapIndex];
        let x = (mapIndex % 16) * 256 - view.x + mcw / 2;
        let y = Math.floor(mapIndex / 16) * 256 - view.y + mch / 2;
        mctx.putImageData(chunk.imgdt, x, y);
        nonBlocksToPaste.push(...chunk.nonBlocks);
    }
  }
  if (physicsLoopCounter%1000 < 2) {
    //console.log(nonBlocksToPaste);
  }
  pasteNonBlocks(nonBlocksToPaste, mcan, mctx, view.x-mcw/2+100, view.y-mch/2+480);
  for (let i=0; i<lasers.length; i++) {
    let laser = lasers[i];
    laser.drawSelf(mctx, laser.x-view.x+mcan.width/2, laser.y-view.y+mcan.height/2);
  }
  mctx.fillStyle = colorString(...cc.body, 1);
  mctx.fillRect(mcw / 2 - 16, mch / 2 - 16, 32, 32);
  mctx.strokeStyle = colorString(...cc.energy, 1);
  mctx.lineWidth = 4;
  mctx.strokeRect(mcw / 2 - 8, mch / 2 - 8, 16, 16);
  if (breaking) {
    pick.drawSelf(pick, mctx, mousePos.x + 8, mousePos.y + 8);
  }
  for (let i=0; i<entities.length; i++) {
    let entity = entities[i]
    entity.drawSelf(mctx, entity.x-view.x+mcan.width/2, entity.y-view.y+mcan.height/2);
  }
    if (mouseTouching != 1) {
    mctx.font = "16px serif";
    mctx.fillStyle = "#FFFFFFFF";
    mctx.fillText(mouseTouching, mousePos.x, mousePos.y);
  }
  mctx.fillStyle = "#404040FF";
  mctx.fillRect(mcan.width*0.9, mcan.height*0.015, mcan.width*0.09, mcan.height*0.015);
  mctx.fillRect(mcan.width*0.9, mcan.height*0.04, mcan.width*0.09, mcan.height*0.015);
  mctx.fillStyle = "green";
  mctx.fillRect(mcan.width*0.9, mcan.height*0.015, mcan.width*0.09*view.health/view.maxHealth, mcan.height*0.015);
  mctx.fillStyle = "blue";
  mctx.fillRect(mcan.width*0.9, mcan.height*0.04, mcan.width*0.09*view.energy/view.maxEnergy, mcan.height*0.015);
  if (playing) {
    requestAnimationFrame(drawingLoop);
  }
}

function physicsLoop() {
  if (mouseDown) {
    let x = Math.floor((view.x - mcw / 2 + mousePos.x) / 16);
    let y = Math.floor((view.y - mch / 2 + mousePos.y) / 16);
    if (!mouseWasDown) {
      if (setBlock(x, y, 0) == 1) {
        breaking = false;
      } else {
        breaking = true;
      }
    }
    if (inWorldBounds(x, y) && inViewCenteredBounds(x, y, 9)) {
        let bn = setBlock(x, y, 0);
        if (bn == 1) {
          if (!breaking) {
            let canPlace = false;
            for (let i = -1; i < 2; i++) {
              for (let j = -1; j < 2; j++) {
                if (setBlock(x + i, y + j, 0) != 1) {
                  canPlace = true;
                }
              }
            }
            if (canPlace) {
              placeBlock(x, y);
            }
          }
        } else {
          if (breaking) {
            let canBreak = true;
            if (pick.n == 1) {
              if (bn != 2) {
                canBreak = false;
              }
            } else {
              pfs[bn].forEach((factor) => {
                if (primes[factor].n > pick.n) {
                  canBreak = false;
                }
              });
              if (bn == pick.n1) {
                canBreak = true;
              }
            }
            if (canBreak) {
              breakBlock(x, y);
            }
          }
        }
        if (entityTouching != undefined) {
            entityTouching.health -= tools[1].n;
        }
    }
  }
  mouseWasDown = mouseDown;
  keysDown.forEach((keyDown) => {
    if (keyDown == " ") {
      if (bounds.down) {
        view.velY = -6;
        jumping = true;
      }
    }
    if (keyDown == "a") {
      view.velX = -4;
    }
    if (keyDown == "d") {
      view.velX = 4;
    }
    if (keyDown == "w" && physicsLoopCounter%10 == 0) {
        firingLasers = !firingLasers;
    }
  });
  if (!bounds.down) {
    view.velY += 0.1;
  }
  for (let i = 0; i < boundChecks; i++) {
    determineBounds();
    view.x += view.velX / boundChecks;
    view.y += view.velY / boundChecks;
  }
  view.velX *= 0.9;
  for (let i=0; i<entities.length; i++) {
    let entity = entities[i];
    entity.entityType.behavior(entity);
    entity.state.func(entity, ...entity.state.args);
    if (entity.entityType.canDamageByTouching && inViewCenteredBounds(entity.x/16, entity.y/16, 2.5)) {
        entity.health --;
    } else if (!inViewCenteredBounds(entity.x/16, entity.y/16, Math.ceil(mcan.width/8))) {
        let index = getIdIndex(entities, entity.id);
        entities.splice(index, 1);
        i --;
    }
    for (let j=0; j<lasers.length; j++) {
        let laser = lasers[j];
        if (inCenteredBounds(entity, laser.x/16, laser.y/16, 2.5) && !laser.isEnemy) {
            entity.health -= laser.maxDamage*laser.opacity;
        }
    }
    if (entity.health <= 0) {
        entityDrop(entity);
        i --;
    }
  }
  if (Math.random() < 0.2) {
    if (entities.length < 200) {
        if (Math.random() < 0.1) {
            let newEntityX = view.x+((Math.floor(Math.random()*2)*2-1)*(Math.random()+1))*mcan.width;
            let newEntityY = view.y+((Math.floor(Math.random()*2)*2-1)*(Math.random()+1))*mcan.height;
            newEntity(entityTypes.rogueRobot, newEntityX, newEntityY, {level: Math.floor(Math.random()*pick.n/5)});
        } else {
            let newEntityX = view.x+(Math.random()*4-2)*mcan.width;
            let newEntityY = view.y+(Math.random()*4-2)*mcan.height;
            newEntity(entityTypes.energyParticle, newEntityX, newEntityY, {});
        }
    }
  }
  for (let i=0; i<lasers.length; i++) {
    let laser = lasers[i];
    laser.physics();
    if (inViewCenteredBounds(laser.x/16, laser.y/16, 2.5) && laser.isEnemy) {
        view.health -= laser.maxDamage*laser.opacity;
    } else if (!inViewCenteredBounds(laser.x/16, laser.y/16, 100)) {
        laser.remove();
    }
  }
  if (physicsLoopCounter%20 == 0 && firingLasers && view.energy > 0) {
    new Laser(view, view.x-mcan.width/2+mousePos.x, view.y-mcan.height/2+mousePos.y, false, 5, [1, 1, 1]);
    view.energy --;
  }
  if (view.health <= 0) {
    respawnView();
  }
  view.health += 0.1;
  view.health = boundVar(view.health, 0, view.maxHealth);
  view.energy = boundVar(view.energy, 0, view.maxEnergy);
  physicsLoopCounter ++;
  if (playing) {
    requestAnimationFrame(physicsLoop);
  }
}

function inWorldBounds(x, y) {
    return x > -1 && y > -1 && x < 256 && y < 512;
}

function inViewCenteredBounds(x, y, dist){
    let viewBlockX = Math.floor(view.x/16);
    let viewBlockY = Math.floor(view.y/16);
    return x > viewBlockX-dist && y > viewBlockY-dist && x < viewBlockX+dist-1 && y < viewBlockY+dist-1;
}

function inCenteredBounds(center, x, y, dist){
    let centerBlockX = Math.floor(center.x/16);
    let centerBlockY = Math.floor(center.y/16);
    return x > centerBlockX-dist && y > centerBlockY-dist && x < centerBlockX+dist-1 && y < centerBlockY+dist-1;
}

function getNumIndex(array, num) {
    for (let i=0; i<array.length; i++) {
        if (array[i].n == num) {
            return i;
        }
    }
    return undefined;
}

function getIdIndex(array, id) {
    for (let i=0; i<array.length; i++) {
        if (array[i].id == id) {
            return i;
        }
    }
    return undefined;
}

function increaseInventoryBlockAmount(index, amount){
    inventory[index].a += amount;
    inventoryGUI.childNodes[index].childNodes[2].innerText = "".concat(inventory[index].a);
}

function increaseInventoryNumAmount(num, amount){
    let index = getNumIndex(inventory, num);
    if (index == undefined) {
        seenNewBlock(num);
        index = getNumIndex(inventory, num);
    }
    increaseInventoryBlockAmount(index, amount);
}

function entityDrop(entity){
    let index = getIdIndex(entities, entity.id);
    entities.splice(index, 1);
    entity.entityType.drop(entity);
};

function boundVar(variable, min, max){
    if (variable < min) {
        return min;
    } else if (variable > max) {
        return max;
    } else {
        return variable;
    }
}

function newEntity(entityType, x, y, ob){
    let newEntity = new Entity(entityType, x, y, ob);
    newEntity.entityType.constructor(newEntity);
    return newEntity;
}

function pasteNonBlocks(nonBlocks, can, ctx, offsetX, offsetY){
    let ctxImgdt = ctx.getImageData(0, 0, can.width, can.height);
    for (let i=0; i<nonBlocks.length; i++) {
        let nonBlock = nonBlocks[i];
        for (let j=0; j<nonBlock.imgdt.data.length/4; j++) {
            if (nonBlock.imgdt.data[j*4+3] > 0) {
                let nonBlockPixelX = j%nonBlock.imgdt.width;
                let nonBlockPixelY = Math.floor(j/nonBlock.imgdt.width);
                let nonBlockInCanX = Math.floor(nonBlock.x-offsetX);
                let nonBlockInCanY = Math.floor(nonBlock.y-offsetY);
                let canPixelX = nonBlockInCanX+nonBlockPixelX;
                let canPixelY = nonBlockInCanY+nonBlockPixelY;
                if (canPixelX > -1 && canPixelY > -1 && canPixelX < can.width && canPixelY < can.height) {
                    let ctxImgdtIndex = (canPixelY*can.width+canPixelX)*4;
                    ctxImgdt.data[ctxImgdtIndex] = nonBlock.imgdt.data[j*4];
                    ctxImgdt.data[ctxImgdtIndex+1] = nonBlock.imgdt.data[j*4+1];
                    ctxImgdt.data[ctxImgdtIndex+2] = nonBlock.imgdt.data[j*4+2];
                }
            }
        }
    }
    ctx.putImageData(ctxImgdt, 0, 0);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function colorString(r, g, b, a) {
  let color = Math.floor(r * 255) * 256 ** 3 + Math.floor(g * 255) * 256 ** 2 + Math.floor(b * 255) * 256 + Math.floor(a * 255);
  return "#" + color.toString(16).padStart(8, "0");
}

function weightedArrayPick(array, weight, offset) {
  let choosing = true;
  let counter = -1;
  while (choosing) {
    counter++;
    if (Math.random() < weight) {
      choosing = false;
    }
  }
  return array[(counter+offset) % array.length];
}

function setBlock(x, y, n) {
  if (inWorldBounds(x, y)) {
    let x2 = Math.floor(x / 16);
    let y2 = Math.floor(y / 16);
    if (n == 0) {
      return map[y2 * 16 + x2].map[(y % 16) * 16 + x % 16].n;
    } else {
      if (n == "b") {
        return map[y2 * 16 + x2].map[(y % 16) * 16 + x % 16].b;
      } else {
        map[y2 * 16 + x2].map[(y % 16) * 16 + x % 16].n = n;
        if (mapGenerated) {
          map[y2 * 16 + x2].resetNearbyImgdts();
        }
      }
    }
  } else {
    return 1;
  }
}

function breakBlock(x, y) {
  let n = setBlock(x, y, 0);
  let index = getNumIndex(inventory, n);
  if (index == undefined) {
    seenNewBlock(n);
    index = 0;
  }
  increaseInventoryBlockAmount(index, 1);
  setBlock(x, y, 1);
}

function placeBlock(x, y) {
  if (selectedBlock != undefined) {
    let index = getNumIndex(inventory, selectedBlock);
    if (inventory[index].a > 0) {
        increaseInventoryBlockAmount(index, -1);
        setBlock(x, y, selectedBlock);
    }
  }
}

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3){
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fill();
}

function drawTree(treeData, ctx, m, x, y, tX, tY, trunkY, light){
    drawBranch(treeData, 0, Math.PI/-2, Math.PI/-2, x, y, tX, tY, ctx, m, trunkY, light, 0);
}

function drawBranch(td, tier, angle, targetAngle, x, y, tX, tY, ctx, m, trunkY, light, waveCounter){
    let bm = 1+randomBetween(-td.branchLengthVary, td.branchLengthVary, 0.01);
    let s = td.branchSegments+randomBetween(-1*td.branchSegmentsVary, td.branchSegmentsVary, 1);
    let z = (trunkY*5-1)/4;
    let a = 1.4-trunkY;
    let b = trunkY-0.4;
    let xCounter = x;
    let yCounter = y;
    let currentAngle = angle;
    let lastWobble = 0;
    let wave = waveCounter;
    let bwsm = 0;
    let bwlm = 0;
    let oldBwsm = 0;
    let oldBwlm = 0;
    for (let i=0; i<s; i++) {
        oldBwsm = bwsm;
        oldBwlm = bwlm;
        bwsm = 1+Math.random()*td.branchWaveSizeVary;
        bwlm = 1+Math.random()*td.branchWaveLengthVary;
        let slm = 1+randomBetween(-td.branchSegmentLengthVary, td.branchSegmentLengthVary, 0.01);
        let r0 = (td.branchColor[0]*z*a+light[0]*b)*(1-Math.random()*td.branchColorVary);
        let g0 = td.branchColor[1]*z*a+light[1]*b*(1-Math.random()*td.branchColorVary);
        let b0 = td.branchColor[2]*z*a+light[2]*b*(1-Math.random()*td.branchColorVary);
        ctx.strokeStyle = colorString(r0, g0, b0, 1);
        ctx.lineWidth = td.branchThickness/(td.branchThicknessProportions**(tier+i*td.tierSmoothness/s));
        ctx.beginPath();
        ctx.moveTo(xCounter*m+tX+Math.sin(wave*td.branchWaveLength*oldBwlm)*td.branchWaveSize*oldBwsm, yCounter*m+tY);
        let wobble = randomBetween(-1*td.branchWobble, td.branchWobble, 0.01);
        wave ++;
        currentAngle += ((targetAngle-angle)+wobble-lastWobble)/s;
        lastWobble = wobble;
        xCounter += Math.cos(currentAngle)*slm*bm/td.tiers/s/2;
        yCounter += Math.sin(currentAngle)*slm*bm/td.tiers/s/2;
        let xExtend = xCounter+Math.cos(currentAngle)*slm*bm/td.tiers/td.segmentExtend;
        let yExtend = yCounter+Math.sin(currentAngle)*slm*bm/td.tiers/td.segmentExtend;
        ctx.lineTo(xExtend*m+tX+Math.sin(wave*td.branchWaveLength*bwlm)*td.branchWaveSize*bwsm, yExtend*m+tY);
        ctx.stroke();
        if (Math.random()*tier/td.tiers > td.ld.leafClumpSpread) {
            if (Math.random() < 1/2/td.ld.leafClumpAmount) {
                drawLeafClump(ctx, td.ld, m, xCounter, yCounter, tX, tY, trunkY, light, currentAngle);
            }
        }
    }
    if (td.tiers > tier) {
        for (let i=0; i<randomBetween(td.growth-1, td.growth+1, 1); i++) {
            let branchContinue = false;
            if (i == 0) {
                if (Math.random() > td.branchContinue) {
                    branchContinue = true;
                }
            }
            let newTargetAngle = targetAngle;
            if (!branchContinue) {
                newTargetAngle = randomBetween(currentAngle-td.angleVary, currentAngle+td.angleVary, 0.01);
            }
            let branchBend = td.branchBend+randomBetween(-1*td.branchBendVary, td.branchBendVary, 0.01);
            let startingAngle = currentAngle+(newTargetAngle-currentAngle)*branchBend;
            drawBranch(td, tier+1, startingAngle, newTargetAngle, xCounter, yCounter, tX, tY, ctx, m, trunkY, light, wave);
        }
    }
}

function drawLeafClump(ctx, ld, m, x, y, tX, tY, trunkY, light, angle){
    let clumpColor = Math.random()*ld.leafClumpColorVary;
    let clumpAngleVary = randomBetween(-1*ld.leafClumpAngleVary, ld.leafClumpAngleVary, 0.01);
    let clumpSizeVary = randomBetween(1-ld.leafClumpSizeVary, 1+ld.leafClumpSizeVary, 0.01);
    let clumpTransparencyVary = Math.random()*ld.leafClumpTransparencyVary;
    let z = (trunkY*5-1)/4;
    let a = 1.4-trunkY;
    let b = trunkY-0.4;
    for (let i=0; i<ld.leafClumpAmount; i++) {
        let am = angle+clumpAngleVary+randomBetween(-1*ld.leafAngleVary, ld.leafAngleVary, 0.01);
        let sm = clumpSizeVary+randomBetween(1-ld.leafSizeVary, 1+ld.leafSizeVary, 0.01);
        let r0 = (ld.leafColor[0]*z*a+light[0]*b)*(1-Math.random()*ld.leafColorVary*clumpColor);
        let g0 = (ld.leafColor[1]*z*a+light[1]*b)*(1-Math.random()*ld.leafColorVary*clumpColor);
        let b0 = (ld.leafColor[2]*z*a+light[2]*b)*(1-Math.random()*ld.leafColorVary*clumpColor);
        let a0 = ld.leafColor[3]-clumpTransparencyVary*Math.random()*ld.leafTransparencyVary;
        let point1 = {
            x: x*m+Math.cos(ld.innerSpreadAngle*0/(ld.leafPoints+1)-ld.innerSpreadAngle/2+am)*ld.startInnerD*sm+tX,
            y: y*m+Math.sin(ld.innerSpreadAngle*0/(ld.leafPoints+1)-ld.innerSpreadAngle/2+am)*ld.startInnerD*sm+tY,
            angle: ld.innerSpreadAngle*0/(ld.leafPoints+1)-ld.innerSpreadAngle/2+am
        };
        ctx.fillStyle = colorString(r0, g0, b0, a0);
        for (let j=0; j<ld.leafPoints; j++) {
            let point2 = {
                x: x*m+Math.cos(ld.innerSpreadAngle*(j+1)/(ld.leafPoints+1)-ld.innerSpreadAngle/2+am)*ld.startInnerD*sm+tX,
                y: y*m+Math.sin(ld.innerSpreadAngle*(j+1)/(ld.leafPoints+1)-ld.innerSpreadAngle/2+am)*ld.startInnerD*sm+tY,
                angle: ld.innerSpreadAngle*(j+1)/(ld.leafPoints+1)-ld.innerSpreadAngle/2+am
            };
            ctx.beginPath();
            ctx.moveTo(x*m+tX, y*m+tY);
            ctx.lineTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.fill();
            toX = x*m+Math.cos((point1.angle+point2.angle)/2)*(ld.startInnerD+ld.innerOuterD)*sm+tX;
            toY = y*m+Math.sin((point1.angle+point2.angle)/2)*(ld.startInnerD+ld.innerOuterD)*sm+tY;
            ctx.beginPath();
            ctx.moveTo(toX, toY);
            ctx.lineTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.fill();
            point1 = point2;
        }
    }
}

function wanderBehavior(entity){
    entity.x += entity.vars[0];
    entity.y += entity.vars[1];
    if (Math.random() < 0.001) {
        entity.vars = [Math.random()*2-1, Math.random()*2-1];
    }
}

function compressAdjacentSameArrayItems(array){
  let newArray = [];
  let item = array[0];
  let itemAmount = 0;
  for (let i=0; i<array.length; i++) {
    if (array[i] == item) {
      itemAmount ++;
    } else {
      if (itemAmount > 1) {
        newArray.push(item+"x"+itemAmount);
      } else {
        newArray.push(item);
      }
      item = array[i];
      itemAmount = 1;
    }
  }
  return newArray;
}

function decompressAdjacentSameArrayItems(array){
  let newArray = array.slice();
  for (let i=0; i<newArray.length; i++) {
    let item = newArray[i];
    let components = item.split("x");
    if (components.length > 1) {
      let decompressedItems = [];
      for (let i=0; i<components[1]; i++) {
        decompressedItems.push(components[0]);
      }
      newArray.splice(i, 1, ...decompressedItems);
      i += components[1]-2;
    }
  }
  return newArray;
}