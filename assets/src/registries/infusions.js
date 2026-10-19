Registry.infusions.add("soul-summoner", {
  title: "Soul Summoner",
  levels: [
    {
      cost: 2,
      desc: "1% of bullets release a persistent soul which attaches to enemies and deals damage multiple times.",
      prereqs: [{ type: "prereq.meta.not", prereq: { type: "prereq.prop.exists", prop: "shoot.bullet.intervalBullet" } }],
      effects: [
        { type: "modifier.value.set", prop: "shoot.bullet.intervalTime", value: Infinity },
        { type: "modifier.value.set", prop: "shoot.bullet.intervalNumber", value: 1 },
        { type: "modifier.value.set", prop: "shoot.bullet.intervalSpread", value: 60 },
        {
          type: "modifier.value.set",
          prop: "shoot.bullet.intervalBullet",
          value: {
            type: "critical",
            critChance: 0.01,
            normalBullet: { speed: 0, lifetime: 0, drawer: { hidden: true } },
            critBullet: {
              type: "missile",
              targetType: "hovered",
              turnSpeed: 2,
              hitSize: 10,
              lifetime: 300,
              trail: true,
              trailColour: col.white,
              trailColourTo: col.from(128, 0, 255),
              trailType: "linear",
              trailLifeFactor: 1.15,
              drawer: { hidden: true },
              sticky: true,
              intervalBullet: { speed: 0, lifetime: 1, hitSize: 20, drawer: { hidden: true }, damage: [{ amount: 0, type: "soul", levelScaling: 1 }] },
              intervalNumber: 1,
              intervalTime: 15,
            },
          },
        },
      ],
    },
    {
      cost: 2,
      desc: "Chance increased by 30%.",
      prereqs: [
        { type: "prereq.prop.exists", prop: "shoot.bullet.intervalBullet" },
        { type: "prereq.value.equal", prop: "shoot.bullet.intervalBullet.sticky", value: true },
      ],
      effects: [{ type: "modifier.value.multiply", prop: "shoot.bullet.intervalBullet.critChance", value: 1.3 }],
    },
    {
      cost: 3,
      desc: "Souls damage 25% faster.",
      prereqs: [
        { type: "prereq.prop.exists", prop: "shoot.bullet.intervalBullet" },
        { type: "prereq.value.equal", prop: "shoot.bullet.intervalBullet.sticky", value: true },
      ],
      effects: [{ type: "modifier.value.multiply", prop: "shoot.bullet.intervalBullet.critBullet.intervalTime", value: 0.75 }],
    },
    {
      cost: 3,
      desc: "Souls' damage dealt increased by 50%.",
      prereqs: [
        { type: "prereq.prop.exists", prop: "shoot.bullet.intervalBullet" },
        { type: "prereq.value.equal", prop: "shoot.bullet.intervalBullet.sticky", value: true },
      ],
      effects: [{ type: "modifier.value.multiply", prop: "shoot.bullet.intervalBullet.critBullet.intervalBullet.damage.0.levelScaling", value: 1.5 }],
    },
    {
      cost: 4,
      desc: "Souls last longer for every enemy destroyed while attached.",
      prereqs: [
        { type: "prereq.prop.exists", prop: "shoot.bullet.intervalBullet" },
        { type: "prereq.value.equal", prop: "shoot.bullet.intervalBullet.sticky", value: true },
      ],
      effects: [{ type: "modifier.value.set", prop: "shoot.bullet.intervalBullet.critBullet.extraStickTime", value: 120 }],
    },
  ],
});

