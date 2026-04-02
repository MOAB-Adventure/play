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

  colour = [50, 255, 255, 150];
  colourTo = [50, 255, 255, 0];
  trailColour = [0, 255, 255, 255];
  trailColourTo = [0, 255, 255, 50];
  trail = false;

  trailWidth = 10;

  bounceable = false;
  init() {
    super.init();
    this.maxLife = this.lifetime;
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
      this.pos = new Vector(this.entity.x, this.entity.y);
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
    entity.knock(this.growth, d.angle, 0); //Knock with size change but more
  }
  /**@param {Bullet} bullet  */
  bulbonk(bullet) {
    let d = this.pos.directionTo(bullet.x, bullet.y);
    bullet.direction = d.angle;
    bullet.entity = this.entity;
    bullet.step(1);
    if (bullet instanceof Missile) bullet.targetType = "nearest";
  }
  draw() {
    push();
    let lf = this.lifetime / this.maxLife;
    fill(...blendColours(this.colour, this.colourTo, lf));
    stroke(...blendColours(this.trailColour, this.trailColourTo, lf));
    strokeWeight(this.trailWidth);
    circle(this.x, this.y, this.hitSize * 2);
    pop();
  }
}
// Deflection that won't despawn.
class Shield extends Deflection {
  // defines how much will be bounced - reduced by entity *current* hp if bouncing entity, reduced by total projectile damage if bouncing projectile
  strength = 100;
  maxStrength = 100;

  _pulse = 0;
  colour = [50, 255, 255, 0];
  colourTo = [50, 255, 255, 150];
  trailColour = [0, 255, 255, 0];
  trailColourTo = [0, 255, 255, 255];
  hitSize = 0;
  init() {
    super.init();
    this.maxStrength = this.strength;
  }
  step(dt) {
    this.sound();
    //Not if dead
    if (!this.remove) {
      this.intervalTick();
      if(this.entity?.dead) this.remove = true;
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
    let lf = this.lifetime / this.maxLife;
    if (this.lifetime <= 0) fill(...blendColours(this.colour, this.colourTo, lf));
    else noFill();
    stroke(...blendColours(this.trailColour, this.trailColourTo, lf));
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
    this.strength -= entity.shieldDamageOverride || entity.health;
  }
  /**@param {Bullet} bullet  */
  bulbonk(bullet) {
    super.bulbonk(bullet);
    this.strength -= bullet.damage.reduce((p, c) => p + c.amount, 0);
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
    let lf = this.lifetime / this.maxLife;
    fill(...blendColours(this.colour, this.colourTo, lf));
    stroke(...blendColours(this.trailColour, this.trailColourTo, lf));
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
