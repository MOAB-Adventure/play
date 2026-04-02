const game = {
  //Game options
  _diff: "none",
  get difficulty() {
    return this._diff;
  },
  set difficulty(_) {
    this._diff = _;
    UIComponent.setCondition("difficulty:" + _);
    world.updateDifficulty();
  },
  _m: "none",
  /**@type {"none"|"adventure"|"boss-rush"|"sandbox"|"endless"} */
  get mode() {
    return this._m;
  },
  set mode(_) {
    this._m = _;
    UIComponent.setCondition("mode:" + _);
  },
  /**@type {-1|0|1|2|3|4|5} */
  saveslot: -1,
  music: true,
  /**@type {"keyboard"|"gamepad"} */
  control: "keyboard",
  /**@type {"radial"|"horizontal"} */
  reloadBarStyle: "radial",
  /**@type {"mono"|"rainbow"|"thematic"} */
  reloadBarTheme: "rainbow",
  /** @type {Entity | null} Player entity */
  player: null,
  /** @type {Entity | null} Support blimp entity */
  support: null,
  maxDV: 0,
  totalBosses: 0,
  //Currency
  shards: 400,
  bloonstones: 0,
  level: 1,
  bosstimer: 400,
  bossdelay: 400,
  get bossinterval() {
    return world.bossInterval;
  },
  paused: false,
  //progression
  world: "",
  achievements: [],
  bossweapons: new Set(),
  won: false,
  //keys
  keybinds: new KeybindHandler(),

  gl: false,
  flashing: true,
  effects: 1,
  mouse: {
    get x() {
      return ui.mouse.x / ui.camera.zoom + ui.camera.x;
    },
    get y() {
      return ui.mouse.y / ui.camera.zoom + ui.camera.y;
    },
  },
  target: {
    get x() {
      return (ui.target.x - 960) / ui.camera.zoom + ui.camera.x;
    },
    get y() {
      return (ui.target.y - 540) / ui.camera.zoom + ui.camera.y;
    },
  },
  levelBig: false,
  increasedLevelSize: false,
  get borderTop() {
    return this.increasedLevelSize ? -540 : 0;
  },
  get borderBottom() {
    return this.increasedLevelSize ? 1080 + 540 : 1080;
  },
  get borderLeft() {
    return this.increasedLevelSize ? -960 : 0;
  },
  get borderRight() {
    return this.increasedLevelSize ? 1920 + 960 : 1920;
  },

  deaths: 0
};
/** @type {World} */
let world;
moveToWorld("ocean-skies");
//Initial values for canvas width and height
const baseWidth = 1920;
const baseHeight = 1080;
//scale everything
let contentScale = 1;

//Get the biggest possible canvas that fits on the current screen, preserving aspect ratio
function getCanvasDimensions(baseWidth, baseHeight) {
  const aspectRatio = baseWidth / baseHeight;
  let [canvasWidth, canvasHeight] = [windowWidth, windowHeight];
  let [widthRatio, heightRatio] = [canvasWidth / baseWidth, canvasHeight / baseHeight];
  if (widthRatio < heightRatio) {
    [canvasWidth, canvasHeight] = [windowWidth, windowWidth / aspectRatio];
    contentScale = canvasWidth / baseWidth;
  } else {
    [canvasWidth, canvasHeight] = [windowHeight * aspectRatio, windowHeight];
    contentScale = canvasHeight / baseHeight;
  }
  return [canvasWidth, canvasHeight];
}

let fonts = {};
let backgrounds = {
  grad_normal: null,
  grad_boss_rush: null,
  grad_sandbox: null,
  grad_impossible: null,
  grad_endless: null,
};

