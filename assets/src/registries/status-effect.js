Registry.statuses.add(
  "inferno",
  construct({
    type: "status-effect",
    damage: 10,
    damageType: "fire",
    vfx: "fire",
    vfxChance: 1,
  })
);
Registry.statuses.add(
  "sublimating",
  construct({
    type: "status-effect",
    damage: 12.5,
    damageType: "plasma",
    vfx: "sublimating",
    vfxChance: 1,
  })
);
Registry.statuses.add(
  "thermite",
  construct({
    type: "status-effect",
    damage: 7.5,
    damageType: "fire",
    vfx: "thermite",
    vfxChance: 1,
  })
);
Registry.statuses.add(
  "blazing",
  construct({
    type: "status-effect",
    damage: 3,
    damageType: "fire",
    vfx: "fire",
    vfxChance: 1,
  })
);
Registry.statuses.add(
  "burning",
  construct({
    type: "status-effect",
    damage: 0.5,
    damageType: "fire",
    vfx: "fire",
    vfxChance: 1,
  })
);
Registry.statuses.add(
  "drignited",
  construct({
    type: "status-effect",
    damage: 0.6,
    damageType: "fire",
    vfx: "dragon-fire",
    vfxChance: 0.5,
  })
);
Registry.statuses.add(
  "ignited",
  construct({
    type: "status-effect",
    damage: 0.15,
    damageType: "fire",
    vfx: "fire",
    vfxChance: 0.3,
  })
);
Registry.statuses.add(
  "freezing",
  construct({
    type: "status-effect",
    speedMult: 0.75,
    healthMult: 0.85,
    damageMult: 0.9,
    resistanceMult: 0.6,
    vfx: "ice",
  })
);
Registry.statuses.add(
  "cold",
  construct({
    type: "status-effect",
    speedMult: 0.85,
    healthMult: 0.9,
    resistanceMult: 0.8,
    vfx: "ice",
    vfxChance: 0.5,
  })
);
Registry.statuses.add(
  "irradiated",
  construct({
    type: "status-effect",
    speedMult: 0.75,
    healthMult: 0.75,
    damageMult: 0.75,
    resistanceMult: 0.75,
    vfx: "radiation",
  })
);

Registry.statuses.add(
  "red-polarity",
  construct({
    type: "status-effect",
    speedMult: 0.85,
    healthMult: 0.85,
    damageMult: 1.2,
    vfx: "red-polarity",
    vfxChance: 0.7,
  })
);
Registry.statuses.add(
  "blue-polarity",
  construct({
    type: "status-effect",
    speedMult: 1.3,
    healthMult: 1.3,
    vfx: "blue-polarity",
    vfxChance: 0.7,
    healing: 0.5
  })
);


Registry.statuses.add(
  "nano-heal",
  construct({
    type: "status-effect",
    healing: 2
  })
);