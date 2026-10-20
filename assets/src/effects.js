function splashDamageInstance(
  centreX = 0,
  centreY = 0,
  amount = 0,
  damageType = "explosion",
  damageRadius = 0,
  sourceEntity = null,
  showExplosion = true,
  sparkColour = col.from(255, 245, 215, 255), //The colour the sparks start at
  sparkColourTo = col.from(255, 215, 0, 55), //The colour the sparks go to
  smokeColour = col.from(100, 100, 100, 200), //The colour the smoke starts at
  smokeColourTo = col.from(100, 100, 100, 0), //The colour the smoke goes to
  waveColour = col.from(255, 128, 0, 0), //The colour the wave ends at. It always starts white.
  status = "none",
  statusDuration = 0,
  bossDamageMultiplier = 1,
) {
  //Most of these powers are just to make it less insane at high radii
  //They are tested repeatedly to make sure they look good
  let radius = damageRadius ** 1.05;
  if (showExplosion) {
    //Spawn smoke
    for (let i = 0; i < radius ** 0.6 * game.effects; i++) {
      world.particles.push(
        new ShapeParticle(
          centreX,
          centreY,
          radians(rnd(0, 360)),
          rnd(radius ** 0.65, radius ** 0.8 * 2),
          rnd(radius ** 0.25 * 0.3, radius ** 0.25 * 0.5),
          0.01,
          "circle",
          smokeColour,
          smokeColourTo,
          radius ** 0.85,
          0,
          radius ** 0.85,
          0,
          0,
          true,
        ),
      );
    }
    //Yellow sparks
    for (let i = 0; i < radius ** 0.7 * game.effects; i++) {
      world.particles.push(
        new ShapeParticle(
          centreX,
          centreY,
          radians(rnd(0, 360)),
          rnd(radius ** 0.75, radius ** 0.75 * 1.5),
          rnd(radius ** 0.25 * 0.1, radius ** 0.25 * 2),
          0.075,
          "rect",
          sparkColour,
          sparkColourTo,
          radius ** 0.5,
          0,
          radius ** 0.75,
          radius ** 0.5,
          0,
          true,
        ),
      );
    }
    world.particles.push(
      new WaveParticle(
        centreX,
        centreY,
        30,
        0,
        damageRadius,
        col.white,
        waveColour,
        radius ** 0.75,
        0,
        true,
      ),
    );
  }
  for (let e of world.entities) {
    if (
      e.collides &&
      e.team !== sourceEntity.team &&
      ((centreX - e.x) ** 2 + (centreY - e.y) ** 2) ** 0.5 <= damageRadius + e.hitSize
    ) {
      e.damage(
        damageType,
        amount * (e instanceof Boss && !e.isMinion ? bossDamageMultiplier : 1),
        sourceEntity,
      );
      if (status !== "none") e.applyStatus(status, statusDuration);
    }
  }
}
function blindingFlash(x = 0, y = 0, opacity = 255, duration = 60, glareSize = 600) {
  if (!game.flashing) return;
  world.particles.push(
    //Obscure screen
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      30,
      0,
      0,
      "ellipse",
      col.withA(col.white, opacity),
      col.withA(col.white, 0),
      0,
      1920 * 3,
      0,
      1080 * 3,
      0,
      true,
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      90,
      0,
      0,
      "ellipse",
      col.withA(col.white, opacity),
      col.withA(col.white, 0),
      0,
      1920 * 5,
      0,
      1080 * 5,
      0,
      true,
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      120,
      0,
      0,
      "ellipse",
      col.withA(col.white, opacity),
      col.withA(col.white, 0),
      0,
      1920 * 8,
      0,
      1080 * 8,
      0,
      true,
    ),
    new ShapeParticle(
      960,
      540,
      HALF_PI,
      duration,
      0,
      0,
      "rect",
      col.withA(col.white, opacity),
      col.withA(col.white, 0),
      1920,
      1920,
      1080,
      1080,
      0,
      false,
    ),
    //Glare effect
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 0.5,
      0,
      0,
      "rhombus",
      col.withA(col.white, 150),
      col.withA(col.white, 0),
      glareSize / 3,
      glareSize * 2,
      glareSize / 5,
      0,
      0,
      true,
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration,
      0,
      0,
      "rhombus",
      col.withA(col.white, 200),
      col.withA(col.white, 0),
      glareSize / 6,
      glareSize * 1.5,
      (glareSize / 5) * 0.6,
      0,
      0,
      true,
    ),
    new ShapeParticle(
      x,
      y,
      HALF_PI,
      duration * 1.5,
      0,
      0,
      "rhombus",
      col.white,
      col.withA(col.white, 0),
      glareSize / 9,
      glareSize,
      (glareSize / 5) * 0.3,
      0,
      0,
      true,
    ),
  );
}
function worldTransitionEffect(worldName, duration = 120) {
  //Create main effect
  world.particles.push(
    new ShapeParticle(
      960,
      540,
      0,
      duration,
      0,
      0,
      "rect",
      col.white,
      col.white ^ 0xff,
      1080,
      1080,
      1920,
      1920,
      0,
      false,
    ),
    new TextParticle(
      960,
      540,
      0,
      duration,
      0,
      0,
      worldName,
      col.black,
      col.transparent,
      100,
      100,
      0,
      false,
      false,
    ),
  );
  if (world.endless)
    effectTimer.repeat(
      () =>
        world.particles.push(
          new LightningParticle(
            new Vector(200, 540).multiLerp(new Vector(1720, 540), 100),
            10,
            [col.black],
            0,
            10,
            0,
            40,
            2,
            2,
          ),
        ),
      duration / 5,
      5,
    );
}
function notifyEffect(text, duration = 120) {
  push();
  textFont(fonts.ocr);
  textSize(30);
  let lines = text.split("\n");
  //Create main effect for each line
  lines.forEach((ln, i) => {
    world.particles.push(
      new ShapeParticle(
        960,
        130 + 40 * i,
        0,
        duration,
        0,
        0,
        "rect",
        col.mono(100),
        col.withA(col.mono(100), 0),
        40,
        40,
        textWidth(ln) + 60,
        textWidth(ln) + 60,
        0,
        false,
      ),
      new TextParticle(
        960,
        125 + 40 * i,
        0,
        duration,
        0,
        0,
        ln,
        col.black,
        col.withA(col.black, 0),
        30,
        30,
        0,
        false,
        true,
      ),
    );
  });
  pop();
}