async function preload() {
  console.log("preloading game...");
  ImageCTX.commit();
  await ImageCTX.load();
  SoundCTX.commit();
  await SoundCTX.loadAll();
  fonts.ocr = await loadFont(
    game.gl ? "assets/font/ocr_a_extended_bold.ttf" : "assets/font/ocr_a_extended.ttf",
  );
  fonts.darktech = await loadFont("assets/font/darktech_ldr.ttf");
}
//Set up the canvas, using the previous function
async function setup() {
  createCanvas(...getCanvasDimensions(baseWidth, baseHeight), game.gl ? WEBGL : undefined);
  console.log("starting game...");
  try {
    //Creates background stuff
    backgrounds.grad_normal = createGraphics(1, 100);
    for (let y = 0; y < 100; y++) {
      //For each vertical unit
      let col = colinterp(
        [
          [0, 0, 0],
          [0, 200, 255],
        ],
        y / 100,
      ); //Get colour interpolation
      backgrounds.grad_normal.noStroke(); //Remove outline
      backgrounds.grad_normal.fill(col); //Set fill colour to use
      backgrounds.grad_normal.rect(0, y, 2, 1); //Draw the rectangle
    }
    backgrounds.grad_boss_rush = createGraphics(1, 100);
    for (let y = 0; y < 100; y++) {
      //For each vertical unit
      let col = colinterp(
        [
          [0, 0, 0],
          [50, 0, 100],
          [200, 0, 255],
        ],
        y / 100,
      ); //you get it by now
      backgrounds.grad_boss_rush.noStroke();
      backgrounds.grad_boss_rush.fill(col);
      backgrounds.grad_boss_rush.rect(0, y, 2, 1);
    }
    backgrounds.grad_sandbox = createGraphics(1, 100);
    for (let y = 0; y < 100; y++) {
      //For each vertical unit
      let col = colinterp(
        [
          [0, 0, 0],
          [50, 35, 0],
          [150, 100, 0],
          [255, 200, 0],
        ],
        y / 100,
      ); //you get it by now
      backgrounds.grad_sandbox.noStroke();
      backgrounds.grad_sandbox.fill(col);
      backgrounds.grad_sandbox.rect(0, y, 2, 1);
    }
    backgrounds.grad_impossible = createGraphics(1, 100);
    for (let y = 0; y < 100; y++) {
      //For each vertical unit
      let col = colinterp(
        [
          [0, 0, 0],
          [0, 0, 0],
          [64, 0, 0],
          [128, 0, 0],
          [255, 0, 0],
          [255, 128, 0],
          [255, 255, 0],
          [255, 255, 255],
        ],
        y / 100,
      ); //you get it by now
      backgrounds.grad_impossible.noStroke();
      backgrounds.grad_impossible.fill(col);
      backgrounds.grad_impossible.rect(0, y, 2, 1);
    }
    //p5 options
    rectMode(CENTER);
    imageMode(CENTER);
    textFont(fonts.darktech);
    textAlign(LEFT, BASELINE);
  } catch (e) {
    crash(e);
  }
}
//Change the size if the screen size changes
function windowResized() {
  resizeCanvas(...getCanvasDimensions(baseWidth, baseHeight));
}

//p5's draw function - called 60 times per second
function draw() {
  try {
    clear();
    if (game.gl) translate(-width / 2, -height / 2);

    scale(contentScale);

    image(
      game.difficulty === "impossible" ? backgrounds.grad_impossible
      : game.mode === "boss-rush" ? backgrounds.grad_boss_rush
      : game.mode === "sandbox" ? backgrounds.grad_sandbox
      : backgrounds.grad_normal,
      960,
      540,
      1920,
      1080,
    );

    translate(0, 0, 2);
    if (world) {
      if (ui.menuState === "in-game") {
        push();
        translate(960, 540);

        scale(ui.camera.zoom);
        rotate(radians(ui.camera.rotation));
        translate(-ui.camera.x, -ui.camera.y);

        background.draw();
        gameFrame();
        pop();
      }
      uiFrame();
      if (!ui.waitingForMouseUp) fireIfPossible();
    }
    if (!game.paused) {
      Timer.main.tick();
      effectTimer.tick();
    }
    customDrawCode();
  } catch (e) {
    console.error(e);
    crash(e);
  }
}

