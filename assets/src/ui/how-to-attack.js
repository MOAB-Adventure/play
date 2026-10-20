createUIComponent(
  ["how-to-attack"],
  [],
  960,
  970,
  500,
  100,
  "none",
  () => {
    ui.menuState = "title";
  },
  "Return",
  false,
  60
).isBackButton = true;
createUIComponent(
  ["how-to-attack"],
  [],
  610,
  970,
  100,
  100,
  "none",
  () => {
    ui.menuState = "how-to-play";
  },
  "<",
  false,
  60
);
createUIComponent(
  ["how-to-attack"],
  [],
  1310,
  970,
  100,
  100,
  "none",
  () => {
    ui.menuState = "how-to-support";
  },
  ">",
  false,
  60
);

createUIImageComponent(["how-to-attack"], [], 500, 200, 230, 150, null, "blimp.moab", false);
createUIImageComponent(["how-to-attack"], [], 500, 200, 193, 130, null, "ui.shotgun", false);

createUIComponent(
  ["how-to-attack"],
  [],
  1000,
  200,
  600,
  200,
  "none",
  null,
  "You will need to buy a weapon to use it. This is done through the upgrade menu, or by typing {{upgrade-ap1}} (for AP1). Additional weapons may be unlocked with higher tier blimps, also obtained through the menu.",
  true,
  24
);


repeat(5, (i) =>
  createUIComponent(
    ["how-to-attack"],
    [],
    200,
    100 + (i *75),
    200,
    55,
    "none",
    null,
    "{{upgrade-ap" + (i + 1) + "}}",
    true,
    40
  )
);

////////////////////////////////////////////////////

createUIComponent(
  ["how-to-attack"],
  [],
  960,
  50,
  0,
  0,
  "none",
  null,
  "How to Attack",
  false,
  60
).textColour = col.white;

/////////////////////////////////////////////////////

createUIComponent(
  ["how-to-attack"],
  [],
  750,
  500,
  600,
  200,
  "none",
  null,
  "Weapons can be upgraded through the upgrades menu, using Shards.\n\nEach upgrade gets more expensive, with tiers 6+ requiring Bloonstones.",
  true,
  24
);
createUIImageComponent(["how-to-attack"], [], 1050, 450, 80, 80, null, "ui.shard", false);
createUIImageComponent(["how-to-attack"], [], 1050, 550, 80, 80, null, "ui.bloonstone", false);

createUIComponent(
  ["how-to-attack"],
  [],
  1500,
  450,
  600,
  300,
  "none",
  null,
  "Shards are acquired by destroying boxes, and Bloonstones by destroying bosses.\n\nBoxes give a smaller number of shards when they leave the screen.\n\nSome bosses can be defeated without being destroyed, and they give no currency.",
  true,
  24
);


createUIImageComponent(["how-to-attack"], [], 1300, 750, 300, 300, null, "ui.deamth", false);
createUIImageComponent(
  ["how-to-attack"],
  [],
  1300,
  750,
  250,
  250,
  null,
  "ui.deamth",
  false
).angle = 1;
createUIImageComponent(["how-to-attack"], [], 1300, 750, 75, 75, null, "box.wood", false).angle = 1;

repeat(5, () => {
  let a = rnd(0, Math.PI * 2);
  let d = rnd(60, 150);
  createUIImageComponent(
    ["how-to-attack"],
    [],
    1325 + Math.cos(a) * d,
    750 + Math.sin(a) * d,
    75,
    75,
    null,
    "ui.shard",
    false
  ).angle = a;
});

createUIImageComponent(
  ["how-to-attack"],
  [],
  1650,
  850,
  450,
  450,
  null,
  "ui.deamth",
  false
).angle = 0.6;
createUIImageComponent(["how-to-attack"], [], 1650, 850, 350, 350, null, "ui.deamth", false).angle =
  -1.2;
createUIImageComponent(
  ["how-to-attack"],
  [],
  1650,
  850,
  190.4,
  235.2,
  null,
  "boss.monkey-ace",
  false
).angle = 1;
repeat(5, () => {
  let a = rnd(0, Math.PI * 2);
  let d = rnd(100, 200);
  createUIImageComponent(
    ["how-to-attack"],
    [],
    1675 + Math.cos(a) * d,
    850 + Math.sin(a) * d,
    75,
    75,
    null,
    "ui.bloonstone",
    false
  ).angle = a;
});