Registry.infusions.add("pain-train", {
  title: "Pain Train",
  prereqs: [{ type: "prereq.value.equal", prop: "type", value: "booster" }],
  levels: [
    {
      cost: 2,
      desc: "Boosters deal small amounts of damage to entities you run into.",
      effects: [
        {
          type: "modifier.value.set",
          prop: "trailBullet",
          value: {
            speed: 0,
            drawer: { hidden: true },
            lifetime: 1,
            hitSize: 100,
            pierce: 999999,
            hitNumber: 1,
            hitEntityOrigin: true,
            hitBullet: {
              hitSize: 10,
              speed: 0,
              drawer: { hidden: true },
              lifetime: 0,
              knockback: 50,
              damage: [{ amount: 0, levelScaling: 0.5, type: "impact", area: 10, visual: false }],
              createEffect: "soul-boost-impact",
            },
          },
        },
        { type: "modifier.prop.copy", prop: "boostPower", to: "trailBullet.hitSize" },
        { type: "modifier.prop.copy", prop: "boostPower", to: "trailBullet.hitBullet.knockback" },
        { type: "modifier.value.multiply", prop: "trailBullet.hitBullet.knockback", value: 2.5 },
        { type: "modifier.value.add", prop: "trailBullet.hitSize", value: 75 },
      ],
    },
    { desc: "Boosts also last 50% longer.", effects: [{ type: "modifier.value.multiply", prop: "boostDuration", value: 1.5 }] },
    {
      desc: "Impacts deal 50% more damage.",
      cost: 2,
      effects: [{ type: "modifier.value.multiply", prop: "trailBullet.fragBullet.hitBullet.damage.0.levelScaling", value: 1.5 }],
    },
    {
      desc: "Boosts last an additional 33% longer.",
      cost: 2,
      effects: [{ type: "modifier.value.multiply", prop: "boostDuration", value: 1.33333333333 }],
    },
    {
      desc: "Creates an additional burst if in contact with something when the boost ends.",
      cost: 3,
      effects: [
        {
          type: "modifier.value.set",
          prop: "burstBullet",
          value: {
            speed: 0,
            drawer: { hidden: true },
            lifetime: 1,
            hitSize: 100,
            pierce: 999999,
            hitNumber: 1,
            hitEntityOrigin: true,
            hitBullet: {
              hitSize: 10,
              speed: 0,
              drawer: { hidden: true },
              lifetime: 0,
              knockback: 50,
              damage: [
                {
                  amount: 0,
                  levelScaling: 5,
                  type: "impact",
                  area: 300,
                  sparkColour: -1,
                  sparkColourTo: [200, 0, 255, 255],
                  smokeColour: -1,
                  smokeColourTo: [128, 0, 255, 255],
                  waveColour: [200, 0, 255, 255],
                },
              ],
              createEffect: "soul-boost-burst",
            },
          },
        },
        { type: "modifier.prop.copy", prop: "boostPower", to: "burstBullet.hitSize" },
        { type: "modifier.prop.copy", prop: "boostPower", to: "burstBullet.hitBullet.knockback" },
        { type: "modifier.value.multiply", prop: "burstBullet.hitBullet.knockback", value: 5 },
        { type: "modifier.value.add", prop: "burstBullet.hitSize", value: 75 },
      ],
    },
  ],
});

// apply this one last, since it conflicts with many others due to modifying the structure of the bullet
Registry.infusions.add("tracer", {
  title: "Tracer",
  levels: [
    {
      desc: "Non-homing bullets have a 5% chance to leave a damaging purple trail",
      prereqs: [{ type: "prereq.value.equal.str-ci", prop: "shoot.bullet.type", value: "bullet" }],
      effects: [
        // Prepare normal bullet
        { type: "modifier.prop.nest", prop: "shoot.bullet", as: "normalBullet" },
        { type: "modifier.value.merge", prop: "shoot.bullet", value: { type: "critical", critChance: 0.05 } },
        // Create tracer
        { type: "modifier.prop.copy", prop: "shoot.bullet.normalBullet", to: "shoot.bullet.critBullet" },
        {
          type: "modifier.value.merge",
          prop: "shoot.bullet.critBullet",
          value: {
            trail: true,
            trailColour: col.white,
            trailColourTo: col.from(128, 0, 255),
            trailType: "linear",
            trailLifeFactor: 1.15,
            intervalNumber: 1,
            intervalTime: 1,
            intervalBullet: {
              type: "bullet",
              speed: 0,
              drawer: { hidden: true },
              damage: [{ type: "soul", amount: 0, levelScaling: 0.5, bossDamageMultiplier: 0.1 }],
              pierce: 99999999,
              multiHit: true,
            },
          },
        },
        { type: "modifier.prop.copy", prop: "shoot.bullet.critBullet.lifetime", to: "shoot.bullet.critBullet.intervalBullet.lifetime" },
        { type: "modifier.prop.copy", prop: "shoot.bullet.critBullet.hitSize", to: "shoot.bullet.critBullet.intervalBullet.hitSize" },
      ],
    },
    {
      desc: "Trails last 25% longer",
      effects: [
        { type: "modifier.value.multiply", prop: "shoot.bullet.critBullet.trailLifeFactor", value: 1.25 },
        { type: "modifier.value.multiply", prop: "shoot.bullet.critBullet.intervalBullet.lifetime", value: 1.25 },
      ],
    },
    {
      desc: "Trails deal 50% more damage per segment",
      cost: 2,
      effects: [{ type: "modifier.value.multiply", prop: "shoot.bullet.critBullet.intervalBullet.damage.0.levelScaling", value: 1.5 }],
    },
    {
      desc: "Trails last 50% longer",
      cost: 2,
      effects: [
        { type: "modifier.value.multiply", prop: "shoot.bullet.critBullet.trailLifeFactor", value: 1.5 },
        { type: "modifier.value.multiply", prop: "shoot.bullet.critBullet.intervalBullet.lifetime", value: 1.5 },
      ],
    },
    { desc: "Trail chance increased to 15%", cost: 3, effects: [{ type: "modifier.value.set", prop: "shoot.bullet.critChance", value: 0.15 }] },
  ],
});