/** To be replaced with other code in devtools console :) */
function customDrawCode() {}

function uiFrame() {
  //Tick, then draw the UI
  tickUI();
  translate(0, 0, 1);
  drawUI();
  //Reset mouse held status
  if (ui.waitingForMouseUp && !ui.mouse.down) ui.waitingForMouseUp = false;
  if (UIComponent.evaluateCondition("debug:true")) debugUI();
  else drawCursor(ui.target.x, ui.target.y);
  camTick();
}

function camTick() {
  if (game.levelBig) {
    game.increasedLevelSize = true;
    if (ui.camera.zoom > 0.5) ui.camera.zoom -= 0.01;
  } else {
    if (ui.camera.zoom < 1) ui.camera.zoom += 0.01;
    else game.increasedLevelSize = false;
  }
}

function drawCursor(x, y) {
  translate(0, 0, 10);
  if (game.player)
    drawReloadBars(
      x,
      y,
      game.reloadBarTheme === "rainbow" ? rainbowCols
      : game.reloadBarTheme === "mono" ? monoCols
      : game.reloadBarTheme === "thematic" ?
        game.player.weaponSlots.map((slot, i) =>
          slot.weapon && i < 5 ? slot.weapon.themeColour : null,
        )
      : null,
      game.player.weaponSlots.map((slot, i) =>
        slot.weapon && i < 5 ? slot.weapon._cooldown / slot.weapon.reload : 0,
      ),
    );
  ImageCTX.draw(ui.waitingForMouseUp ? "ui.cursor-wait" : "ui.cursor", x, y, 64, 64);
}

function fakeCursor(x, y) {
  drawReloadBars(
    x,
    y,
    game.reloadBarTheme === "rainbow" ? rainbowCols
    : game.reloadBarTheme === "mono" ? monoCols
    : game.reloadBarTheme === "thematic" ?
      [
        [255, 0, 0],
        [0, 255, 255],
        [0, 255, 0],
        [200, 0, 255],
        [0, 0, 255],
        [255, 128, 0],
      ]
    : null,
    [0, 1, 2, 3, 4].map((i) => 1 - ((frameCount + i * 10) % 60) / 60),
  );

  ImageCTX.draw("ui.cursor", x, y, 64, 64);
}

function drawReloadBars(x, y, cols = null, progresses = []) {
  let size = 30;
  push();
  progresses.forEach((prog, index) => {
    if (prog) {
      if (game.reloadBarStyle === "radial") {
        noFill();
        stroke(cols[index] ?? [0, 0, 0]);
        strokeWeight(3);
        arc(x, y, size * 2, size * 2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * prog);
        size += 4;
      } else if (game.reloadBarStyle === "horizontal") {
        rectMode(CORNER);
        noStroke();
        fill(64);
        rect(x + 30, y + size - 48, 60, 5);
        fill(cols[index] ?? [255, 255, 255]);
        rect(x + 30, y + size - 48, 60 * prog, 5);
        size += 8;
      }
    }
  });
  pop();
}

function gameFrame() {
  if (!game.paused) {
    game.keybinds.tick();
    validatePlayerPos();
    passivePlayerTick();
    world.tickAll();
    tickBossEvent();
    if (game.player.dead) playerDies();
  }
  world.tickSound();
  translate(0, 0, 2);
  world.drawAll();
}
let hadBoss = false;
function tickBossEvent() {
  UIComponent.setCondition("boss:" + (world.getFirstBoss() ? "yes" : "no")); // Update condition
  if (UIComponent.evaluateCondition("boss:no")) {
    if(hadBoss) {
      game.levelBig = false;
      world.bossmusic = null;
      if (world.reducedSpawns && game.mode !== "boss-rush") world.reducedSpawns = false;
    }
    //If initial delay
    if (game.bossdelay > 0) game.bossdelay--;
    // If there's no boss active
    else if (game.bosstimer <= 0) {
      //If timer has run out
      if (game.mode === "boss-rush") {
        game.bossdelay = 360;
      } else game.bosstimer = world.bossInterval; //Reset timer
      world.nextBoss();
      world.reducedSpawns = true;
    } else {
      game.bosstimer -= game.player.speed * 0.0167;
    }
    hadBoss = false;
  } else {
    game.levelBig = !!world.boss.usesLargeLevel;
    hadBoss = true;
  } 
}

