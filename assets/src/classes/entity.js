class Entity {
  x = 0;
  y = 0;
  direction = 0;
  //Slots only for players
  /**@type {WeaponSlot[]} */
  weaponSlots = [];
  health = 100;
  maxHealth = 100;
  name = "Entity";
  /**@type {World} */
  world = null;
  resistances = [];
  //How the entity will be drawn
  drawer = { shape: "circle", fill: "red", image: "error", width: 100, height: 100 };
  hitSize = 100;
  speed = 10;
  team = "enemy";
  target = { x: 0, y: 0 };

  collides = true;
  bounceable = true;
  shieldDamageOverride = 0;
  shieldReboundOverride = 0;

  //Stats
  damageDealt = 0;
  damageTaken = 0;
  destroyed = { boxes: 0, bosses: 0 };
  lastHurtSource = null;
  dv = 0;

  //Status effects
  effectiveDamageMult = 1;
  effectiveHealthMult = 1;
  effectiveResistanceMult = 1;
  effectiveSpeedMult = 1;
  /** @type {Object<string, number>} */
  statuses = {};

  //Sounds
  hitSound = null;
  deflectSound = null;
  deathSound = null;

  blimp = null;
  blimpName = "";

  /** @type {Shield?} */
  _shield = null;

  //Movement
  aiActive = true;
  turnSpeed = 5;
  turnWhileMoving = false;
  trackTarget = false;
  trackingOffsetX = 400;
  trackingOffsetY = 0;
  previousRot = 0;
  lastPos = Vector.ZERO;
  get velocity() {
    return this.lastPos.subXY(this.x, this.y).scale(-1);
  }

  get directionRad() {
    return (this.direction / 180) * Math.PI;
  }

  constructor() {} //Because universal
  immuneTo(type) {
    let calcAmount = 1;
    for (let resistance of this.resistances) {
      if (resistance.type === type) {
        calcAmount -= resistance.amount; //Negative resistance would actually make it do more damage
      }
    }
    // console.log(this.name, calcAmount === 0 ? "immune" : "not immune", "to", type)
    return calcAmount === 0;
  }
  burstShield(deflections = 1) {
    repeat(deflections, (i) => {
      // make transparent deflection from old shield
      let bulletToFire = bullet({
        type: "deflect",
        lifetime: Math.min(this._shield.maxLife * 1.5, 60),
        hitSize: this._shield.hitSize / 2,
        colour: [0, 0, 0, 0],
        colourTo: [0, 0, 0, 0],
        trailColour: this._shield.trailColourTo,
        trailColourTo: this._shield.trailColour,
        growth: 25 + 10 * i,
        falloff: 0.025 * (deflections - i),
      });
      bulletToFire.entity = this;
      bulletToFire.world = this.world;
      this.world.bullets.push(bulletToFire);
    });
    // delete old shield
    this._shield.remove = true;
  }
  shield(strength = 200, spawnTime = 15, options = {}, deflections = 1) {
    if (this._shield) {
      this.burstShield(deflections);
    }

    // create shield
    let o = Object.assign(options, { type: "shield", lifetime: spawnTime, strength: strength });
    // Spawn it in
    let bulletToFire = bullet(o);
    bulletToFire.entity = this;
    bulletToFire.world = this.world;
    this.world.bullets.push(bulletToFire);
    // is mine
    this._shield = bulletToFire;
  }
  upgrade(blimp) {
    this.blimpName = blimp;
    construct(Registry.blimps.get(blimp), Blimp).upgradeEntity(this);
  }
  init() {
    this.scaleToDifficulty();
    this.maxHealth = this.health; //Stop part-damaged entities spawning
    /**@type {Array<WeaponSlot>} */
    let madeSlots = this.weaponSlots.map((x) => construct(x, WeaponSlot)); //Create weapon slots
    this.weaponSlots = [];
    madeSlots.forEach((x) => {
      this.addWeaponSlot(x);
      let t = x.tier;
      x.tier = 0;
      for (let i = 0; i < t; i++) {
        x.attemptUpgrade();
      }
    });
  }
  addToWorld(world) {
    world.entities.push(this);
    this.world = world;
    return this;
  }
  damage(type = "normal", amount = 0, source = null) {
    if (source) this.lastHurtSource = source;
    let calcAmount = (amount / this.effectiveHealthMult) * (source?.effectiveDamageMult ?? 1); //Get damage multiplier of source, if there is one
    for (let resistance of this.resistances) {
      if (resistance.type === type) {
        calcAmount -= amount * resistance.amount; //Negative resistance would actually make it do more damage
      }
    }
    this.takeDamage(Math.max(calcAmount, 0), source); //Take the damage, but never take negative damage
  }
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
  knock(
    amount = 0,
    direction = -this.direction,
    kineticKnockback = false,
    resolution = 1,
    collided = [],
  ) {
    if (resolution < 0) resolution *= -1; //Fix possibility of infinite loop
    if (resolution == 0) resolution = 1;
    //so sin and cos only happen once
    let ymove = Math.sin(radians(direction));
    let xmove = Math.cos(radians(direction));
    if (!kineticKnockback) {
      this.x += amount * xmove; //Knock in the direction of impact
      this.y += amount * ymove;
    } else {
      let hit = false; //Has the entity hit anything?
      for (let iteration = 0; iteration < amount; iteration += resolution) {
        //For every entity this one could possibly collide with
        for (let entity of this.world.entities) {
          if (
            //If a valid collision
            entity !== this &&
            !entity.dead &&
            !collided.includes(entity) && //Not if already hit
            this.collidesWith(entity)
          ) {
            //It's hit something!
            hit = true;
            collided.push(entity);

            //Move back to stop infinite loop
            this.x -= resolution * xmove; //Knock in the direction of impact
            this.y -= resolution * ymove;

            //Propagate knockback

            entity.knock(
              amount * 0.75 /* exponential decay */,
              direction,
              true,
              resolution,
              collided,
            ); //Pass on collided entities to prevent infinite loop
          }
        }
        //If hit, stop moving
        if (hit) break;
        else {
          //If not hit, move
          this.x += resolution * xmove; //Knock in the direction of impact
          this.y += resolution * ymove;
        }
      }
    }
    //visual effect because cool
    if (game.effects === 1 || tru(game.effects))
      this.world.particles.push(
        new AfterImageParticle(
          this.x,
          this.y,
          radians(direction),
          10,
          0,
          0,
          "ui.dash-spike",
          300,
          100,
          133,
          400,
          0,
          true,
        ),
      );
  }
  takeDamage(amount = 0, source = null) {
    this.damageTaken += Math.min(amount, this.health) * this.effectiveHealthMult;
    if (source) source.damageDealt += Math.min(amount, this.health) * this.effectiveHealthMult; //Stats pretend health was higher
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.dead = true;
    }
  }
  addWeaponSlot(slot) {
    this.weaponSlots.push(slot);
    slot.entity = this;
  }
  tick() {
    if (this.aiActive && this.trackTarget)
      if (this.target)
        this.trackPoint(this.target.x + this.trackingOffsetX, this.target.y + this.trackingOffsetY);
    for (let slot of this.weaponSlots) {
      slot.tick();
    }
    this.lastPos = new Vector(this.x, this.y);
    //Move towards tracking point
    this.tickStatuses();
    if (this._shield?.remove) this._shield = null;
  }
  getClosestEnemy() {
    /*Don't actually need this yet*/
  }
  draw() {
    if (this.drawer.image) {
      ImageCTX.draw(
        this.drawer.image,
        this.x,
        this.y,
        this.drawer.width,
        this.drawer.height,
        this.directionRad,
      );
    } else {
      //If no image, draw shape instead
      rotatedShape(
        this.drawer.shape,
        this.x,
        this.y,
        this.drawer.width,
        this.drawer.height,
        this.directionRad,
      );
    }
    for (let slot of this.weaponSlots) {
      slot.draw();
    }
  }
  collidesWith(obj) {
    //No collisions if dead
    return !this.dead && dist(this.x, this.y, obj.x, obj.y) <= this.hitSize + obj.hitSize;
  }
  tickStatuses() {
    this.effectiveSpeedMult =
      this.effectiveDamageMult =
      this.effectiveHealthMult =
      this.effectiveResistanceMult =
        1;
    for (const status in this.statuses) {
      const effect = Registry.statuses.get(status);
      if (effect.vfx !== "none" && tru(effect.vfxChance))
        emitEffect(effect.vfx, this, rnd(this.hitSize), rnd(this.hitSize));
      this.damage(effect.damageType, effect.damage);
      this.heal(effect.healing);
      this.effectiveSpeedMult *= effect.speedMult ?? 1;
      this.effectiveDamageMult *= effect.damageMult ?? 1;
      this.effectiveHealthMult *= effect.healthMult ?? 1;
      this.effectiveResistanceMult *= effect.resistanceMult ?? 1;
      if (this.statuses[status] > 1)
        this.statuses[status]--; //Tick timer
      else delete this.statuses[status];
    }
  }
  applyStatus(effect, time) {
    this.statuses[effect] = Math.max(+time, this.statuses[effect] || 0);
  }
  clearStatus(effect) {
    delete this.statuses[effect];
  }
  scaleToDifficulty() {
    //Do nothing, as it doesn't matter for normal entities
  }
  onDeath(source) {
    if (this._shield) this.burstShield();
  }
  onDespawn() {}

  moveTowards(x, y, rotate = false) {
    if (!rotate) {
      let oldRot = this.direction;
      this.direction = this.previousRot;
      this.rotateTowards(x, y, this.turnSpeed);
      this.x += this.speed * Math.cos(radians(this.direction)); //Move in x-direction
      this.y += this.speed * Math.sin(radians(this.direction)); // Move in y-direction
      this.previousRot = this.direction;
      this.direction = oldRot;
      return true;
    } else {
      let done = this.rotateTowards(x, y, this.turnSpeed);
      this.x += this.speed * Math.cos(radians(this.direction)); //Move in x-direction
      this.y += this.speed * Math.sin(radians(this.direction)); // Move in y-direction
      return done;
    }
  }
  /** Moves and optionally rotates towards a point. */
  trackPoint(x, y) {
    if (this.target)
      if (
        this.moveTowards(
          x,
          y,
          this.turnWhileMoving && !(x === this.target.x || y === this.target.y),
        )
      )
        if (this.turnWhileMoving)
          /*If done moving*/
          // and target exists
          this.rotateTowards(this.target.x, this.target.y, this.turnSpeed); //turn towards it.
  }
  rotateTowards(x, y, amount) {
    let done = false;
    let maxRotateAmount = radians(amount); //use p5 to get radians
    let delta = { x: x - this.x, y: y - this.y };
    //Define variables
    let currentDirection = Vector.fromAngleRad(this.directionRad).angleRad; //Find current angle, standardised
    let targetDirection = Math.atan2(delta.y, delta.x); //Find target angle, standardised
    if (targetDirection === currentDirection) return; //Do nothing if facing the right way
    let deltaRot = targetDirection - currentDirection;
    //Rotation correction
    if (deltaRot < -PI) {
      deltaRot += TWO_PI;
    } else if (deltaRot > PI) {
      deltaRot -= TWO_PI;
    }
    let sign = deltaRot < 0 ? -1 : 1; //Get sign: -1 if negative, 1 if positive
    let deltaD = 0;
    //Choose smaller turn
    if (Math.abs(deltaRot) > maxRotateAmount) {
      deltaD = maxRotateAmount * sign;
      done = true; //Done turning
    } else {
      deltaD = deltaRot;
      done = false;
    }
    //Turn
    this.direction += degrees(deltaD);
    return done; // Tell caller its done
  }
}

//Entity that scales health as the game's level increases.
class ScalingEntity extends Entity {
  //Amount of extra health per game level.
  healthIncrease = 0;
  init() {
    this.health += this.healthIncrease * (game.level - 1 ?? 0); //Level 1 is +0 HP
    super.init(); //Make sure to do this part AFTER
  }
}
