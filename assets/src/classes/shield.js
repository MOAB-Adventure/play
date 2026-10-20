// a kind of bullet which damages nothing
class Deflection extends Bullet {
  // bullet deflections
  deflectBullets = true;
  maxDamage = -1; // total bullet damage must be below this to be bounced
  // entity deflections
  deflectEntities = true;

  // sizing
  growth = 15; // hitsize increase per frame
  falloff = 0; // growth falloff amount per frame: 0.01 = multiplies by 0.99 every frame

  colour = col.from(50, 255, 255, 150);
  colourTo = col.from(50, 255, 255, 0);
  trailColour = col.from(0, 255, 255, 255);
  trailColourTo = col.from(0, 255, 255, 50);
  trail = false;

  trailWidth = 10;
  hitSize = 0;

  bounceable = false;
  followSource = true;
  init() {
    super.init();
    this.colour = col.convert(this.colour);
    this.colourTo = col.convert(this.colourTo);
    this.trailColour = col.convert(this.trailColour);
    this.trailColourTo = col.convert(this.trailColourTo);
    this.maxLife = this.lifetime;

    this.fragOffset += this.hitSize + this.growth * this.lifetime;
  }
  step(dt) {
    this.sound();
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      this.direction += this.rotateSpeed;
      //Tick lifetime
      if (this.lifetime <= 0 || this.entity.dead) {
        this.remove = true;
        return;
      } else {
        this.lifetime -= dt;
        this.hitSize += this.growth;
        if (this.falloff) this.growth *= 1 - this.falloff;
      }
      this.checkEntities();
      if (this.followSource) this.pos = new Vector(this.entity.x, this.entity.y);
    }
  }
  checkEntities() {
    for (let entity of this.world.entities) {
      //If colliding with a this on different team, that it hasn't already been hit by and that still exists
      if (
        this.collides &&
        !this.remove &&
        entity.team !== this.entity.team &&
        entity.bounceable && // only bonk boxes or certain bosses
        this.collidesWith(entity) //check collisions last for performance reasons
      ) {
        this.bonk(entity);
        if (this.status !== "none") {
          entity.applyStatus(this.status, this.statusDuration);
        }
        if (!this.silent) {
          if (!this.damaged.includes(entity)) SoundCTX.play(entity.hitSound);
          SoundCTX.play(this.hitSound);
        }
        this.damaged.push(entity);
      }
    }
  }
  bonk(entity) {
    let d = this.pos.directionTo(entity.x, entity.y);
    entity.knock(this.growth, d.angle, 0, undefined, undefined, false); //Knock with size change but more

    this.onHit(entity);
  }
  /**@param {Bullet} bullet  */
  bulbonk(bullet) {
    let d = this.pos.directionTo(bullet.x, bullet.y);
    bullet.direction = this.growth > 0 ? d.angle : -d.angle;
    bullet.entity = this.entity;
    bullet.step(1);
    if (bullet instanceof Missile) bullet.targetType = "nearest";
  }
  draw() {
    push();
    const lf = this.lifetime / this.maxLife;
    col.fill(col.in2rp(this.colour, this.colourTo, 1 - lf));
    col.stroke(col.in2rp(this.trailColour, this.trailColourTo, 1 - lf));
    strokeWeight(this.trailWidth);
    circle(this.x, this.y, this.hitSize * 2);
    pop();
  }
  //On top of damage
  onHit(entity) {
    const d2 = this.pos.directionTo(entity.x, entity.y).angle;
    //Always spawn hit bullets
    patternedBulletExpulsion(
      entity.x,
      entity.y,
      this.hitBullet,
      this.hitNumber,
      d2 + this.hitDirection,
      this.hitSpread,
      this.hitSpacing,
      this.world,
      this.entity,
      this.source,
    );
    //If dead, spawn destroy bullets
    if (entity.dead) {
      patternedBulletExpulsion(
        entity.x,
        entity.y,
        this.destroyBullet,
        this.destroyNumber,
        d2 + this.destroyDirection,
        this.destroySpread,
        this.destroySpacing,
        this.world,
        this.entity,
        this.source,
      );
    }
  }
}
// deflection but it's directional
class ArcDeflection extends Deflection {
  arc = 10;
  get arcRad() {
    return (this.arc / 180) * Math.PI;
  }
  checkEntities() {
    for (let entity of this.world.entities) {
      //If colliding with a this on different team, that it hasn't already been hit by and that still exists
      if (
        this.collides &&
        !this.remove &&
        entity.team !== this.entity.team &&
        entity.bounceable && // only bonk boxes or certain bosses
        this.collidesWith(entity) //check collisions last for performance reasons
      ) {
        this.bonk(entity);
        if (this.status !== "none") {
          entity.applyStatus(this.status, this.statusDuration);
        }
        if (!this.silent) {
          if (!this.damaged.includes(entity)) SoundCTX.play(entity.hitSound);
          SoundCTX.play(this.hitSound);
        }
        this.damaged.push(entity);
      }
    }
  }
  collidesWith(obj) {
    return (
      super.collidesWith(obj) &&
      Math.abs(this.directionTo(obj.x, obj.y).angle - this.direction) <= this.arc
    );
  }
  draw() {
    push();
    const lf = this.lifetime / this.maxLife;
    col.fill(col.in2rp(this.colour, this.colourTo, 1 - lf));
    col.stroke(col.in2rp(this.trailColour, this.trailColourTo, 1 - lf));
    strokeWeight(this.trailWidth);
    arc(
      this.x,
      this.y,
      this.hitSize * 2,
      this.hitSize * 2,
      this.directionRad - this.arcRad,
      this.directionRad + this.arcRad,
    );
    pop();
  }
}
// Deflection that won't despawn.
class Shield extends Deflection {
  // defines how much will be bounced - reduced by entity *current* hp if bouncing entity, reduced by total projectile damage if bouncing projectile
  strength = 100;
  maxStrength = 100;

