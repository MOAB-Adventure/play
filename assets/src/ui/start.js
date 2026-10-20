//   Start Menu 'start-menu'

//Start menu background and header
createUIComponent(["start-menu"], [], 960, 540 + 25, 700, 750);
createUIComponent(
  ["start-menu"],
  [],
  960,
  220,
  1000,
  75,
  "none",
  undefined,
  "*         Select Option",
  false,
  50,
);
//Back to title screen button
createUIComponent(
  ["start-menu"],
  [],
  570,
  222,
  200,
  50,
  "none",
  () => {
    ui.menuState = "title";
  },
  "*< Back",
  false,
  30,
).isBackButton = true;

//Options Buttons
createUIComponent(
  ["start-menu"],
  [],
  960,
  350,
  400,
  80,
  "none",
  () => {
    ui.menuState = "new-game";
  },
  "New Game",
  true,
  65,
);
createUIComponent(
  ["start-menu"],
  [],
  960,
  475,
  400,
  80,
  "none",
  () => {
    ui.menuState = "load-game";
  },
  "Load Game",
  true,
  60,
);
createUIComponent(
  ["start-menu"],
  [],
  960,
  600,
  400,
  80,
  "none",
  () => {
    ui.menuState = "options";
  },
  "Options",
  true,
  65,
);
// soul weapon infusion
createUIComponent(
  ["start-menu"],
  ["infusion-unlocked:true"],
  960,
  725,
  400,
  80,
  "none",
  () => {
    ui.menuState = "weapon-infusions";
  },
  "*  Infusion",
  true,
  65,
);
createUIImageComponent(
  ["start-menu"],
  ["infusion-unlocked:true"],
  800,
  725,
  75,
  75,
  null,
  "ui.soul",
  false,
);
createUIComponent(
  ["start-menu"],
  ["infusion-unlocked:false"],
  960,
  725,
  400,
  80,
  "none",
  null,
  "???",
  true,
  65,
);
// mods
createUIComponent(["start-menu"], [], 960, 850, 400, 80, "none", null, "???", true, 65);
//    Start sub-menus
createUIComponent(["new-game", "weapon-slots"], [], 960, 540, 1500, 900);
