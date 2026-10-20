class ShapeParticle {
  _rotOffset;
  constructor(
    x,
    y,
    direction,
    lifetime,
    speed,
    decel,
    shape,
    colourFrom,
    colourTo,
    sizeXFrom,
    sizeXTo,
    sizeYFrom,
    sizeYTo,
    rotateSpeed,
    moveWithBackground = false,
    reverse = false
  ) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = speed;
    this.lifetime = lifetime;
    this.decel = decel;
    this.shape = shape;
    this.remove = false;
    this.colourFrom = col.convert(colourFrom);
    this.colourTo = col.convert(colourTo);
    this.colour = this.colourFrom;
    this.maxLifetime = lifetime;
    this.sizeXFrom = sizeXFrom;
    this.sizeXTo = sizeXTo;
    this.sizeX = sizeXFrom;
    this.sizeYFrom = sizeYFrom;
    this.sizeYTo = sizeYTo;
    this.sizeY = sizeYFrom;
    this.rotateSpeed = rotateSpeed;
    this._rotOffset = 0;
    this.moveWithBackground = moveWithBackground;
    if(reverse){
      let v = Vector.fromAngleRad(this.direction).scale(this.speed * this.lifetime)
      this.moveTo(
        this.x - v.x,
        this.y - v.y
      );
    }
  }
  step(dt) {
    const lf = this.calcLifeFract()
    if (this.lifetime >= dt) {
      //Interpolate size
      this.sizeX =
        this.sizeXFrom * lf +
        this.sizeXTo * (1 - lf);
      this.sizeY =
        this.sizeYFrom * lf +
        this.sizeYTo * (1 - lf);
        this.colour = col.in2rp(this.colourFrom, this.colourTo, 1-lf)
      //Move
      let v = Vector.fromAngleRad(this.direction).scale(this.speed * dt)
      this.moveTo(
        this.x + v.x,
        this.y + v.y
      );
      //Move with BG
      if (this.moveWithBackground) this.x -= game.player?.speed ?? 0;
      //Decelerate
      if (this.speed >= this.decel) {
        this.speed -= this.decel * dt;
      } else {
        this.speed = 0;
      }
      if (this.rotateSpeed) {
        this._rotOffset += this.rotateSpeed * dt;
      }
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
  draw() {
    push();
    noStroke();
    fill(255);
    //Interpolate colour
    col.fill(this.colour);
    //Draw the particle
    rotatedShape(
      this.shape,
      this.x,
      this.y,
      this.sizeX,
      this.sizeY,
      this.direction + this._rotOffset + HALF_PI
    );
    pop();
  }
}
