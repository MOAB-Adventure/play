createUIComponent(
  ["how-to-support"],
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
  ["how-to-support"],
  [],
  610,
  970,
  100,
  100,
  "none",
  () => {
    ui.menuState = "how-to-attack";
  },
  "<",
  false,
  60
);

createUIImageComponent(["how-to-support"], [], 500, 300, 230, 150, null, "blimp.moab", false);
createUIImageComponent(["how-to-support"], [], 230, 400, 115, 75, null, "blimp.moab", false);

createUIImageComponent(
  ["how-to-support"],
  [],
  230,
  400,
  120,
  96,
  null,
  "ui.shield-projector",
  false
).angle = -0.33;

{
  let c = createUIShapeComponent(
    ["how-to-support"],
    [],
    500,
    300,
    262.5,
    262.5,
    null,
    "circle",
    true
  );
  c.outlineColour = col.from(50, 255, 255, 255);
  c.backgroundColour = col.from(50, 255, 255, 150);
}

createUIComponent(
  ["how-to-support"],
  [],
  1000,
  200,
  600,
  200,
  "none",
  null,
  "The Support Blimp will follow you around. It is invulnerable, and has a weapon, SP1. SP1 will fire when pressing {{shield}} and it can, when timed correctly, defend you very effectively.",
  true,
  24
);

createUIComponent(["how-to-support"], [], 230, 300, 75, 75, "none", null, "{{shield}}", true, 60);

////////////////////////////////////////////////////

createUIComponent(
  ["how-to-support"],
  [],
  960,
  50,
  0,
  0,
  "none",
  null,
  "How to Support",
  false,
  60
).textColour = col.white;

/////////////////////////////////////////////////////
createUIImageComponent(["how-to-support"], [], 720, 600, 300, 300, null, "ui.dash", false);
repeat(
  10,
  (i) =>
    (createUIImageComponent(
      ["how-to-support"],
      [],
      380 + i * 20,
      600,
      230,
      150,
      null,
      "blimp.moab",
      false
    ).opacity = (i + 1) / 10)
);
createUIImageComponent(["how-to-support"], [], 480, 600, 53, 84, null, "ui.double-booster", false);
createUIComponent(["how-to-support"], [], 230, 600, 225, 75, "none", null, "{{boost}}", true, 60);
createUIImageComponent(["how-to-support"], [], 740, 610, 75, 75, null, "box.wood", false).angle = 1;
createUIComponent(
  ["how-to-support"],
  [],
  1250,
  700,
  600,
  300,
  "none",
  null,
  "Later in the game, in the upgrades menu, you can buy a useful movement upgrade: the Booster.\n Once it has been bought, you gain the ability to dash by pressing {{boost}}.\nThis dash will push other entities and will grant immunity to box collision damage, but will not protect against bullets or lasers.",
  true,
  24
);
