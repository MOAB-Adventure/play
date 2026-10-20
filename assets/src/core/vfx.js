const effectTimer = new Timer();
const uiEffectTimer = new Timer();
//#### Actual Effect Classes ####
/**Sort of abstract class for visual effects. */
class VisualEffect {
  parentise = false;
  isUI = false;
  isBG = false;
  create(world, x = 0, y = 0, direction = 0, scale = 1) {}
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: 0, y: 0, direction: 0 })
  ) {
    if (this.parentise) {
      let p = pos();
      this.create(world, p.x, p.y, p.direction, scale);
    } else this.create(world, x, y, direction, scale);
  }
  getArray(world){
    return (this.isUI ? ui.particles : this.isBG ? world.bgparticles : world.particles)
  }
}
/**Extended class for repeated creation of a visual effect */
class EmissionEffect extends VisualEffect {
  emissions = 1;
  interval = 0;
  amount = 1;
  delay = 0;
  x = 0;
  maxXOffset = 0;
  y = 0;
  maxYOffset = 0;
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: x, y: y, direction: direction })
  ) {
    let fn = () =>
      this.create(
        world,
        x + rnd(this.maxXOffset, -this.maxXOffset),
        y + rnd(this.maxYOffset, -this.maxYOffset),
        direction,
        scale
      );
    if (this.parentise) {
      fn = () => {
        let p = pos();
        this.create(
          world,
          p.x + rnd(this.maxXOffset, -this.maxXOffset),
          p.y + rnd(this.maxYOffset, -this.maxYOffset),
          p.direction,
          scale
        );
      };
    }
    if (this.emissions > 1)
      (this.isUI ? uiEffectTimer : effectTimer).repeat(
        fn,
        this.emissions,
        this.interval,
        this.delay
      );
    else (this.isUI ? uiEffectTimer : effectTimer).do(fn, this.delay);
  }
}
/**A container for many effects at once. */
class MultiEffect extends VisualEffect {
  /**@type {VisualEffect[]} */
  effects = [];
  x = 0;
  y = 0;
  init() {
    this.effects = this.effects.map((x) => construct(x, VisualEffect));
  }
  execute(
    world,
    x = 0,
    y = 0,
    direction = 0,
    scale = 1,
    pos = () => ({ x: 0, y: 0, direction: 0 })
  ) {
    this.effects.forEach((z) => z.execute(world, x + this.x, y + this.y, direction, scale, pos));
  }
}

class ParticleEmissionEffect extends EmissionEffect {
  cone = 360;
  //Contains properties for image and text particles too
  particle = {
    //All
    lifetime: 60,
    direction: 0,
    speed: 1,
    decel: 0.015,
    rotateSpeed: 0,
    moveWithBackground: false,
    //Shape
    shape: "circle",
    reverse: false,
    //Shape/Image
    widthFrom: 20,
    widthTo: 30,
    heightFrom: 20,
    heightTo: 30,
    //Shape/Text/Wave
    colourFrom: col.from(50, 50, 50, 100),
    colourTo: col.from(100, 100, 100, 0),
    //Text
    text: "text",
    useOCR: true,
    sizeFrom: 20,
    sizeTo: 10,
    //Wave
    radiusFrom: 0,
    radiusTo: 100,
    strokeFrom: 10,
    strokeTo: 0,
  };
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    if(!game.effects) return;
    let reduced = game.effects < 1
    repeat(this.amount, () =>
      (!reduced || tru(game.effects)) && this.getArray(world).unshift(
        new ShapeParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) + rnd(-(this.cone ?? 360) / 2, (this.cone ?? 360) / 2)
            ),
          this.particle.lifetime ?? 60,
          (this.particle.speed ?? 1) * scale,
          this.particle.decel ?? 0.015,
          this.particle.shape ?? "circle",
          this.particle.colourFrom ?? col.from(50, 50, 50, 100),
          this.particle.colourTo ?? col.from(100, 100, 100, 0),
          (this.particle.widthFrom ?? 20) * scale,
          (this.particle.widthTo ?? 30) * scale,
          (this.particle.heightFrom ?? 20) * scale,
          (this.particle.heightTo ?? 30) * scale,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.moveWithBackground ?? false,
          this.particle.reverse ?? false
        )
      )
    );
  }
}

class TextParticleEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    repeat(this.amount, () =>
      this.getArray(world).push(
        new TextParticle(
          x + this.x,
          y + this.y,
          direction +
            radians(
              (this.particle.direction ?? 0) +
                rnd(-(this.particle.cone ?? 360) / 2, (this.particle.cone ?? 360) / 2)
            ),
          this.particle.lifetime ?? 60,
          (this.particle.speed ?? 1) * scale,
          this.particle.decel ?? 0.015,
          this.particle.text,
          this.particle.colourFrom ?? col.from(50, 50, 50, 100),
          this.particle.colourTo ?? col.from(100, 100, 100, 0),
          (this.particle.sizeFrom ?? 20) * scale,
          (this.particle.sizeTo ?? 30) * scale,
          radians(this.particle.rotateSpeed ?? 0),
          this.particle.moveWithBackground ?? false,
          this.particle.useOCR ?? true
        )
      )
    );
  }
}

class WaveEmissionEffect extends ParticleEmissionEffect {
  create(world, x = 0, y = 0, direction = 0, scale = 1) {
    if(!game.effects) return;
    let reduced = game.effects < 1
    repeat(this.amount, () =>
      (!reduced || tru(game.effects)) && this.getArray(world).push(
        new WaveParticle(
          x + this.x,
          y + this.y,
          this.particle.lifetime ?? 60,
          (this.particle.radiusFrom ?? 0) * scale,
          (this.particle.radiusTo ?? 100) * scale,
          this.particle.colourFrom ?? col.from(50, 50, 50, 100),
          this.particle.colourTo ?? col.from(100, 100, 100, 0),
          (this.particle.strokeFrom ?? 10) * scale,
          (this.particle.strokeTo ?? 0) * scale,
          this.particle.moveWithBackground ?? false
        )
      )
    );
  }
}

function repeat(n, func, ...params) {
  for (let i = 0; i < n; i++) func(i, ...params);
}

/**
 * Creates an effect, independently of any objects.
 * @param {string | Object} effect Registry name of the visual effect, or a constructible visual effect.
 * @param {World?} world If present, this is the world in which the effect will spawn. If not, then it's a UI effect.
 * @param {float} x X position of the effect's origin
 * @param {float} y Y position of the effect's origin
 * @param {float} direction Direction *in radians* of the effect. Only for directed effects, such as `ParticleEmissionEffect`
 * @param {float} scale Extra parameter to determine size of scalable effects
 * @param {() => {x: number, y: number, direction: number}} pos Function to get position for parentised effects.
 * @returns
 */
function createEffect(effect, world, x, y, direction, scale, pos) {
  if (effect === "none") return;
  /**@type {VisualEffect} */
  let fx = construct(typeof effect === "object" ? effect : Registry.vfx.get(effect), VisualEffect);
  if (!world) fx.isUI = true;
  fx.execute(world, x, y, direction, scale, pos);
  return fx;
}

function autoScaledEffect(effect, world, x, y, direction, pos) {
  let effectparts = effect.split("~");
  createEffect(effectparts[0], world, x, y, direction, effectparts[1] ?? 1, pos);
}

/**
 * @param {string} effect Registry name of effect to create. Use `effect~scale` to change scale.
 * @param {Entity | Bullet} source Object at which to spawn the effect.
 * @param {number} [offX=0] X offset
 * @param {number} [offY=0] Y offset
 */
function emitEffect(effect, source, offX = 0, offY = 0) {
  if (typeof effect === "string")
    autoScaledEffect(
      effect,
      source.world,
      source.x + offX,
      source.y + offY,
      source.directionRad,
      () => ({ x: source.x, y: source.y, direction: source.directionRad })
    );
  else
    createEffect(
      effect,
      source.world,
      source.x + offX,
      source.y + offY,
      source.directionRad,
      effect.scale,
      () => ({ x: source.x, y: source.y, direction: source.directionRad })
    );
}