  // Flat reduction to the damage this shield takes.
  damageReduction = 0;

  _pulse = 0;
  colour = col.from(50, 255, 255, 0);
  colourTo = col.from(50, 255, 255, 150);
  trailColour = col.from(0, 255, 255, 50);
  trailColourTo = col.from(0, 255, 255, 255);
  init() {
    super.init();
    this.maxStrength = this.strength;
  }
  step(dt) {
    this.sound();
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      if (this.entity?.dead) this.remove = true;
      //Tick lifetime
      if (this.lifetime <= 0) {
        if (this.strength <= 0) {
          this.remove = true;
          return;
        } else {
          if (this._pulse >= 30) {
            this._pulse = -30;
          } else this._pulse += dt;
        }
      } else {
        this.lifetime -= dt;
        this.hitSize += (this.entity.hitSize / this.maxLife) * 1.75;
      }
      this.checkEntities();
      this.damaged = [];
      if (this.entity) this.pos = new Vector(this.entity.x, this.entity.y);
    }
  }
  draw() {
    push();
    const lf = this.lifetime / this.maxLife;
    if (this.lifetime <= 0) col.fill(col.in2rp(this.colour, this.colourTo, 1 - lf));
    else noFill();
    col.stroke(col.in2rp(this.trailColour, this.trailColourTo, 1 - lf));
    strokeWeight(this.trailWidth);
    circle(this.x, this.y, this.hitSize * 2);
    if (this._pulse > 0) {
      noFill();
      strokeWeight(30 - this._pulse);
      circle(this.x, this.y, this.hitSize * 2 + this._pulse * 2);
    }
    pop();
  }
  bonk(entity) {
    let d = this.pos.directionTo(entity.x, entity.y).angle;
    //Knock with size change but even more
    entity.knock(this.growth, d, 0);
    Timer.main.repeat(() => entity.knock(this.growth, d, 0), entity.shieldReboundOverride || 5);
    this.strength -= Math.max(
      (entity.shieldDamageOverride || entity.health) - this.damageReduction,
      0,
    );
    this.onHit(entity);
  }
  /**@param {Bullet} bullet  */
  bulbonk(bullet) {
    super.bulbonk(bullet);
    this.strength -= Math.max(
      bullet.damage.reduce((p, c) => p + c.amount, -this.damageReduction),
      0,
    );
  }
}
class ShieldWall extends Shield {
  width = 20;
  maxWidth = 0;
  init() {
    super.init();
    this.maxWidth = this.width;
    this.width = 0;
  }
  step(dt) {
    this.sound();
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      //Tick lifetime
      if (this.lifetime <= 0) {
        if (this.strength <= 0 || this.entity.dead) {
          this.remove = true;
          return;
        } else {
          if (this._pulse >= 30) {
            this._pulse = -30;
          } else this._pulse += dt;
        }
      } else {
        this.lifetime -= dt;
        this.width += (this.maxWidth / this.maxLife) * dt;
      }
      this.checkEntities();
      this.damaged = [];
    }
  }
  collidesWith(obj) {
    return obj.x - obj.hitSize < this.x + this.width && obj.x + obj.hitSize > this.x - this.width;
  }
  draw() {
    push();
    const lf = this.lifetime / this.maxLife;
    col.fill(col.in2rp(this.colour, this.colourTo, 1 - lf));
    col.stroke(col.in2rp(this.trailColour, this.trailColourTo, 1 - lf));
    strokeWeight(this.trailWidth);
    rect(this.x, this.y, this.width, 1100);
    if (this._pulse > 0) {
      noFill();
      strokeWeight(30 - this._pulse);
      rect(this.x, this.y, this.width + this._pulse * 2, 1100);
    }
    pop();
  }
  bonk(entity) {
    if (entity.x < this.x) entity.knock(this.growth * 2, 180, 0);
    else if (entity.x > this.x) entity.knock(this.growth * 2, 0, 0);
    this.strength -= entity.shieldDamageOverride || entity.health;
  }
  /**@param {Bullet} bullet  */
  bulbonk(bullet) {
    if (bullet.x < this.x)
      bullet.direction = 180; //if to left, reflect left
    else if (bullet.x > this.x) bullet.direction = 0; //if to right, reflect right
    bullet.entity = this.entity;
    bullet.step(1);
    this.strength -= bullet.damage.reduce((p, c) => p + c.amount, 0);
    if (bullet instanceof Missile) bullet.targetType = "nearest";
  }
}
