class World {
  forceTickParticles = [];
  particles = [];
  bgparticles = [];
  /** @type {Entity[]} */
  entities = [];
  /** @type {Bullet[]} */
  bullets = [];
  spawning = [];
  background = "background.sea";
  backgroundUp = null;
  backgroundDown = null;
  name = "World";

  reducedSpawns = false;
  transitioning = false;

  bosses = [];
  boss = null;
  bossInterval = 400;

  endless = false;
  muffleSound = false;

  #bossList = [];
  #currentBossIndex = 0;
  get cbi() {
    return this.#currentBossIndex;
  }

  noticks = 0;

  //Sounds!
  bgm = null; //Background Music
  bossmusic = null; // override for boss music
  ambientSound = null; //Played randomly
  ambienceChance = 0.001; //Chance per frame to play ambientSound

  constructor(name = "World", background = "background.sea", bgm = null) {
    this.name = name;
    this.background = background;
    this.bgm = bgm;
  }
  init() {
    this.backgroundUp ??= this.background;
    this.backgroundDown ??= this.background;
    //Copy bosses array
    this.#bossList = this.bosses.slice(0);
    //Throw if no bosses, to prevent a different error
    //Each world has to have a final anyway, or the player can't leave.
    if (this.bosses.length === 0) {
      throw new Error("Each world must have at least one defined boss!");
    }
    //Get improper spawning array
    let spawns = this.spawning.slice(0);
    //reset actual spawning
    this.spawning = [];
    for (let spawner of spawns) {
      //Add the spawning group properly
      this.addSpawn({
        entity: Registry.entities.get(spawner.entity),
        interval: spawner.interval,
        isHighTier: spawner.isHighTier ?? false,
        imposMode: spawner.imposMode ?? "ignore",
      });
    }
  }
  tickSound() {
    if (this.ambientSound && Math.random() < this.ambienceChance) {
      SoundCTX.play(this.ambientSound);
    }
    if (game.music) {
      if (this.bossmusic) {
        if (!this.boss) {
          SoundCTX.swap(this.bossmusic, this.bgm, true);
        } else {
          SoundCTX.swap(this.bgm, this.bossmusic, true);
        }
      } else SoundCTX.play(this.bgm, true);
    }
  }
  tickAll() {
    for (let particle of this.forceTickParticles) {
      particle.step(1);
    }
    if (this.noticks > 0) this.noticks--;
    else {
      background.tick(game.player?.speed ?? 0);
      this.#actualTick();
      this.#removeDead();
      this.tickSpawns(game.player?.speed ?? 0);
    }
    let len = this.forceTickParticles.length;
    for (let p = 0; p < len; p++) {
      if (this.forceTickParticles[p]?.remove) {
        this.forceTickParticles.splice(p, 1);
      }
    }
  }
  #actualTick() {
    //Tick *everything*
    for (let bullet of this.bullets) {
      for (let i = 0; i < bullet.updates; i++) {
        bullet.step(1);
      }
    }
    for (let particle of this.particles) {
      particle.step(1);
    }
    for (let particle of this.bgparticles) {
      particle.step(1);
    }
    for (let entity of this.entities) {
      entity.tick();
    }
  }
  #removeDead() {
    //THEN remove dead stuff
    let len = this.bullets.length;
    for (let b = 0; b < len; b++) {
      if (this.bullets[b]?.remove) {
        let bullet = this.bullets[b];
        for (let instance of bullet.damage) {
          if (instance.area)
            //If it explodes
            splashDamageInstance(
              bullet.x,
              bullet.y,
              instance.amount +
                (instance.dvRatio && bullet.entity ? instance.dvRatio * bullet.entity.dv : 0) +
                (instance.levelScaling ?? 0) * game.level,
              instance.type,
              instance.area,
              bullet.entity,
              instance.visual, //        \
              instance.sparkColour, //   |
              instance.sparkColourTo, // |
              instance.smokeColour, //   |- These are optional, but can be set per instance
              instance.smokeColourTo, // |
              instance.waveColour, //    /
              bullet.status,
              bullet.statusDuration,
              instance.bossDamageMultiplier ?? 1,
            );
          if (instance.blinds) {
            blindingFlash(
              bullet.x,
              bullet.y,
              instance.blindOpacity,
              instance.blindDuration,
              instance.glareSize,
            );
          }
        }
        if (!bullet.fragDisabled) bullet.frag();
        //Sound time!
        SoundCTX.play(bullet.despawnSound);
        //Delete the bullet
        this.bullets.splice(b, 1);
        b--;
      }
    }
    len = this.bgparticles.length;
    for (let p = 0; p < len; p++) {
      if (this.bgparticles[p]?.remove) {
        this.bgparticles.splice(p, 1);
        p--;
      }
    }
    len = this.particles.length;
    for (let p = 0; p < len; p++) {
      if (this.particles[p]?.remove) {
        this.particles.splice(p, 1);
        p--;
      }
    }
    len = this.entities.length;
    for (let e = 0; e < len; e++) {
      let entity = this.entities[e];
      if (entity?.dead) {
        if (entity === game.player && game.mode === "sandbox") {
          entity.dead = false;
          game.deaths++;
          toasts.show(
            `Death #${game.deaths}`,
            `Source: ${entity.lastHurtSource?.name ?? "None"}`,
            240,
            ToastStyle.error,
          );
          this.noticks = 120;
          this.forceTickParticles.push(
            new ShapeParticle(
              entity.x,
              entity.y,
              0,
              60,
              0,
              0,
              "circle",
              [255, 0, 0],
              [255, 0, 0, 0],
              0,
              1000,
              0,
              1000,
              0,
              false,
              false,
            ),
          );
          if (entity.lastHurtSource) {
            let d = dist(entity.x, entity.y, entity.lastHurtSource.x, entity.lastHurtSource.y);
            this.forceTickParticles.push(
              new ShapeParticle(
                entity.lastHurtSource.x,
                entity.lastHurtSource.y,
                0,
                60,
                0,
                0,
                "circle",
                [255, 0, 0],
                [255, 0, 0, 0],
                0,
                d * 2,
                0,
                d * 2,
                0,
                false,
                false,
              ),
            );
          }
          continue;
        }
        if (!entity.left) {
          if (entity.lastHurtSource) entity.lastHurtSource.dv += entity.dv;
          entity.onDeath(entity.lastHurtSource);
          SoundCTX.play(entity.deathSound);
        } else {
          entity.onDespawn();
        }
        game.maxDV += entity.dv;
        if (entity instanceof Boss && !entity.isMinion) game.totalBosses++;
        this.entities.splice(e, 1);
        e--;
      }
    }
    //No search algorithms => faster
  }
  drawAll() {
    for (let particle of this.bgparticles) {
      particle.draw();
    }
    for (let particle of this.particles) {
      if (particle instanceof AfterImageParticle) particle.draw();
    }
    for (let entity of this.entities) {
      entity.draw();
    }
    for (let bullet of this.bullets) {
      bullet.draw();
    }
    for (let particle of this.forceTickParticles) {
      particle.draw();
    }
    for (let particle of this.particles) {
      if (!(particle instanceof AfterImageParticle)) particle.draw();
    }
  }
  tickSpawns(dt) {
    if (this.transitioning) return;
    for (let spawnGroup of this.spawning) {
      if (
        (spawnGroup.imposMode === "when-on" && game.difficulty !== "impossible") ||
        (spawnGroup.imposMode === "when-off" && game.difficulty === "impossible")
      )
        continue;
      if (spawnGroup.$currentCooldown <= 0) {
        let ent = construct(spawnGroup.entity, Entity);
        ent.addToWorld(this);
        ent.x = game.borderRight;
        ent.y = rnd(game.borderTop, game.borderBottom);
        spawnGroup.$currentCooldown = spawnGroup.interval;
      } else {
        if (!this.reducedSpawns) spawnGroup.$currentCooldown -= dt;
      }
    }
  }
  nearestEnemyTo(x, y, team = "") {
    let dist = Infinity;
    let sel = null;
    for (let e of this.entities) {
      if (!team || e.team !== team) {
        let d = Math.sqrt((e.x - x) ** 2 + (e.y - y) ** 2) - e.hitSize;
        if (d < dist) {
          sel = e;
          dist = d;
        }
      }
    }
    return sel;
  }
  addSpawn(
    spawn = {
      entity: Box.default,
      interval: 60,
      isHighTier: false,
      imposMode: "ignore", // "when-on", "when-off" or "ignore"
    },
  ) {
    //Handle bad properties like `null`
    spawn.entity ??= Box.default;
    spawn.interval ??= 60;
    spawn.oldinterval = spawn.interval;
    //Add group
    spawn.$currentCooldown = 0;
    this.spawning.push(spawn);
  }
  updateDifficulty() {
    for (let spawn of this.spawning) {
      //Apply difficulty rules
      spawn.interval =
        (spawn.oldinterval ?? 60) /
          Registry.difficulties.get(game.difficulty)[
            spawn.isHighTier ? "spawnRateHighTier" : "spawnRateLowTier"
          ] ?? 1;
    }
  }
  spawnBoss(entity, bossClass = "o") {
    //bossClass shows a letter on the square part of the bossbar
    /**@type {Entity} */
    let ent = construct(entity, Entity); //Construct entity
    ent.class = bossClass;
    ent.isBoss = true; //boss is made of boss
    UIComponent.setCondition("boss:yes"); //There is, in fact, a boss.
    ent.addToWorld(this); //Add entity
    this.boss = ent;
    SoundCTX.stop(this.bossmusic);
    SoundCTX.stop(this.bgm);
    this.bossmusic = ent.bossmusic;
    return ent;
  }
  getFirstBoss() {
    if (this.boss && !this.boss.dead) return this.boss;
    for (let entity of this.entities) {
      if (entity.isBoss && !entity.hidden) {
        this.boss = entity;
        return entity;
      }
    }
    return null;
  }
  getAllBosses() {
    return this.entities.filter((entity) => entity.isBoss && !entity.hidden);
  }
  setBossList(...bosses) {
    this.#bossList = bosses;
  }
  nextBoss() {
    if (this.transitioning) return;
    this.spawnBoss(Registry.entities.get(this.#bossList[this.#currentBossIndex]));
    this.#currentBossIndex++;
    if (this.#currentBossIndex >= this.#bossList.length) this.#currentBossIndex = 0;
  }
  getBossIndex() {
    return this.#currentBossIndex;
  }
  setBossIndex(idx) {
    this.#currentBossIndex = idx;
  }
}