function startGame() {
  createPlayer();
  createSupport();
  if (game.mode === "boss-rush") {
    game.bossdelay = 360;
    game.bosstimer = 0;
    world.reducedSpawns = true;
  }
}

function validatePlayerPos() {
  //If the player is out of bounds, then remove //damage rapidly
  if (game.player.x > game.borderRight - game.player.hitSize + game.player.speed * 2) {
    game.player.x = game.borderRight - game.player.hitSize;
    // game.player.damage("out-of-bounds", game.player.maxHealth * 0.0125);
  }
  if (game.player.x < game.borderLeft + game.player.hitSize - game.player.speed * 4) {
    game.player.x = game.borderLeft + game.player.hitSize;
    // game.player.damage("out-of-bounds", game.player.maxHealth * 0.0125);
  }
  if (game.player.y < game.borderTop + game.player.hitSize - game.player.speed * 3) {
    game.player.y = game.borderTop + game.player.hitSize;
    // game.player.damage("out-of-bounds", game.player.maxHealth * 0.0125);
  }
  if (game.player.y > game.borderBottom - game.player.hitSize + game.player.speed * 3) {
    game.player.y = game.borderBottom - game.player.hitSize;
    // game.player.damage("out-of-bounds", game.player.maxHealth * 0.0125);
  }
}
function passivePlayerTick() {
  //regen
  if (game.player.health < game.player.maxHealth) {
    game.player.heal(0.0002 * game.player.maxHealth);
  }
}
function drawUI() {
  background.image = world.background;
  showOffscreenBosses();
  for (let component of ui.components) {
    if (component.active) {
      component.draw();
      translate(0, 0, 2);
    }
  }
  uiEffectTimer.tick();
  toasts.draw();
  ui.particles.forEach((p) => p && (p.draw() || p.step(1)));
}

function tickUI() {
  ui.tick();
  toasts.tick();
}

function colour(...params) {
  fill(...params);
  stroke(...params);
}
function labeledLine(x1, y1, x2, y2, label, align = "end") {
  let d = Math.atan2(y2 - y1, x2 - x1);
  let len = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  let invert = Math.abs(d) > Math.PI / 2;
  push();
  if (align === "start") translate(x1, y1);
  else if (align === "end") translate(x2, y2);
  if (invert) rotate(d + Math.PI);
  else rotate(d);
  textAlign(LEFT);
  textFont(fonts.ocr);
  textSize(20);
  let w = textWidth(label);
  let xoffset =
    align === "start" ?
      invert ? -w
      : 0
    : invert ? 0
    : w;
  noStroke();
  if (align === "end" && !invert) xoffset = -xoffset;
  text(label, xoffset, 10);
  pop();
  line(x1, y1, x2, y2);
}
function labeledCircle(x, y, radius, label, align = "top") {
  push();
  textAlign(CENTER);
  textFont(fonts.ocr);
  textSize(20);
  let w = textWidth(label);
  let xoffset =
    align === "left" ? -5 - w / 2 - radius
    : align === "right" ? 5 + w / 2 + radius
    : 0;
  let yoffset =
    align === "top" ? -15 - radius
    : align === "bottom" ? 15 + radius
    : 0;
  noStroke();
  text(label, x + xoffset, y + yoffset);
  pop();
  push();
  noFill();
  circle(x, y, radius * 2);
  pop();
}

