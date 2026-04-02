class Bullet {
  pos = Vector.ZERO;
  get x() {
    return this.pos.x;
  }
  get y() {
    return this.pos.y;
  }
  direction = 0;
  /**@type {{amount:number,type:string,area:number}[]} */
  damage = [];
  speed = 20;
  lifetime = 60;
  hitSize = 5;
  trail = true;
  trailColour = [255, 255, 255, 200];
  trailColourTo = null;
  trailLifeFactor = 0.75;
  trailShape = "rhombus";
  trailWidth = -1;
  trailDev = 3;
  /** @type {"dotted"|"linear"|"lightning"} */
  trailType = "dotted";
  remove = false;
  collides = true;
  pierce = 0;
  rotateSpeed = 0;
  drawer = { hidden: false, shape: "circle", fill: "red", image: "error", width: 10, height: 10 };
  updates = 1;
  movements = 1;
  /** @type {World?} */
  world = null;
  /** @type {Entity?} */
  entity = null;
  knockback = 0;
  kineticKnockback = false;
  controlledKnockback = false;
  //pierce type params
  multiHit = false;
  damaged = [];
  //internal trail stuff
  _trailCounter = 20;
  trailInterval = -1;
  //Statuseseseseses
  status = "none";
  statusDuration = 0;
  //Frags
  fragBullet = {};
  fragNumber = 0;
  fragDirection = 0;
  fragSpread = 0;
  fragSpacing = 0;
  fragOffset = 0;
  //Intervals
  intervalBullet = {};
  intervalNumber = 0;
  intervalDirection = 0;
  intervalSpread = 0;
  intervalSpacing = 0;
  intervalTime = 0;
  intervalOffset = 0;
  #intervalCounter = 0;
  //Following
  source = null;
  followsScreen = false;
  //This may be OP
  maxHPReductionFactor = 0;
  //On hit bullets
  hitBullet = {};
  hitNumber = 0;
  hitDirection = 0;
  hitSpread = 0;
  hitSpacing = 0;
  //On destroy bullets
  destroyBullet = {};
  destroyNumber = 0;
  destroyDirection = 0;
  destroySpread = 0;
  destroySpacing = 0;

  // sticky...
  sticky = false;
  extraStickTime = 240;
  persistAfterUnstick = true;
  _stuckTo = null;
  _stuckOffset = Vector.ZERO;

  //Sounds
  silent = false;
  hitSound = null;
  despawnSound = null;
  spawnSound = null;
  #sounded = false;

  createEffect = "none";
  inited = false;

  prev = null;
  bounceable = true;
  //Main stuff
  get directionRad() {
    return (this.direction / 180) * Math.PI;
  }
  init() {
    this.maxLife = this.lifetime;
    this.maxPierce = this.pierce;
    this.trailColourTo ??= this.trailColour;
    if (this.trailInterval === -1) this.trailInterval = this.hitSize * 4;
    if (this.trailWidth === -1) this.trailWidth = this.hitSize;
  }
  sound() {
    if (!this.#sounded) {
      SoundCTX.play(this.spawnSound);
      this.#sounded = true;
    }
  }
  moveToAnchors() {
    if (this._stuckTo) {
      if (this._stuckTo.dead) {
        this._stuckTo = null;
        // life retract
        if (!this.persistAfterUnstick) this.remove = true;
      } else
        this.pos = new Vector(this._stuckTo.x, this._stuckTo.y).add(
          this._stuckOffset.rotate(this._stuckTo.direction),
        );
    }
    this.moveToSrc();
  }
  moveToSrc() {
    if (this.followsSource && this.source) {
      this.pos = new Vector(this.source.x, this.source.y);
      if (this.source instanceof Weapon)
        this.pos = this.pos.add(new DirectionVector(this.source.rotation, this.source.shootX));
      this.direction = this.source.rotation;
    }
  }
  step(dt) {
    if (this.prev) this.spawnTrail(dt);
    this.prev = this.pos.clone();
    this.sound();
    //Not if dead
    if (!this.remove)
      repeat(this.movements, () => {
        this.moveToAnchors();
        if (!this.inited) {
          this.inited = true;
          createEffect(this.createEffect, this.world, this.x, this.y, this.directionRad);
        }

        this.intervalTick();
        if (!this._stuckTo) {
          //Which way to move
          let moveVector = new DirectionVector(this.direction);
          //Scale to speed
          moveVector = moveVector.scale(this.speed * dt);
          //Move
          this.pos = this.pos.add(moveVector);
          this.direction += this.rotateSpeed;
        }
        //Tick lifetime
        if (this.lifetime <= 0) {
          this.remove = true;
        } else {
          this.lifetime -= dt;
        }
        //Follow
        if (this.followsScreen) this.pos = this.pos.subXY(game.player?.speed ?? 0, 0);
        this.checkEntities();
      });
  }
  spawnTrail(dt) {
    if (!game.effects) return;
    let reduced = game.effects < 1;
    if (this.trailType === "dotted") {
      //This got too long
      for (let e = 0; e < this.speed * dt; e++) {
        if (reduced && !tru(game.effects)) continue;
        if (this._trailCounter <= 0) {
          if (this.world?.particles != null && this.trail) {
            let v = new DirectionVector(this.direction, e);
            this.world.particles.push(
              new ShapeParticle(
                this.x - v.x,
                this.y - v.y,
                this.directionRad,
                this.getTrailLife(),
                0,
                0,
                this.trailShape,
                this.trailColour,
                this.trailColourTo,
                this.trailWidth * 1.9,
                0,
                this.hitSize * this.trailInterval * 0.25,
                this.hitSize * this.trailInterval * 0.25,
                0,
                this.followsScreen,
              ),
            );
          }
          this._trailCounter = this.trailInterval;
        } else {
          this._trailCounter--;
        }
      }
    } else if (this.trailType === "bilinear") {
      if (!reduced || tru(game.effects)) {
        this.world.bgparticles.push(
          new LinearParticle(
            [this.prev, this.pos],
            this.getTrailLife(),
            [this.trailColourTo],
            0,
            this.trailWidth * 1.9,
            0,
          ),
        );
        this.world.particles.push(
          new LinearParticle(
            [this.prev, this.pos],
            this.getTrailLife(),
            [this.trailColour],
            0,
            this.trailWidth,
            0,
          ),
        );
      }
    } else if (this.trailType === "linear") {
      if (!reduced || tru(game.effects))
        this.world.particles.push(
          new LinearParticle(
            [this.prev, this.pos],
            this.getTrailLife(),
            [this.trailColour, this.trailColourTo],
            0,
            this.trailWidth * 1.9,
            0,
          ),
        );
    } else if (this.trailType === "lightning") {
      if (!reduced || tru(game.effects))
        this.world.particles.push(
          new LightningParticle(
            this.pos.multiLerp(this.prev, Math.ceil((this.speed / this.trailInterval) * 5)),
            this.getTrailLife(),
            [this.trailColour, this.trailColourTo],
            0,
            this.trailWidth,
            0,
            this.trailDev,
            2,
            2,
          ),
        );
    } else if (Registry.vfx.has(this.trailType))
      for (let e = 0; e < this.speed * dt; e++) {
        if (reduced && !tru(game.effects)) continue;
        if (this._trailCounter <= 0) {
          if (this.world?.particles != null && this.trail) {
            let v = new DirectionVector(this.direction, e);
            autoScaledEffect(
              this.trailType,
              this.world,
              this.x - v.x,
              this.y - v.y,
              this.direction,
            );
          }
          this._trailCounter = this.trailInterval;
        } else {
          this._trailCounter--;
        }
      }
  }
  getTrailLife() {
    return this.maxLife * this.trailLifeFactor;
  }
  draw() {
    if (this.drawer.hidden) return;
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
      fill(this.drawer.fill);
      rotatedShape(
        this.drawer.shape,
        this.x,
        this.y,
        this.drawer.width,
        this.drawer.height,
        this.directionRad,
      );
    }
  }
  distanceTo(x, y) {
    return this.pos.distanceToXY(x, y);
  }
  collidesWith(obj) {
    return this.distanceTo(obj.x, obj.y) <= this.hitSize + obj.hitSize;
  }
  frag() {
    let v = new Vector(this.x, this.y).add(Vector.fromAngle(this.direction).scale(this.fragOffset));
    patternedBulletExpulsion(
      v.x,
      v.y,
      this.fragBullet,
      this.fragNumber,
      this.direction + this.fragDirection,
      this.fragSpread,
      this.fragSpacing,
      this.world,
      this.entity,
      this.source,
    );
  }
  interval() {
    let v = new Vector(this.x, this.y).add(
      Vector.fromAngle(this.direction).scale(this.intervalOffset),
    );
    patternedBulletExpulsion(
      v.x,
      v.y,
      this.intervalBullet,
      this.intervalNumber,
      this.direction + this.intervalDirection,
      this.intervalSpread,
      this.intervalSpacing,
      this.world,
      this.entity,
      this.source,
    );
  }
  intervalTick() {
    if (this.#intervalCounter <= 0) {
      this.interval();
      this.#intervalCounter = this.intervalTime;
    } else {
      this.#intervalCounter--;
    }
  }
  //On top of damage
  onHit(entity) {
    //Always spawn hit bullets
    patternedBulletExpulsion(
      this.x,
      this.y,
      this.hitBullet,
      this.hitNumber,
      this.direction + this.hitDirection,
      this.hitSpread,
      this.hitSpacing,
      this.world,
      this.entity,
      this.source,
    );
    //If dead, spawn destroy bullets
    if (entity.dead) {
      patternedBulletExpulsion(
        this.x,
        this.y,
        this.destroyBullet,
        this.destroyNumber,
        this.direction + this.destroyDirection,
        this.destroySpread,
        this.destroySpacing,
        this.world,
        this.entity,
        this.source,
      );
    }
  }

  checkEntities() {
    if (this._stuckTo) return;
    for (let entity of this.world.entities) {
      //If colliding with a this on different team, that it hasn't already been hit by and that still exists
      if (
        this.collides &&
        entity.collides &&
        !this.remove &&
        entity.team !== this.entity.team &&
        !this.damaged.includes(entity)
      ) {
        let c = this.collidesWith(entity); //check collisions last for performance reasons
        if (c) {
          //Take all damage instances
          for (let instance of this.damage) {
            if (!instance.area)
              entity.damage(
                instance.type,
                (instance.amount +
                  (instance.dvRatio && this.entity ? instance.dvRatio * this.entity.dv : 0) +
                  (instance.levelScaling ?? 0) * game.level) *
                  //If boss, multiply damage by boss damage multiplier, if present, or else 1. If not boss, multiply by 1.
                  (entity instanceof Boss ? (instance.bossDamageMultiplier ?? 1) : 1),
                this.entity,
              ); //Wait if kaboom
            entity.maxHealth -= instance.amount * this.maxHPReductionFactor;
          }
          if (this.controlledKnockback) {
            //Get direction to the target
            let direction = this.pos.sub(this.entity.target).angleRad;
            entity.knock(this.knockback, direction, this.kineticKnockback); //Knock with default resolution
          } else if (this.knockback) {
            entity.knock(this.knockback, this.direction, this.kineticKnockback); //Knock with default resolution
          }
          if (this.status !== "none") {
            entity.applyStatus(this.status, this.statusDuration);
          }

          //Make the this know
          // english 100
          this.damaged.push(entity);
          this.onHit(entity);
          if (!this.silent) {
            SoundCTX.play(
              this.damage.some((d) => entity.immuneTo(d.type)) ?
                (entity.deflectSound ?? entity.hitSound)
              : entity.hitSound,
            );
            SoundCTX.play(this.hitSound);
          }
          //Reduce pierce
          this.pierce--;
          //If exhausted
          if (this.pierce < 0) {
            if (this instanceof LaserBullet) {
              this.canHurt = false;
              this.length = c;
            } else this.hitExpire(entity); //Delete
          }
        }
      } else {
        if (!this.remove && entity.team !== this.entity.team && this.damaged.includes(entity)) {
          if (this.multiHit && !this.collidesWith(entity)) {
            //Unpierce it
            this.damaged.splice(this.damaged.indexOf(entity), 1);
          }
        }
      }
    }
    for (let bullet of this.world.bullets) {
      //If colliding with a this on different team, that it hasn't already been hit by and that still exists
      if (
        this.collides &&
        !this.remove &&
        bullet instanceof Deflection &&
        this.bounceable && // don't deflect deflections
        bullet.entity.team !== this.entity.team &&
        bullet.collidesWith(this) //check collisions last for performance reasons
      ) {
        bullet.bulbonk(this);
        if (!bullet.silent) {
          if (!bullet.damaged.includes(this)) SoundCTX.play(this.hitSound);
          SoundCTX.play(bullet.hitSound);
        }
        bullet.damaged.push(bullet);
      }
    }
  }
  hitExpire(finalHit) {
    if (this.sticky) {
      this._stuckTo = finalHit;
      // connect
      this._stuckOffset = this.pos.subXY(finalHit.x, finalHit.y).rotate(-finalHit.direction);

      // life extend
      if (this.extraStickTime) {
        this.lifetime += this.extraStickTime;
      }
    } else this.remove = true;
  }
}

function telegraph(bullet, opts = { time: 20, width: 2 }) {
  let ob = structuredClone(bullet);
  delete ob.telegraph;
  return {
    type: "telegraph",
    hitSize: opts.width ?? bullet.hitSize / 2,
    lifetime: opts.time ?? bullet.lifetime,
    fragNumber: 1,
    followsSource: bullet.followsSource,
    followsScreen: bullet.followsScreen,
    fragBullet: ob,
    createEffect: opts.createEffect ?? "none",
  };
}
