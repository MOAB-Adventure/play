class Weapon {
  reload = 1;
  minReload = 0;
  barrel = 0;
  parts = [];
  shoot = {
    bullet: null,
    pattern: {
      spread: 0,
      amount: 1,
      spacing: 0,
    },
  };
  //Upgrade info
  cost = {
    shards: 0,
    bloonstones: 0,
  };
  /**@type {WeaponSlot} */
  slot = null;
  name = "Name goes here";
  description = "Description goes here";
  /**Rotation in degrees */
  rotation = 0;
  //Internal
  #delay = 0;
  _cooldown = 0;
  //Special weapon effects
  accel = 0;
  accelDecay = 0;
  maxAccel = 2;
  #acceleration = 0;
  #accelerated = 0;
  //Sound
  fireSound = null;
  //Recoil/Rotation
  recoil = 0;
  rotate = true;
  maxRotation = -1;
  themeColour = [100, 100, 100];
  //why only now?!?!
  shootX = 0;
  constructor() {}
  get rotationRadians() {
    return (this.rotation / 180) * Math.PI;
  }
  resetCD() {
    this._cooldown = this.minReload;
  }
  init() {
    let np = [];
    for (let p of this.parts) {
      if ((p.recoilAnimations || p.passiveAnimations) && p.type === "part") p.type = "weapon-part";
      np.push(construct(p, Part));
    }
    this.parts = np;
  }
  draw() {
    for (let p of this.parts) {
      p.draw ? p.draw(this.x, this.y, this.rotation) : {};
    }
  }
  tick() {
    if (!this.slot) return;
    if (this.slot.entity) {
      this.x = this.slot.entity.x + this.slot.posX;
      this.y = this.slot.entity.y + this.slot.posY;
      if (this.rotate && this.slot.entity.target) {
        this.rotation = new Vector(this.slot.entity.target.x, this.slot.entity.target.y).subXY(
          this.x,
          this.y,
        ).angle;
        //If there is a rotation confinement
        if (this.maxRotation >= 0) {
          if (this.rotation > this.maxRotation + this.slot.entity.direction)
            this.rotation = this.maxRotation + this.slot.entity.direction; //Constrain positively
          if (this.rotation < -this.maxRotation + this.slot.entity.direction)
            this.rotation = -this.maxRotation + this.slot.entity.direction; //Constrain negatively
        }
      } else {
        this.rotation = this.slot.entity.direction;
      }
    }
    this.decelerate();
    if (this._cooldown > 0) {
      this._cooldown--;
    }
    this.parts.forEach((x) => x.tick()); //Tick all parts
  }
  getAcceleratedReloadRate() {
    if (this.#acceleration <= -1 || this.#acceleration > this.maxAccel) return this.reload; //If bad acceleration then ignore it
    return this.reload / (1 + this.#acceleration); //2 acceleration = 200% fire rate increase = 3x fire rate
  }
  accelerate() {
    this.#accelerated = this.getAcceleratedReloadRate() * 1.1; //Always wait for at least the reload time before deceling
    if (this.#acceleration < this.maxAccel) {
      this.#acceleration += this.accel;
    }
    if (this.#acceleration > this.maxAccel) {
      this.#acceleration = this.maxAccel;
    }
  }
  decelerate() {
    //If accelerated this frame, don't slow down
    if (this.#accelerated > 0) {
      this.#accelerated--;
      return;
    }
    //Else do
    if (this.#acceleration > 0) {
      this.#acceleration -= this.accelDecay;
    }
    if (this.#acceleration < 0) {
      this.#acceleration = 0;
    }
  }
  fire() {
    if (this._cooldown <= 0) {
      SoundCTX.play(this.fireSound);
      this._cooldown = this.getAcceleratedReloadRate();
      this.accelerate(); //Apply acceleration effects

      if (this.recoil) this.slot.entity.knock(this.recoil, this.rotation + 180);

      let v = new Vector(this.x,this.y).add(new DirectionVector(this.rotation, this.shootX));
      patternedBulletExpulsion(
        v.x,
        v.y,
        this.shoot?.bullet ?? {},
        this.shoot?.pattern?.amount ?? 1,
        this.rotation + (this.shoot?.pattern?.offset ?? 0),
        this.shoot?.pattern?.spread ?? 0,
        this.shoot?.pattern?.spacing ?? 0,
        this.slot.entity.world,
        this.slot.entity,
        this,
      );
      this.parts.forEach((x) => x.fire && x.fire()); //Tick all parts
    }
  }
}

function patternedBulletExpulsion(
  x,
  y,
  bulletToSpawn,
  amount = 1,
  direction = 0,
  spread = 0,
  spacing = 0,
  world,
  entity,
  source,
) {
  //Derives most of its code from `Weapon.fire()`
  //universal mode: a c t i v a t e
  //Max difference in direction
  let diff = (spacing * (amount - 1)) / 2;
  //Current angle
  let currentAngle = -diff;
  //For each bullet to fire
  for (let index = 0; index < amount; index++) {
    /** @type {Bullet} */
    let bulletToFire = bullet(bulletToSpawn);
    //Put the bullet in position
    bulletToFire.pos = new Vector(x, y);
    bulletToFire.direction = direction; //do the offset
    //Apply uniform spread
    bulletToFire.direction += currentAngle;
    currentAngle += spacing;
    //Apply random spread
    bulletToFire.direction += random(spread, -spread);
    //Add entity and world
    bulletToFire.entity = entity;
    bulletToFire.world = world;
    bulletToFire.source = source;
    //Spawn it in
    world.bullets.push(bulletToFire);
  }
}