/** **DOES NOT WORK IN LARGE-LEVEL MODE!** */
function debugUI() {
  push();
  textAlign(CENTER, CENTER);
  textFont(fonts.ocr);
  fill(255);
  stroke(0);
  strokeWeight(2);
  textSize(40);
  text("X:" + Math.round(ui.mouse.x) + " Y:" + Math.round(ui.mouse.y), ui.mouse.x, ui.mouse.y - 50);
  stroke(255);
  strokeWeight(3);
  line(ui.mouse.x - 20, ui.mouse.y, ui.mouse.x + 20, ui.mouse.y);
  line(ui.mouse.x, ui.mouse.y - 20, ui.mouse.x, ui.mouse.y + 20);
  noFill();
  circle(ui.mouse.x, ui.mouse.y, 40);

  colour(255, 0, 0);
  if (world.entities) {
    let dist = Infinity,
      min = null;
    world.entities.forEach((ent) => {
      if (!ent || ent.dead || ent.team === game.player?.team) return;
      let d = ent.lastPos.distanceTo(ui.mouse);
      if (d < dist) {
        dist = d;
        min = ent;
      }
    });

    if (min) labeledLine(ui.mouse.x, ui.mouse.y, min.x, min.y, "hovered   ");
  }
  push();
  stroke(255, 0, 255);
  noFill();
  if (world.entities) world.entities.forEach((ent) => ent && circle(ent.x, ent.y, ent.hitSize * 2));
  stroke(128, 0, 255);
  if (world.bullets) world.bullets.forEach((blt) => blt && circle(blt.x, blt.y, blt.hitSize * 2));
  stroke(0, 128, 255);
  if (world.bullets)
    world.bullets.forEach(
      (blt) =>
        blt &&
        line(blt.x, blt.y, blt.x + Math.cos(blt.directionRad) * 60 * blt.updates, blt.y) |
          line(blt.x, blt.y, blt.x, blt.y + Math.sin(blt.directionRad) * 60 * blt.updates) |
          line(
            blt.x,
            blt.y,
            blt.x + Math.cos(blt.directionRad) * 60 * blt.updates,
            blt.y + Math.sin(blt.directionRad) * 60 * blt.updates,
          ),
    );
  pop();
  colour(200, 200, 255);
  ui.touches.forEach((t, i) => {
    labeledCircle(t.x / contentScale, t.y / contentScale, 75, "touch " + i);
  });
  if (game.player) {
    colour(0, 255, 255);
    labeledCircle(game.player.x, game.player.y, game.player.hitSize * 1.75, "base shield size");

    colour(0, 255, 0);
    labeledLine(game.player.x, game.player.y, ui.mouse.x, ui.mouse.y, "direct aim  ");
    colour(255, 255, 0);
    labeledLine(
      ui.mouse.x,
      ui.mouse.y,
      (ui.mouse.x - game.player.x) * 2000 + game.player.x,
      (ui.mouse.y - game.player.y) * 2000 + game.player.y,
      "  extrapolated aim",
      "start",
    );
  }
  pop();
}

function isOffscreen(entity) {
  return (
    entity.x < game.borderLeft ||
    entity.x > game.borderRight ||
    entity.y < game.borderTop ||
    entity.y > game.borderBottom
  );
}

function distanceOffscreen(entity) {
  return new Vector(
    entity.x < game.borderLeft - entity.hitSize ?
      entity.x + entity.hitSize
    : entity.x + entity.hitSize - game.borderRight,
    entity.y < game.borderTop - entity.hitSize ?
      entity.y + entity.hitSize
    : entity.y + entity.hitSize - game.borderBottom,
  ).magnitude;
}

/**@param {Vector} pos  */
function nearestOnScreenPosition(pos, onScreenBy = 0) {
  let centre = new Vector(960, 540);
  // direction to middle
  let direction = pos.sub(centre).normalise();
  // find max scales to make the point onscreen
  let sizeX = Math.abs((960 - onScreenBy) / direction.x);
  let sizeY = Math.abs((540 - onScreenBy) / direction.y);
  // return shit
  let npos = centre.add(direction.scale(Math.min(sizeX, sizeY)));

  return npos;
}

