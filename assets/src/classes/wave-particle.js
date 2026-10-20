class WaveParticle {
  constructor(
    x,
    y,
    lifetime,
    fromRadius,
    toRadius,
    colourFrom,
    colourTo,
    strokeFrom,
    strokeTo,
    moveWithBackground = false,
  ) {
    this.x = x;
    this.y = y;
    this.lifetime = lifetime;
    this.fromRadius = fromRadius;
    this.toRadius = toRadius;
    this.radius = fromRadius;
    this.remove = false;
    this.colourFrom = col.convert(colourFrom);
    this.colourTo = col.convert(colourTo);
    this.color = this.colourFrom;
    this.maxLifetime = lifetime;
    this.strokeFrom = strokeFrom;
    this.strokeTo = strokeTo;
    this.stroke = this.strokeFrom;
    this.moveWithBackground = moveWithBackground;
  }
  step(dt) {
    if (this.lifetime >= dt) {
      const lf = this.calcLifeFract();
      this.radius = this.fromRadius * lf + this.toRadius * (1 - lf);
      this.stroke = this.strokeFrom * lf + this.strokeTo * (1 - lf);
      this.color = col.in2rp(this.colourFrom, this.colourTo, 1 - lf);
      //Move with BG
      if (this.moveWithBackground) this.x -= game.player.speed;
      this.lifetime -= dt;
    } else {
      this.remove = true;
    }
  }
  calcLifeFract() {
    return this.lifetime / this.maxLifetime;
  }
  draw() {
    push();
    noFill();
    col.stroke(this.color);
    strokeWeight(this.stroke);
    circle(this.x, this.y, this.radius * 2);
    pop();
  }
}
