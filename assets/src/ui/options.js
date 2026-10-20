//    Options menu 'options'

//Options sub-menus
createUIComponent(["options", "options.sound", "options.ui"], [], 960, 540, 1500, 900);

createUIComponent(
  ["options"],
  [],
  960,
  120,
  1500,
  75,
  "none",
  undefined,
  "Game Options",
  false,
  50
);

createUIComponent(
  ["options"],
  [],
  320,
  122,
  200,
  50,
  "none",
  () => {
    ui.menuState = "start-menu";
  },
  "*< Back",
  false,
  30
).isBackButton = true;

// navigations
createUIComponent(
  ["options"],
  [],
  620,
  250,
  600,
  75,
  "none",
  () => (ui.menuState = "options.ui"),
  "Visuals",
  true,
  50
);
createUIComponent(
  ["options"],
  [],
  1300,
  250,
  600,
  75,
  "none",
  () => (ui.menuState = "options.sound"),
  "Music and Sound",
  true,
  50
);

// //Control Scheme
// createGamePropertySelector(
//   ["options"],
//   [],
//   250,
//   700,
//   300,
//   500,
//   60,
//   "control",
//   ["keyboard", "controller"],
//   0,
//   ["Keyboard and Mouse", "Gamepad"],
//   40
// );

/**
 * @typedef SerialisedGameOptions
 * @prop {string} control
 * @prop {string} reloadBarTheme
 * @prop {string} reloadBarStyle
 * @prop {boolean} music
 * @prop {number} volume
 * @prop {boolean} flashing
 * @prop {number} effects
 * @prop {typeof UserInterfaceController.prototype.piecewiseVolume} pwv
 */

function saveCachedOptions() {
  Serialiser.set("options", {
    control: game.control,
    music: game.music,
    reloadBarTheme: game.reloadBarTheme,
    reloadBarStyle: game.reloadBarStyle,
    volume: ui.volume,
    pwv: ui.piecewiseVolume,
    effects: game.effects,
    flashing: game.flashing
  });
}
function reloadCachedOptions() {
  /** @type {SerialisedGameOptions} */
  let opts = Serialiser.get("options");
  console.log("cached options", opts);
  opts ??= {};
  game.control = opts.control ?? "keyboard";
  game.music = opts.music ?? true;
  game.reloadBarStyle = opts.reloadBarStyle ?? "radial";
  game.reloadBarTheme = opts.reloadBarTheme ?? "rainbow";
  game.effects = opts.effects ?? 1;
  game.flashing = opts.flashing ?? true;
  ui.volume = opts.volume ?? 50;
  if (opts.pwv) ui.piecewiseVolume = opts.pwv;
  recenterBars();
}

// createUIComponent(
//   ["options"],
//   [],
//   960,
//   900,
//   600,
//   75,
//   "none",
//   async () => {
//     let res = await fetch(
//       `https://api.github.com/search/repositories?q=${encodeURIComponent("topic:moab-adventure")}&sort=stars`,
//       { headers: { Accept: "application/vnd.github+json" } }
//     );
//     let json = await res.json();
//     console.log(json);
//   },
//   "Mods",
//   true,
//   50
// );