function showOffscreenBosses() {
  world.getAllBosses().forEach((boss) => {
    if (boss && isOffscreen(boss)) {
      let circlepos = nearestOnScreenPosition(new Vector(boss.x, boss.y), 180);
      push();
      fill(100, 100, 100);
      stroke(50, 50, 50);
      strokeWeight(30);
      line(boss.x, boss.y, circlepos.x + 25, circlepos.y);
      line(boss.x, boss.y, circlepos.x - 25, circlepos.y);
      line(boss.x, boss.y, circlepos.x, circlepos.y + 25);
      line(boss.x, boss.y, circlepos.x, circlepos.y - 25);
      stroke(100, 100, 100);
      strokeWeight(10);
      line(boss.x, boss.y, circlepos.x + 10, circlepos.y);
      line(boss.x, boss.y, circlepos.x - 10, circlepos.y);
      line(boss.x, boss.y, circlepos.x, circlepos.y + 10);
      line(boss.x, boss.y, circlepos.x, circlepos.y - 10);
      stroke(50, 50, 50);
      circle(circlepos.x, circlepos.y, 120);
      strokeWeight(5);
      circle(circlepos.x, circlepos.y, 90);
      let m = boss.getModel();
      let size = new Vector(m.displayWidth, m.displayHeight);
      let scale = size.x > size.y ? 110 / size.x : 110 / size.y;
      // console.log(scale);
      boss.drawIcon(circlepos.x, circlepos.y, scale);
      textFont(fonts.ocr);
      fill(150, 150, 150);
      textSize(30);
      let dst = roundNum(distanceOffscreen(boss) / 10);
      text(dst, circlepos.x - textWidth(dst) / 2, circlepos.y + 50);
      pop();
    }
  });
}

function createPlayer() {
  let player = construct(Registry.entities.get("player"));
  //Add all slots: not all of them will be accessible
  player.addWeaponSlot(selector2.ap(1));
  player.addWeaponSlot(selector2.ap(2));
  player.addWeaponSlot(selector2.ap(3));
  player.addWeaponSlot(selector2.ap(4));
  player.addWeaponSlot(selector2.ap(5));
  player.addWeaponSlot(selector2.booster());
  player.addToWorld(world);
  game.player = player;
  //is moab
  player.upgrade("moab");
  //Change to an accessor property
  Object.defineProperty(player, "target", {
    get: () => {
      return game.target;
    }, //This way, I only have to set it once, and it's responsive.
  });

  world.particles.push(
    new WaveParticle(player.x, player.y, 120, 0, 1920, [255, 0, 0], [255, 0, 0, 0], 100, 0),
  );
}

function createSupport() {
  let suppor = construct(Registry.entities.get("support"));
  //Add all slots: not all of them will be accessible
  suppor.addWeaponSlot(selector2.sp1());
  suppor.addToWorld(world);
  game.support = suppor;

  suppor.upgrade("support-moab");
  suppor.target = game.player;

  world.particles.push(
    new WaveParticle(suppor.x, suppor.y, 60, 0, 1920, [255, 0, 0], [255, 0, 0, 0], 100, 0),
  );
  // console.log("spawned support blimp", game.support);
}

function fireIfPossible() {
  if (ui.menuState === "in-game" && ui.firing) {
    for (let slotidx = 0; slotidx < 5; slotidx++) {
      let weapon = game.player?.weaponSlots[slotidx]?.weapon;
      if (weapon) weapon.fire();
    }
  }
}

function checkBoxCollisions() {}

