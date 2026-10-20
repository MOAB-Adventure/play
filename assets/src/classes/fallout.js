//Fallout
class RadiationZone extends Bullet {
  damagePerTick = 0;
  damageRange = 200;
  damageType = "radiation";
  status = "irradiated";
  statusDuration = 400;
  colour = col.from(50, 255, 0, 50);
  #timer = 0;
  #outlineColour = 0;
  checkEntities(){} //Collides with nothing, also makes these surprisingly performant
  init() {
    //No movement here
    this.speed = 0;
    this.#outlineColour = col.addA(this.colour, 50);
    super.init()
  }
  draw() {
    push();
    col.fill(this.colour);
    col.stroke(this.#outlineColour);
    strokeWeight(5);
    circle(this.x, this.y, this.damageRange * 2);
    pop();
  }
  step(dt) {
    //Move with background
    this.pos = this.pos.subXY(game.player.speed, 0);
    if (this.#timer >= 20) {
      this.#timer = 0;
      //Inflict radiation damage
      splashDamageInstance(
        this.x,
        this.y,
        this.damagePerTick,
        this.damageType,
        this.damageRange,
        this.entity,
        false,
        null,
        null,
        null,
        null,
        null,
        this.status,
        this.statusDuration
      );
      this.world.particles.push(
        new WaveParticle(
          this.x,
          this.y,
          20,
          0,
          this.damageRange,
          this.#outlineColour,
          this.#outlineColour,
          20,
          0,
          true
        )
      );
    } else {
      this.#timer++;
    }
    //Despawn if fully offscreen
    if(this.x < -this.damageRange) this.remove = true;
  }
}
