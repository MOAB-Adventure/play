// Bullet which is pulled back to the weapon that fired it.
// Requires a weapon context, or else it won't move.
// Draws a chain because it's cool
class ChainedBullet extends Bullet {
  chainImage = "error";

  chainSegmentColour = null;
  chainSegmentOutline = null;
  chainSegmentWeight = 1;
  chainShape = "rect";

  chainSegmentSize = 32;
  chainWidth = 8;
  drawChain = true;

  pullSpeed = 0;
  pullAccel = 0.1;

  bounceOffEnemies = false;
  restitution = 0.6;
  collideOnReturn = true;

  despawnOnSource = true;
  accelOnSource = false;
  #willAccel = false;
  resetCooldownOnReturn = false;
  returnStatus = "none";
  returnStatusDuration = 1;
  #willDespawn = false;

  //Spawn this when it comes back
  returnBullet = {};
  returnNumber = 0;
  returnDirection = 0;
  returnSpread = 0;
  returnSpacing = 0;

  #psp = 0;
  fragDisabled = false;
  init() {
    super.init();
    this.#psp = this.pullSpeed;
  }
  onHit(ent) {
    super.onHit(ent);
    if (this.bounceOffEnemies) {
      [this.#psp, this.speed] = [this.speed * this.restitution, this.#psp * this.restitution];
      this.collides = this.collideOnReturn;
    }
  }
  step(dt) {
    super.step(dt);
    this.#psp += this.pullAccel;
    let chainedToPos = Vector.ZERO;
    if (this.source) {
      chainedToPos = new Vector(this.source.x, this.source.y);
    } else if (this.entity) {
      chainedToPos = new Vector(this.entity.x, this.entity.y);
    }

    let pullvec = this.pos
      .sub(chainedToPos)
      .normalise()
      .scale(this.#psp * dt);
    if (this._stuckTo) this._stuckTo.pos = this._stuckTo.pos.sub(pullvec);
    else this.pos = this.pos.sub(pullvec);

    if (this.accelOnSource) {
      let d = this.distanceTo(chainedToPos.x, chainedToPos.y);
      if (!this.#willAccel && d > this.hitSize + this.#psp) {
        this.#willAccel = true;
      } else if (this.#willAccel && d <= this.hitSize + this.#psp) {
        this.direction = pullvec
          .normalise()
          .scale(this.#psp)
          .sub(Vector.fromAngle(this.direction).scale(this.speed)).angle;
        this.#psp = 0;
        this.pos = this.pos.add(pullvec);
      }
    }
    if (this.despawnOnSource) {
      let d = this.distanceTo(chainedToPos.x, chainedToPos.y);
      if (!this.#willDespawn && d > this.hitSize + this.#psp) {
        this.#willDespawn = true;
      } else if (this.#willDespawn && d <= this.hitSize + this.#psp) {
        this.remove = true;
        this.fragDisabled = true;
        if (this.resetCooldownOnReturn && this.source?.resetCD) {
          this.source.resetCD();
        }
        patternedBulletExpulsion(
          this.x,
          this.y,
          this.returnBullet,
          this.returnDirection,
          this.direction + this.returnDirection,
          this.returnSpread,
          this.returnSpacing,
          this.world,
          this.entity,
          this.source,
        );
        if (this.entity && this.returnStatus !== "none")
          this.entity.applyStatus(this.returnStatus, this.returnStatusDuration);
      }
    }
  }
  draw() {
    if (this.drawChain && this.source) {
      let segments = Math.min(this.distanceTo(this.source.x, this.source.y) / this.chainSegmentSize, 200);
      let directionToSource = this.pos.subXY(this.source.x, this.source.y).angleRad;
      for (let seg = 0; seg <= segments; seg++) {
        let pos = this.pos.sub(
          new DirectionVector(directionToSource, this.chainSegmentSize * seg, true),
        );
        if (this.chainSegmentColour) {
          push();
          fill(this.chainSegmentColour);
          strokeWeight(this.chainSegmentWeight);
          stroke(this.chainSegmentOutline ?? "black");
          rotatedShape(
            this.chainShape,
            pos.x,
            pos.y,
            this.chainSegmentSize,
            this.chainWidth,
            directionToSource,
          );
          pop();
        } else
          ImageCTX.draw(
            this.chainImage,
            pos.x,
            pos.y,
            this.chainSegmentSize,
            this.chainWidth,
            directionToSource,
          );
      }
    }
    super.draw();
  }
}
