class LaserBullet extends Bullet {
  //Length of the beam. Replaces speed.
  length = 0;
  #lengthFraction = 0; //Fraction of length the beam is currently at.
  #widthFraction = 1;
  extendTime = -1; //Time taken to get to full length
  despawnTime = -1; //Time taken to disappear fully
  canHurt = true; //Can this laser hurt things?
  followsSource = false;
  /** @type {Weapon} */
  source = null;
  #dirInited = false;
  bounceable = false;
  init() {
    super.init();
    if (this.extendTime === -1) this.extendTime = this.maxLife * 0.2;
    if (this.despawnTime === -1) this.despawnTime = this.maxLife * 0.4;
  }
  moveToSrc() {
    if (this.followsSource && this.source) {
      if (!this.#dirInited) {
        this.#dirInited = true;
        this.oldDir = this.direction - this.source.rotation;
      }
      this.pos = new Vector(this.source.x, this.source.y);
      if (this.source instanceof Weapon)
        this.pos = this.pos.add(new DirectionVector(this.source.rotation, this.source.shootX));

      this.direction = this.source.rotation + this.oldDir;
    }
  }
  step(dt) {
    //Not if dead
    if (!this.remove) {
      this.sound();
      this.moveToAnchors();
      this.intervalTick();
      if (this.lifetime >= this.maxLife - this.extendTime && this.canHurt) {
        //If spawning
        this.#lengthFraction += dt / this.extendTime; //Slowly turn to one
      }
      if (this.lifetime <= this.despawnTime) {
        //If despawning
        this.#widthFraction -= dt / this.despawnTime; //Slowly turn to zero
      }
      this.direction += this.rotateSpeed;
      // Don't move
      //Tick lifetime
      if (this.lifetime <= 0) {
        this.remove = true;
      } else {
        this.lifetime -= dt;
      }
      //Follow
      if (this.followsScreen) this.pos = this.pos.subXY(game.player?.speed ?? 0, 0);
      this.checkEntities();
    }
  }
  draw() {
    push();
    //Width is useless, as it is replaced by length, and height is useless as it is replaced by hitsize
    let drawnLength = this.length * this.#lengthFraction;
    let drawnWidth = this.hitSize * 2 * this.#widthFraction;
    //Trigonometry to find offset x and y
    let offset = {
      x: (Math.cos(this.directionRad) * drawnLength) / 2,
      y: (Math.sin(this.directionRad) * drawnLength) / 2,
    };
    if (this.drawer.image) {
      ImageCTX.draw(
        this.drawer.image,
        this.x + offset.x, //Sort of centre the laser
        this.y + offset.y,
        drawnLength,
        drawnWidth,
        this.directionRad,
      );
    } else {
      //Get that laser-y look
      stroke(this.drawer.fill);
      fill(255);
      strokeWeight(Math.max(2, drawnWidth / 3));
      rotatedShape(
        this.drawer.shape,
        this.x + offset.x,
        this.y + offset.y,
        drawnLength,
        drawnWidth < 6 ? drawnWidth / 2 : drawnWidth,
        this.directionRad,
      );
      pop();
    }
  }
  collidesWith(obj) {
    let currentLength = this.length * this.#lengthFraction;
    let currentHitSize = this.hitSize * this.#widthFraction;
    if (!this.canHurt) return false;
    if (currentHitSize <= 0.01 || currentLength > 5000) return false; //Catch problem where hitsize = 0 causes infinite loop, and also performance stuff
    if (currentHitSize < 1) currentHitSize = 1;
    let offset = new DirectionVector(this.direction);
    //Try every hitsize px along current length
    for (let factor = 0; factor < currentLength; factor += currentHitSize) {
      //Return true if hitting the object
      if (
        dist(
          this.x + offset.x * factor, //Resolve and multiply
          this.y + offset.y * factor, //Resolve and multiply part 2
          obj.x,
          obj.y,
        ) <=
        currentHitSize + obj.hitSize
      ) {
        return factor;
      }
    }
    //If every check failed, return false
    return false;
  }
  //On top of damage
  onHit(entity) {
    //Always spawn hit bullets
    patternedBulletExpulsion(
      entity.x,
      entity.y,
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
        entity.x,
        entity.y,
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
}