function playerDies() {
  setTimeout(() => {
    SoundCTX.stop("*");
    SoundCTX.play("player-death");
  }, 0);
  deathStats.shardCounter.text = "Shards: " + shortenedNumber(game.shards);
  deathStats.bloonstoneCounter.text = "Bloonstones: " + shortenedNumber(game.bloonstones);
  deathStats.progress.text = "Zone: " + world.name + " | Level " + game.level;
  deathStats.damageDealt.text = "Damage Dealt: " + shortenedNumber(game.player.damageDealt);
  deathStats.damageTaken.text = "Damage Taken: " + shortenedNumber(game.player.damageTaken);
  deathStats.destroyedBoxes.text =
    "Boxes Destroyed: " + shortenedNumber(game.player.destroyed.boxes);
  deathStats.destroyedBosses.text =
    "Bosses Destroyed: " + shortenedNumber(game.player.destroyed.bosses);
  ui.menuState = "you-died";
  //Reset world and game
  reset();
}

function playerWins() {
  setTimeout(() => {
    SoundCTX.stop("*");
  }, 0);
  winStats.shardCounter.text = "Shards: " + shortenedNumber(game.shards);
  winStats.bloonstoneCounter.text = "Bloonstones: " + shortenedNumber(game.bloonstones);
  winStats.damageDealt.text = "Damage Dealt: " + shortenedNumber(game.player.damageDealt);
  winStats.damageTaken.text = "Damage Taken: " + shortenedNumber(game.player.damageTaken);
  winStats.destroyedBoxes.text = "Boxes Destroyed: " + shortenedNumber(game.player.destroyed.boxes);
  winStats.destroyedBosses.text =
    "Bosses Destroyed: " + shortenedNumber(game.player.destroyed.bosses);
  ui.menuState = "you-win";
  //Reset world and game
  reset();
}

function reset() {
  SoundCTX.unmuffle();
  world.entities.splice(0);
  world.particles.splice(0);
  world.bullets.splice(0);
  game.bloonstones = 0;
  game.shards = 400;
  game.level = 1;
  unpause();
  game.bosstimer = game.bossinterval;
  game.bossdelay = game.bossinterval;
  game.maxDV = 0;
  game.totalBosses = 0;

  game.increasedLevelSize = false;
  game.levelBig = false;
  game.deaths = 0;

  // for (let slot of game.player.weaponSlots) {
  //   slot.clear(); //Remove any weapons
  // }
  //back to start
  moveToWorld("ocean-skies");

  // Reset some UI
  UIComponent.setCondition("boss:no");

  // mark for removal from world
  game.support.dead = game.player.dead = true;
  // garbage collect player and support
  game.support = null;
  game.player = null;
}

//Triggers on any key press
function keyPressed(ev) {
  if (ui.keybinds.event(ev)) return false;
  if (ui.menuState === "in-game" && game.keybinds.event(ev)) return false;

  //ignore caps lock
  let k = key.toLowerCase();

  if (k === "f3") {
    //Toggle debug mode
    if (UIComponent.evaluateCondition("debug:true")) UIComponent.setCondition("debug:false");
    else UIComponent.setCondition("debug:true");
  }
  if (k === "f12") {
    //devtools
    return true;
  }
  if (k === "f11") {
    //fullscreen
    return true;
  }
  return false; //Prevent any default behaviour
}
function keyReleased(ev) {
  ui.keybinds.event(ev, true);
  game.keybinds.event(ev, true);
}

function keyTyped() {
  let k = key.toLowerCase();
  if (ui.type(k)) return false;
  return false;
}

function pause() {
  game.paused = true;
  UIComponent.setCondition("paused:true");
}

function unpause() {
  game.paused = false;
  UIComponent.setCondition("paused:false");
}

