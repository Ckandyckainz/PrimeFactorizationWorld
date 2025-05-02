// GitHub version

let mcan = document.getElementById("mcan");
let inventoryGUI = document.getElementById("inventory");
let toolsGUI = document.getElementById("tools");
let mcw = window.innerWidth;
let mch = window.innerHeight;
mcan.width = mcw;
mcan.height = mch;
mcan.style.width = "100%";
mcan.style.height = "100%";
let mctx = mcan.getContext("2d");
let toolHandleColor = colorString(Math.random() * 0.3 + 0.2, Math.random() * 0.3 + 0.2, Math.random() * 0.3 + 0.2, 1);
let jumping = false;
let inventory = [];
let selectedBlock;
let lastSelectedBlockGUI;
let breaking = 1;
let entityIdCounter = 0;
let entities = [];
let entityTouching = undefined

function wanderBehavior(entity){
    entity.x += entity.vars[0];
    entity.y += entity.vars[1];
    if (Math.random() < 0.001) {
        entity.vars = [Math.random()*2-1, Math.random()*2-1];
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

class Tool {
  constructor(type, n) {
  	this.type = type;
    this.n = n;
    this.n1 = -1;
    this.c = "#FFFFFFFF";
    this.can = document.createElement("canvas");
    this.can.width = 32;
    this.can.height = 32;
    toolsGUI.appendChild(this.can);
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

class EntityType {
    constructor(ob){
        this.name = ob.name;
        this.behavior = ob.behavior;
        this.startingState = ob.startingState;
        this.startingVars = ob.startingVars;
        this.drop = ob.drop;
        this.drawSelf = ob.drawSelf;
        this.maxHealth = ob.maxHealth;
        this.canDamageByTouching = ob.canDamageByTouching;
    }
}

let entityTypes = {
    driftingSquare: new EntityType({
        name: "drifting square",
        behavior: ()=>{},
        startingState: {func: wanderBehavior, args: []},
        startingVars: [Math.random()*2-1, Math.random()*2-1],
        drop: ()=>{
            increaseInventoryNumAmount(weightedArrayPick(primes, 0.3).n, 1);
        },
        drawSelf: (ctx, x, y)=>{
            ctx.fillStyle = "white";
            ctx.fillRect(x-4, y-4, 8, 8);
        },
        maxHealth: 1,
        canDamageByTouching: true
    }),
    rogueRobot: new EntityType({
        name: "rogue robot",
        behavior: ()=>{},
        startingState: {func: wanderBehavior, args: []},
        startingVars: [Math.random()*2-1, Math.random()*2-1],
        drop: ()=>{
            increaseInventoryNumAmount(weightedArrayPick(primes, 0.3).n, 1000);
        },
        drawSelf: (ctx, x, y)=>{
            ctx.fillStyle = "#404040FF";
            ctx.fillRect(x-16, y-16, 32, 32);
            ctx.fillStyle = "red";
            ctx.fillRect(x-12, y-12, 24, 24);
            ctx.fillStyle = "#404040FF";
            ctx.fillRect(x-8, y-8, 16, 16);
        },
        maxHealth: 100,
        canDamageByTouching: false
    })
}

class Entity {
    constructor(entityType, x, y){
        this.entityType = entityType;
        this.state = entityType.startingState;
        this.vars = entityType.startingVars;
        this.maxHealth = this.entityType.maxHealth;
        this.health = this.maxHealth;
        this.x = x;
        this.y = y;
        this.id = entityIdCounter;
        entityIdCounter ++;
        entities.push(this);
    }
    drawSelf(ctx, x, y){
        this.entityType.drawSelf(ctx, x, y);
    }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function colorString(r, g, b, a) {
  let color = Math.floor(r * 255) * 256 ** 3 + Math.floor(g * 255) * 256 ** 2 + Math.floor(b * 255) * 256 + Math.floor(a * 255);
  return "#" + color.toString(16).padStart(8, "0");
}

function weightedArrayPick(array, weight) {
  let choosing = true;
  let counter = -1;
  while (choosing) {
    counter++;
    if (Math.random() < weight) {
      choosing = false;
    }
  }
  return array[counter % array.length];
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

let nMax = randomBetween(1001, 1502);
let primes = [];
let pfs = [];
let blocks = [];
for (let i = 0; i < nMax; i++) {
  pfs.push([]);
}
for (let i = 2; i < nMax; i++) {
  if (pfs[i].length == 0) {
    primes.push({
      n: i,
      c: [Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7],
      noise: Math.random() * 0.3 + 0.7
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
  blocks[i] = new Block(i);
}
blocks[1] = new Block(1);

let mapGenerated = false;
let map = [];
for (let i = 0; i < 512; i++) {
  let chunk = new Chunk(i);
  map.push(chunk);
}
for (let i = 0; i < 256; i++) {
  setBlock(i, 511, nMax - 1);
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
mapGenerated = true;

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

let uc = [Math.random() * 0.2 + 0.3, Math.random() * 0.2 + 0.3, Math.random() * 0.2 + 0.3];
map.forEach((chunk) => {
  chunk.resetImgdt();
});

let view = {
  x: 2000,
  y: -32,
  velX: 0,
  velY: 0,
  onGround: true
};
let keysDown = [];

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

let mouseTouching = 1;
let mousePos = {
  x: 0,
  y: 0
}

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
        mouseTouching = entity.entityType.name+" ("+entity.health+"/"+entity.maxHealth+")";
        entityTouching = entity;
    }
  }
  mousePos.x = event.x;
  mousePos.y = event.y;
}
mcan.addEventListener("mousemove", mousemove);

let mouseDown = false;
let mouseWasDown = false;

function mousedown() {
  mouseDown = true;
}
mcan.addEventListener("mousedown", mousedown);

function mouseup() {
  mouseDown = false;
}
mcan.addEventListener("mouseup", mouseup);

let cc = {
  body: [],
  energy: []
};
for (let i = 0; i < 3; i++) {
  cc.body.push(Math.random() * 0.2 + 0.4);
}
for (let i = 0; i < 3; i++) {
  cc.energy.push(Math.random() * 0.3 + 0.7);
}

let bounds = {
  left: false,
  right: false,
  up: false,
  down: false
};
let boundChecks = 16;

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
  for (let i = 0; i < 512; i++) {
    mctx.putImageData(map[i].imgdt, (i % 16) * 256 - view.x + mcw / 2, Math.floor(i / 16) * 256 - view.y + mch / 2);
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
  requestAnimationFrame(drawingLoop);
}
drawingLoop();

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
    entity.state.func(entity, ...entity.state.args);
    if (entity.entityType.canDamageByTouching && inViewCenteredBounds(entity.x/16, entity.y/16, 2.5)) {
        entity.health --;
    } else if (!inViewCenteredBounds(entity.x/16, entity.y/16, 50)) {
        let index = getIdIndex(entities, entity.id);
        entities.splice(index, 1);
        i --;
    }
    if (entity.health <= 0) {
        entityDrop(entity);
    }
  }
  if (Math.random() < 0.05) {
    if (entities.length < 50) {
        let newEntityX = view.x+(Math.random()*2-1)*mcan.width;
        let newEntityY = view.y+(Math.random()*2-1)*mcan.height
        let ents = [entityTypes.driftingSquare, entityTypes.rogueRobot];
        new Entity(ents[Math.floor(Math.random()*1.2)], newEntityX, newEntityY);
    }
  }
  requestAnimationFrame(physicsLoop);
}
physicsLoop();

function inWorldBounds(x, y) {
    return x > -1 && y > -1 && x < 256 && y < 512;
}

function inViewCenteredBounds(x, y, dist){
    let viewBlockX = Math.floor(view.x/16);
    let viewBlockY = Math.floor(view.y/16);
    return x > viewBlockX-dist && y > viewBlockY-dist && x < viewBlockX+dist-1 && y < viewBlockY+dist-1;
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
    entity.entityType.drop();
};