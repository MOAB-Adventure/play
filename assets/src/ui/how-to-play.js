createUIComponent(
  ["how-to-play"],
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
  60,
).isBackButton = true;

createUIComponent(
  ["how-to-play"],
  [],
  1310,
  970,
  100,
  100,
  "none",
  () => {
    ui.menuState = "how-to-attack";
  },
  ">",
  false,
  60,
);

createUIImageComponent(["how-to-play"], [], 400, 300, 230, 150, null, "blimp.moab", false);
createUIImageComponent(["how-to-play"], [], 400, 300, 550, 550, null, "ui.4-move", false);

createUIComponent(["how-to-play"], [], 400, 130, 75, 75, "none", null, "{{move-up}}", true, 60);
createUIComponent(["how-to-play"], [], 400, 470, 75, 75, "none", null, "{{move-down}}", true, 60);
createUIComponent(["how-to-play"], [], 230, 300, 75, 75, "none", null, "{{move-left}}", true, 60);
createUIComponent(["how-to-play"], [], 570, 300, 75, 75, "none", null, "{{move-right}}", true, 60);

createUIImageComponent(["how-to-play"], [], 800, 400, 193, 130, null, "ui.shotgun", false);
createUIImageComponent(["how-to-play"], [], 1100, 380, 75, 75, null, "box.wood", false).angle = 1;
for (let b = 0; b < 7; b++)
  createUIImageComponent(
    ["how-to-play"],
    [],
    1200 + b * 100,
    380 + rnd(-30, 120),
    75,
    75,
    null,
    tru(0.2) ? "box.metal" : "box.wood",
    false,
  );
createUIImageComponent(["how-to-play"], [], 800, 400, 500, 500, null, "ui.shoot", false).angle =
  Math.PI / 2;
createUIComponent(["how-to-play"], [], 800, 500, 150, 75, "none", null, "LMB", true, 60);

// Fake healthbar
createUIComponent(["how-to-play"], [], 1650, 110, 0, 0, "none", null, "Bad", true, 60).textColour =
  col.white;
createUIComponent(["how-to-play"], [], 1650, 150, 0, 0, "none", null, "v", true, 60).textColour =
  col.white;
UIComponent.invert(createUIComponent(["how-to-play"], [], 1650, 220, 450, 62.5, "right"));
const fakehp = {
  get health() {
    return frameCount % 300 > 200 ? 200 : 200 - (frameCount % 300);
  },
  maxHealth: 200,
};
UIComponent.invert(
  createHealthbarComponent(
    ["how-to-play"],
    [],
    1615,
    220,
    340,
    32,
    "right",
    undefined,
    undefined,
    undefined,
    20,
    fakehp,
    col.from(255, 0, 0),
  ),
);

createUIComponent(
  ["how-to-play"],
  [],
  1000,
  200,
  600,
  200,
  "none",
  null,
  "Movement controls are shown to the left. Click the left mouse button to fire. Dodge or shoot the boxes, don't let your health hit zero (illustrated on right).\nBoxes will spawn on the right, and must be dodged or shot.",
  true,
  24,
);
///////////////////////////////////////////////////////////////
createUIImageComponent(
  ["how-to-play"],
  [],
  60,
  650,
  272,
  336,
  null,
  "boss.monkey-ace",
  false,
).angle = 1;
createUIImageComponent(["how-to-play"], [], 120, 500, 100, 100, null, "ui.clock", false);
createUIComponent(
  ["how-to-play"],
  [],
  450,
  750,
  600,
  200,
  "none",
  null,
  "The boss timer on the top-right will constantly go down. When it hits zero, the next boss will spawn. There are 10 bosses per zone, and the final one is much harder than the others.",
  true,
  24,
);

///////////////////////////////////////////////////////////////////////

createUIComponent(
  ["how-to-play"],
  [],
  1450,
  750,
  600,
  200,
  "none",
  null,
  "Bosses cannot simply be dodged, they must be shot. Some bosses may have minions, which will leave when there are no more bosses left.",
  true,
  24,
);

////////////////////////////////////////////////////

createUIComponent(
  ["how-to-play"],
  [],
  960,
  50,
  0,
  0,
  "none",
  null,
  "How to Play",
  false,
  60,
).textColour = col.white;