function moveToWorld(worldName = "ocean-skies") {
  if (world?.bgm) SoundCTX.stop(world.bgm);
  //Construct registry item as a new World.
  let newWorld = construct(Registry.worlds.get(worldName), World);
  if (newWorld.muffleSound) SoundCTX.muffle();
  else SoundCTX.unmuffle();
  //If the player exists
  if (game.player) {
    //Put them in it
    game.player.addToWorld(newWorld);
    //Reset player position
    game.player.x = 200;
    game.player.y = 540;
  }
  //If support exists
  if (game.support) {
    //Put it in world too
    game.support.addToWorld(newWorld);
    //Reset player position
    game.support.x = 300;
    game.support.y = 740;
  }

  //Set the game's world to the new one. The old one will be garbage collected.
  world = newWorld;
  game.world = worldName;
  //Make the flash effect
  worldTransitionEffect(world.name);
}

function reload() {
  noLoop();
  loop();
}

function saveGame() {
  let save = {
    saveFormatVersion: CURRENT_SAVE_FORMAT_VERSION,
    level: game.level,
    zone: game.world,
    znlvl: world.getBossIndex(),
    difficulty: game.difficulty,
    mode: game.mode,

    shards: game.shards,
    bloonstones: game.bloonstones,

    levels: game.player.weaponSlots.map((x) => x.tier),
    support: game.support.weaponSlots.map((x) => x.tier),
    choices: [1, 2, 3, 4, 5].map((s) => +UIComponent.getCondition("ap" + s + "-slot")),
    blimp: game.player.blimpName,

    health: game.player.health,
    dv: game.player.dv,
    maxDV: game.maxDV,

    destroyed: {
      boxes: game.player.destroyed.boxes,
      bosses: game.player.destroyed.bosses,
    },
    damage: {
      dealt: game.player.damageDealt,
      taken: game.player.damageTaken,
    },

    won: game.won,
    bossweapons: [...game.bossweapons],
  };
  Serialiser.set("save." + game.saveslot, save);
  Serialiser.set("achievements", game.achievements);
  notifyEffect("Game saved in slot " + game.saveslot);
  regenSaveDescrs();
}

function deleteGame(slot) {
  Serialiser.delete("save." + slot);
  regenSaveDescrs();
}

function loadGame(slot) {
  let save = Serialiser.get("save." + slot);
  //settings
  game.difficulty = save.difficulty ?? "normal";
  game.mode = save.mode ?? "adventure";
  //Progress
  game.bossdelay = 0;
  moveToWorld(save.zone ?? "ocean-skies");
  world.setBossIndex(save.znlvl ?? 1);
  game.level = save.level ?? 1;
  game.shards = save.shards ?? 400;
  game.bloonstones = save.bloonstones ?? 0;
  game.maxDV = save.maxDV ?? 0;
  game.player.dv = save.dv ?? 0;
  //Choices
  [1, 2, 3, 4, 5].forEach((sl, i) => {
    selector2.chooseAP(sl, (save.choices ?? [1, 1, 1, 1, 1])[i] ?? 1);
  });
  game.player.weaponSlots = [];
  game.player.addWeaponSlot(selector2.ap(1));
  game.player.addWeaponSlot(selector2.ap(2));
  game.player.addWeaponSlot(selector2.ap(3));
  game.player.addWeaponSlot(selector2.ap(4));
  game.player.addWeaponSlot(selector2.ap(5));
  game.player.addWeaponSlot(selector2.booster());
  for (let sl = 0; sl < 6; sl++) game.player.weaponSlots[sl].setTier((save.levels ?? [])[sl] ?? 0);

  game.support.addWeaponSlot(selector2.sp1());
  for (let sl = 0; sl < 1; sl++)
    game.support.weaponSlots[sl].setTier((save.support ?? [])[sl] ?? 0);
  //blomp
  game.player.upgrade(save.blimp ?? "moab");
  game.player.health = save.health ?? game.player.maxHealth ?? 0;
  //stats
  game.player.destroyed = save.destroyed ?? { bosses: 0, boxes: 0 };
  game.player.damageDealt = save.damage?.dealt ?? 0;
  game.player.damageTaken = save.damage?.taken ?? 0;
  game.bossweapons = new Set(save.bossweapons ?? []);
}
