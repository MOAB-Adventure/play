Registry.blimps.add("moab", {
  name: "MOAB",
  health: 200,
  speed: 8,
  weaponSlots: [1],
  hasBooster: true,
  boosterPos: { x: -100, y: 0 },
  drawer: {
    image: "blimp.moab",
    width: 230,
    height: 150,
  },
  path1: "bfb",
  path2: "ddt",
});
Registry.blimps.add("bfb", {
  name: "BFB",
  description: "Larger but slower blimp, capable of carrying an second weapon.",
  health: 700,
  speed: 6,
  weaponSlots: [1, 2],
  hasBooster: true,
  positions: [
    { x: 50, y: 0 },
    { x: -100, y: 0 },
  ],
  boosterPos: { x: -120, y: 0 },
  drawer: {
    image: "blimp.bfb",
    width: 310,
    height: 220,
  },
  hitSize: 110,
  cost: {
    shards: 2500,
    bloonstones: 0,
  },
  path1: "zomg",
});
Registry.blimps.add("zomg", {
  name: "ZOMG",
  description: "Even bigger blimp. Slow, but has 3 weapon slots.",
  health: 4000,
  speed: 3,
  weaponSlots: [1, 2, 3],
  hasBooster: true,
  positions: [
    { x: 50, y: 0 },
    { x: -100, y: 0 },
    { x: 0, y: 0 },
  ],
  boosterPos: { x: -120, y: 0 },
  drawer: {
    image: "blimp.zomg",
    width: 310,
    height: 220,
  },
  hitSize: 110,
  cost: {
    shards: 15000,
    bloonstones: 0,
  },
  path1: "bad",
});
Registry.blimps.add("ddt", {
  name: "DDT",
  description: "Very fast blimp, ditching the booster for immunity to explosives and sharp objects. Also gains AP5.",
  health: 400,
  speed: 16,
  weaponSlots: [1, 5],
  positions: [
    { x: 50, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: -80, y: 0 },
  ],
  drawer: {
    image: "blimp.ddt",
    width: 290,
    height: 200,
  },
  resistances: {
    "ballistic": 1,
    "explosion": 1
  },
  hitSize: 80,
  cost: {
    shards: 3750,
    bloonstones: 0,
  },
  path2: "bad",
});
Registry.blimps.add("bad", {
  name: "BAD",
  description: "The largest blimp, armed with 4 weapons.",
  health: 20000,
  speed: 3,
  weaponSlots: [1, 2, 3, 4],
  hasBooster: true,
  positions: [
    { x: 80, y: 0 },
    { x: -80, y: 0 },
    { x: 30, y: 50 },
    { x: 30, y: -50 },
  ],
  boosterPos: { x: -180, y: 0 },
  drawer: {
    image: "blimp.bad",
    width: 465,
    height: 339,
  },
  hitSize: 165,
  cost: {
    shards: 50000,
    bloonstones: 0,
  },
  path1: "bloonarius",
});

Registry.blimps.add("bloonarius", {
  name: "Bloonarius",
  description: "<<Boss>>\nThe slowest of them all, capable of wielding all 5 weapon slots simultaneously.",
  health: 100000,
  speed: 2,
  weaponSlots: [1, 2, 3, 4, 5],
  hasBooster: true,
  positions: [
    { x: 180, y: 0 },
    { x: 0, y: 0 },
    { x: -50, y: 150 },
    { x: -50, y: -150 },
    { x: -190, y: 0 },
  ],
  boosterPos: { x: -220, y: 0 },
  drawer: {
    image: "blimp.bloonarius",
    width: 633,
    height: 574,
  },
  hitSize: 240,
  cost: {
    shards: 150000,
    bloonstones: 1000,
  },
});

// ####   Support   ####

Registry.blimps.add("support-moab", {
  name: "Support MOAB",
  weaponSlots: [1],
  drawer: {
    image: "blimp.moab",
    width: 115,
    height: 75,
  },
  hitSize: 37,
  // path1: "bfb",
  // path2: "ddt",
});