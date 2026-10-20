const background = {
  x: 0,
  draw() {
    if (game.increasedLevelSize)
      for (let y = -540; y <= 1080 + 540; y += 1080)
        for (let x = this.x - 1920; x < 1920 * 3; x += 1920)
          ImageCTX.draw(this.image, x, y, 1920 + 16 / 3, 1080 + 9 / 3);
    else
      for (let x = this.x - 1920; x <= 1920 * 2; x += 1920)
        ImageCTX.draw(this.image, x, 540, 1920 + 16 / 3, 1080 + 9 / 3);
  },
  tick(dt) {
    this.x -= dt;
    if (this.x <= -1920) {
      this.x += 1920;
    }
  },
  image: "background.sea",
};

//###################################################################
//
// in-game UI > sandbox UI > INDICATOR
//
//###################################################################
//#region indicator

createUIImageComponent(
  ["in-game"],
  ["mode:sandbox"],
  960,
  1070,
  1920,
  20,
  null,
  "ui.warn-tape",
  false,
);
createUIImageComponent(
  ["in-game"],
  ["mode:sandbox"],
  960,
  10,
  1920,
  20,
  null,
  "ui.warn-tape",
  false,
);
//#endregion
//###################################################################
//
// in-game UI > informative UI > CURRENCY COUNTERS
//
//###################################################################
//#region currency counter

createUIComponent(["in-game"], [], 350, 55, 700, 125, "right");
//Shards
createUIImageComponent(["in-game"], [], 40, 60, 75, 75, null, "ui.shard", false);
//Overwrite text
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(["in-game"], ["debug:true"], 80, 30, 0, 0, "none", null, "shards", true, 20),
    "text",
    {
      get: () => "" + game.shards,
    },
  ),
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(["in-game"], [], 80, 60, 0, 0, "none", null, "shards", true, 60),
    "text",
    {
      get: () => shortenedNumber(game.shards),
    },
  ),
);
//Bloonstones
createUIImageComponent(["in-game"], [], 330, 60, 75, 75, null, "ui.bloonstone", false);
//Overwrite text
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      ["in-game"],
      ["debug:true"],
      370,
      30,
      0,
      0,
      "none",
      null,
      "bloonstones",
      true,
      20,
    ),
    "text",
    {
      get: () => "" + game.bloonstones,
    },
  ),
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(["in-game"], [], 370, 60, 0, 0, "none", null, "bloonstones", true, 60),
    "text",
    {
      get: () => shortenedNumber(game.bloonstones),
    },
  ),
);

//#endregion
//###################################################################
//
// in-game UI > informative UI > HEALTHBAR
//
//###################################################################
//#region healthbar

UIComponent.invert(
  //Healthbar container
  createUIComponent(["in-game"], [], 375, 995 + 25, 900, 175, "right"),
);
UIComponent.setBackgroundOf(
  UIComponent.setOutlineColour(
    createUIShapeComponent(["in-game"], [], 35, 975, 40, 40, null, "circle", true),
    col.green | col.blue,
  ),
  col.from(0, 255, 255, 100),
);

createUIImageComponent(["in-game"], [], 70, 1035, 80, 80, null, "ui.moab", false);

// Normal HP
UIComponent.invert(
  createHealthbarComponent(
    ["in-game"],
    [],
    420,
    1020,
    550,
    64,
    "both",
    undefined,
    undefined,
    undefined,
    20,
    () => game.player,
    col.red,
  ),
);

// UIComponent.removeOutline(
// Shield CD
UIComponent.invert(
  createHealthbarComponent(
    ["in-game"],
    [],
    420 - 48,
    1020 - 48,
    550,
    16,
    "both",
    undefined,
    undefined,
    undefined,
    20,

    () => (game.support ? game.support?.weaponSlots[0]?.weapon : null) ?? {},
  )
    .setGetters("_cooldown", "reload")
    .setColours(
      () => (game.support.weaponSlots[0].tier > 1 ? col.black : col.from(100, 0, 0)),
      col.from(255, 178, 100),
      col.transparent,
    )
    .reverseBarFraction(),
);

//)
createParticleEmitter(["in-game"], [], 640, 970, -90, 1, "fire", 1).getActivity = function () {
  return ui.menuState === "in-game" && game.player?.weaponSlots[5]?.weapon?._cooldown === 0;
};
// Shield
UIComponent.removeOutline(
  UIComponent.invert(
    createHealthbarComponent(
      ["in-game"],
      [],
      420 - 48,
      1020 - 48,
      550 - 4,
      16 - 4,
      "both",
      undefined,
      undefined,
      undefined,
      20,
      () => game.player._shield ?? {},
    )
      .setGetters("strength", "maxStrength")
      .setColours(
        () => (game.support.weaponSlots[0].tier > 1 ? col.from(0, 60, 60, 125) : col.from(100, 0, 0)),
        () => game.player._shield?.trailColourTo ?? col.black,
        () => game.player._shield?.colourTo ?? col.black,
      ),
  ),
);

// ).getActivity = function () {
//   return (
//     ui.menuState === "in-game" && game.support?.weaponSlots && game.support?.weaponSlots[0]?.weapon
//   );
// };

// //Name display
// let nameBG;
// UIComponent.setBackgroundOf(
//   UIComponent.invert(
//     //Upside-down on top of healthbar
//     (nameBG = Object.defineProperties(createUIComponent(["in-game"], [], 195, 905, 400, 100), {
//       width: {
//         get: () => {
//           push();
//           textFont(fonts.darktech);
//           textSize(60);
//           let width = textWidth(game.player.name) + nameBG.height + 40;
//           pop();
//           return width;
//         },
//       },
//       x: {
//         get: () => nameBG.width / 2 - 4,
//       },
//     }))
//   ),
//   [50, 50, 50]
// );
//Backup background
// UIComponent.removeOutline(
//   UIComponent.invert(
//     //Upside-down on top of healthbar
//     Object.defineProperties(createUIComponent(["in-game"], [], 200, 905, 400, 80, "right"), {
//       width: {
//         get: () => nameBG.width - 20,
//       },
//       x: {
//         get: () => nameBG.x - 20,
//       },
//     })
//   )
// );
// UIComponent.alignLeft(
//   Object.defineProperties(
//     createUIComponent(["in-game"], [], 20, 905, 0, 0, "both", null, "e", false, 60),
//     {
//       text: {
//         get: () =>
//           //Make text dependent on player name
//           game.player ? game.player.name : "mobe",
//       },
//     }
//   )
// );
//###################################################################
//
// in-game UI > informative UI > LEVEL COUNTER
//
//###################################################################

createUIComponent(["in-game"], [], 150, 175, 300, 90, "right");
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(["in-game"], [], 20, 175, 0, 0, "right", null, "", true, 60),
    "text",
    {
      get: () => "LV " + game.level,
    },
  ),
);
UIComponent.setCondition("debug:false");
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(["in-game"], ["debug:true"], 20, 145, 0, 0, "right", null, "", true, 20),
    "text",
    {
      get: () =>
        game.player.dv +
        "/" +
        game.maxDV +
        " DV, " +
        game.player.destroyed.bosses +
        "/" +
        game.totalBosses +
        " bosses",
    },
  ),
);
//#endregion
//###################################################################
//
// in-game UI > informative UI > BOSSBAR
//
//###################################################################
//#region bossbar

UIComponent.setCondition("boss:no"); //No boss by default

//  When boss active
//Boss healthbar
createUIComponent(
  ["in-game"],
  ["boss:yes"], //Only show if boss is active
  1475,
  140,
  400,
  50,
  "left",
);
//Name plate
UIComponent.alignRight(
  Object.defineProperty(
    createUIComponent(
      ["in-game"],
      ["boss:yes"], //Only show if boss is active
      1666,
      140,
      0,
      0,
      "left",
    ),
    "text",
    {
      get: () => world.boss?.name ?? "Boss", //Text is name
    },
  ),
);
let bhb = UIComponent.invert(
  createHealthbarComponent(
    ["in-game"],
    ["boss:yes"],
    1480,
    200,
    460,
    50,
    "both",
    undefined,
    undefined,
    undefined,
    20,
    () => world.boss,
    col.red,
  )
    .reverseBarDirection()
    .setColours(null, () => world.boss?.healthColour ?? col.red, null)
    .setIsHigher(() => world.boss?.higher ?? false),
);
UIComponent.invert(
  createUIComponent(
    ["in-game"],
    ["boss:yes"], //Only show if boss is active
    1600,
    245,
    350,
    20,
    "left",
  ),
);
//HP thing
UIComponent.alignRight(
  Object.defineProperty(
    createUIComponent(
      ["in-game"],
      ["boss:yes"], //Only show if boss is active
      1666,
      245,
      0,
      0,
      "none",
      null,
      "",
      true,
    ),
    "text",
    {
      get: () => {
        let boss = world.boss;
        if (!boss) return "unknown";
        return (
          shortenedNumber(boss.health ?? 1) +
          "/" +
          shortenedNumber(boss.maxHealth ?? 1) +
          " (" +
          roundNum(((boss.health ?? 1) / (boss.maxHealth ?? 1)) * 100, 1) +
          "%)"
        );
      }, //Text is hp / max hp
    },
  ),
);
//square thing with boss class
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["boss:yes"], //Only show if boss is active
    1760,
    185,
    150,
    150,
    "none",
    null,
    "o",
    false,
    60,
  ),
  "text",
  {
    get: () => world.boss?.class ?? "o", //Show boss class if it exists, otherwise show "o"
  },
);

//#endregion
//###################################################################
//
// in-game UI > informative UI > BOSS TIMER
//
//###################################################################
//#region boss timer

UIComponent.invert(
  //boss timer bar container
  createUIComponent(
    ["in-game"],
    ["boss:no", "mode:adventure"], //Only show if no boss, if boss then show boss' healthbar instead
    1520,
    50,
    800,
    100,
    "left",
  ),
);

UIComponent.invert(
  createHealthbarComponent(
    ["in-game"],
    ["boss:no", "mode:adventure"],
    1505,
    50,
    580,
    50,
    "both",
    undefined,
    undefined,
    undefined,
    20,
    () => game,
    col.red,
  )
    .setGetters("bosstimer", "bossinterval")
    .reverseBarDirection()
    .setColours(null, null, col.red),
);

createUIImageComponent(
  ["in-game"],
  ["boss:no", "mode:adventure"],
  1870,
  50,
  80,
  80,
  null,
  "ui.clock",
  false,
);

//#endregion
//###################################################################
//
// in-game UI > informative UI > BOSS RUSH PLATE
//
//###################################################################
//#region br plate

UIComponent.invert(
  createUIComponent(["in-game"], ["boss:no", "mode:boss-rush"], 1670, 50, 500, 100, "left"),
);
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["boss:no", "mode:boss-rush"],
    1720,
    50,
    0,
    0,
    "none",
    null,
    "*Next:    ",
    true,
    40,
  ),
  "text",
  {
    get: () => {
      let b = world.bosses[world.cbi];
      if (b) return "Next:\n" + Registry.entities.get(b).name;
      return "Transferring...";
    },
  },
);

//#endregion
//###################################################################
//
// in-game UI > interactable UI > UPGRADE MENU
//
//###################################################################
//#region upgrade menu

//Translucent blue background
UIComponent.removeOutline(
  UIComponent.setBackgroundOf(
    createUIComponent(["in-game"], ["upgrade-menu-open:true"], 900, 575, 800, 700),
    col.from(0, 255, 255, 100),
  ),
);
//Vertical line bit
UIComponent.removeOutline(
  UIComponent.setBackgroundOf(
    createUIComponent(["in-game"], ["upgrade-menu-open:true"], 900, 110, 50, 125),
    col.from(0, 255, 255, 100),
  ),
);
//Open / Close Buttons
UIComponent.setCondition("upgrade-menu-open:false");
UIComponent.setCondition("was-game-paused:false");
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:false"],
  900,
  25,
  250,
  50,
  "none",
  () => {
    //Store current pause state under `was-game-paused`
    UIComponent.setCondition("was-game-paused:" + (game.paused ? "true" : "false"));
    pause(); //Pause the game
    UIComponent.setCondition("upgrade-menu-open:true");
  },
  "Upgrades",
);
//Header bar
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true"],
  900, //Left pos = 500px
  225,
  800,
  100,
  "none",
  null,
  "Upgrades",
  false,
  60,
);

//Weapon Upgrades
//Title text
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:none"],
  900,
  325,
  0,
  0,
  "none",
  null,
  "Weapons",
  false,
  40,
);
//Buttons
//Space them 150px apart => 100px wide => 50px separation?
//AP3 at x = 900
// Set conditions: Nothing available
UIComponent.setCondition("is-ap1-available:false");
UIComponent.setCondition("is-ap2-available:false");
UIComponent.setCondition("is-ap3-available:false");
UIComponent.setCondition("is-ap4-available:false"); //AP3 and 4 are separate
UIComponent.setCondition("is-ap5-available:false");

UIComponent.setCondition("is-sp1-available:false"); // support
//Sub-menu
UIComponent.setCondition("submenu-selected:none");
//AP1
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-ap1-available:true", "submenu-selected:none"],
  600,
  425,
  100,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:ap1");
  },
  "AP1",
  true,
  40,
);
//AP2
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-ap2-available:true", "submenu-selected:none"],
  750,
  425,
  100,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:ap2");
  },
  "AP2",
  true,
  40,
);
//AP3
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-ap3-available:true", "submenu-selected:none"],
  900,
  425,
  100,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:ap3");
  },
  "AP3",
  true,
  40,
);
//AP4
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-ap4-available:true", "submenu-selected:none"],
  1050,
  425,
  100,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:ap4");
  },
  "AP4",
  true,
  40,
);
//AP5
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-ap5-available:true", "submenu-selected:none"],
  1200,
  425,
  100,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:ap5");
  },
  "AP5",
  true,
  40,
);

//Booster
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-booster-available:true", "submenu-selected:none"],
  645,
  525,
  200,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:booster");
  },
  "Booster",
  true,
  40,
);
//SP1
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "is-sp1-available:true", "submenu-selected:none"],
  600,
  625,
  100,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:sp1");
  },
  "SP1",
  true,
  40,
);

//    Sub-menus
function getSelectedSlotIndex() {
  //Returns the index for the selected slot.
  if (UIComponent.evaluateCondition("submenu-selected:ap1")) return 0;
  if (UIComponent.evaluateCondition("submenu-selected:ap2")) return 1;
  if (UIComponent.evaluateCondition("submenu-selected:ap3")) return 2;
  if (UIComponent.evaluateCondition("submenu-selected:ap4")) return 3;
  if (UIComponent.evaluateCondition("submenu-selected:ap5")) return 4;
  if (UIComponent.evaluateCondition("submenu-selected:booster")) return 5;

  if (UIComponent.evaluateCondition("submenu-selected:sp1")) return -2;
  return -1;
}
//  Back button
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster|blimp|sp1"],
  525,
  225,
  50,
  100,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:none");
  },
  "<",
  false,
  60,
).isBackButton = true;

//#endregion
//###################################################################
//
// in-game UI > interactable UI > upgrade menu > WEAPON UPGRADE MENU
//
//###################################################################
//#region w. upgrade

//Title
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"],
    900,
    325,
    0,
    0,
    "none",
    null,
    "ERROR",
    false,
    40,
  ),
  "text",
  {
    get: () =>
      getSelectedSlotIndex() === 5 ? "Booster" : "Weapon: AP" + (getSelectedSlotIndex() + 1), //Dynamically change based on selected slot
  },
);
//Current upgrade info
Object.defineProperty(
  createUIComponent(
    //Name
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
    900,
    380,
    750,
    40,
    "none",
    null,
    "Not unlocked yet",
    true,
    30,
  ),
  "text",
  {
    get: () => {
      const slot = getSelectedSlotIndex();
      if (!game?.player) return "No player";
      if (!game?.player?.weaponSlots[slot]) return "Slot Unavailable"; //in case not
      let upgrade = game.player.weaponSlots[slot].tier - 1;
      let regname = game.player.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = { name: "Not unlocked" };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return weapon.name;
    },
  },
);
Object.defineProperty(
  createUIComponent(
    //Description
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
    900,
    475,
    750,
    100,
    "none",
    null,
    "No weapon is present. Upgrade to add one.",
    true,
    20,
  ),
  "text",
  {
    get: () => {
      const slot = getSelectedSlotIndex();
      if (!game?.player) return "No player";
      if (!game?.player?.weaponSlots[slot])
        return "This weapon slot is not present on\nthe current blimp.";
      let upgrade = game.player.weaponSlots[slot].tier - 1;
      let regname = game.player.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = { description: "No weapon is present. Upgrade to add one." };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return wrapWords(weapon.description, 60);
    },
  },
);
//Next upgrade info
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"],
  900,
  565,
  0,
  0,
  "none",
  null,
  "Upgrade To:",
  false,
  35,
);
Object.defineProperty(
  createUIComponent(
    //Name
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
    900,
    625,
    750,
    40,
    "none",
    null,
    "Max Upgrades",
    true,
    30,
  ),
  "text",
  {
    get: () => {
      const slot = getSelectedSlotIndex();
      if (!game?.player) return "No player";
      if (!game?.player?.weaponSlots[slot]) return "Slot Unavailable";
      let upgrade = game.player.weaponSlots[slot].tier;
      let regname = game.player.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = { name: "Max Upgrades" };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return weapon.name;
    },
  },
);
Object.defineProperty(
  createUIComponent(
    //Description
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
    835,
    720,
    625,
    100,
    "none",
    null,
    "Maximum upgrade level for this blimp\nhas been reached.",
    true,
    20,
  ),
  "text",
  {
    get: () => {
      const slot = getSelectedSlotIndex();
      if (!game?.player) return "No player";
      if (!game?.player?.weaponSlots[slot])
        return "This weapon slot is not present on\nthe current blimp.";
      let upgrade = game.player.weaponSlots[slot].tier;
      let regname = game.player.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = {
        name: "Maximum upgrade level for this blimp\nhas been reached.",
      };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return wrapWords(weapon.description, 50);
    },
  },
);
createUIComponent(
  //Cost background
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
  1225,
  720,
  100,
  100,
  "none",
  null,
  "",
  true,
  20,
);
createUIImageComponent(
  //Shard icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
  1200,
  700,
  30,
  30,
  null,
  "ui.shard",
  false,
);
createUIImageComponent(
  //Bloonstone icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
  1200,
  740,
  30,
  30,
  null,
  "ui.bloonstone",
  false,
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Shard Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
      1225,
      700,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        const slot = getSelectedSlotIndex();
        if (!game?.player) return "⚠";
        if (!game?.player?.weaponSlots[slot]) return "⚠";
        let upgrade = game.player.weaponSlots[slot].tier;
        let regname = game.player.weaponSlots[slot].upgrades[upgrade] ?? "";
        let weapon = {};
        if (Registry.weapons.has(regname)) {
          weapon = Registry.weapons.get(regname);
        }
        return shortenedNumber(weapon.cost?.shards ?? 0);
      },
    },
  ),
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Bloonstone Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"], //Assuming AP is available
      1225,
      740,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        const slot = getSelectedSlotIndex();
        if (!game?.player) return "⚠";
        if (!game?.player?.weaponSlots[slot]) return "⚠";
        let upgrade = game.player.weaponSlots[slot].tier;
        let regname = game.player.weaponSlots[slot].upgrades[upgrade] ?? "";
        let weapon = {};
        if (Registry.weapons.has(regname)) {
          weapon = Registry.weapons.get(regname);
        }
        return shortenedNumber(weapon.cost?.bloonstones ?? 0);
      },
    },
  ),
);
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:ap1|ap2|ap3|ap4|ap5|booster"],
  900,
  825,
  700,
  60,
  "none",
  () => {
    const slot = getSelectedSlotIndex();
    if (!game?.player) return;
    if (!game?.player?.weaponSlots[slot]) return;
    game.player.weaponSlots[slot].attemptUpgrade();
    game.player.weaponSlots[slot].tick(1); //Make the game realise the weapon got upgraded
  },
  "Upgrade!",
  false,
  20,
);

//#endregion
//###################################################################
//
// in-game UI > interactable UI > upgrade menu > BLIMP UPGRADE MENU
//
//###################################################################
//#region b. upgrade

//Entry Button
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:none"],
  1020,
  525,
  500,
  60,
  "none",
  () => {
    UIComponent.setCondition("submenu-selected:blimp");
  },
  "Blimp",
  true,
  40,
);
//Title
(createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"],
  900,
  325,
  0,
  0,
  "none",
  null,
  "Primary: ",
  false,
  40,
),
  //Path 1
  Object.defineProperty(
    createUIComponent(
      //Name
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
      900,
      380,
      750,
      40,
      "none",
      null,
      "Not unlocked yet",
      true,
      30,
    ),
    "text",
    {
      get: () => {
        if (!game?.player) return "No player";
        if (!game?.player?.blimp) return "No Blimp (something went wrong)"; //in case not
        let upgrade = game.player.blimp.path1;
        if (!upgrade || upgrade === "none") return "No Upgrade";
        let blimp = Registry.blimps.get(upgrade);
        return blimp.name;
      },
    },
  ));
Object.defineProperty(
  createUIComponent(
    //Description
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
    835,
    475,
    625,
    100,
    "none",
    null,
    "No weapon is present. Upgrade to add one.",
    true,
    20,
  ),
  "text",
  {
    get: () => {
      if (!game?.player) return "No player";
      if (!game?.player?.blimp) return "No Blimp (something went wrong)"; //in case not
      let upgrade = game.player.blimp.path1;
      if (!upgrade || upgrade === "none") return "This path has no upgrade for this blimp.";
      let blimp = Registry.blimps.get(upgrade);
      return wrapWords(blimp.description, 50);
    },
  },
);
//Next upgrade info
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"],
  900,
  565,
  0,
  0,
  "none",
  null,
  "Alternative: ",
  false,
  35,
);
Object.defineProperty(
  createUIComponent(
    //Name
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
    900,
    625,
    750,
    40,
    "none",
    null,
    "Max Upgrades",
    true,
    30,
  ),
  "text",
  {
    get: () => {
      if (!game?.player) return "No player";
      if (!game?.player?.blimp) return "No Blimp (something went wrong)"; //in case not
      let upgrade = game.player.blimp.path2;
      if (!upgrade || upgrade === "none") return "No Upgrade";
      let blimp = Registry.blimps.get(upgrade);
      return blimp.name;
    },
  },
);
Object.defineProperty(
  createUIComponent(
    //'Description': Health, speed etc
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
    835,
    720,
    625,
    100,
    "none",
    null,
    "Maximum upgrade level for this blimp\nhas been reached.",
    true,
    20,
  ),
  "text",
  {
    get: () => {
      if (!game?.player) return "No player";
      if (!game?.player?.blimp) return "No Blimp (something went wrong)"; //in case not
      let upgrade = game.player.blimp.path2;
      if (!upgrade || upgrade === "none") return "This path has no upgrade for this blimp.";
      let blimp = Registry.blimps.get(upgrade);
      return wrapWords(blimp.description, 50);
    },
  },
);
//Costs
createUIComponent(
  //Cost background
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
  1225,
  475,
  100,
  100,
  "none",
  null,
  "",
  true,
  20,
);
createUIImageComponent(
  //Shard icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
  1200,
  455,
  30,
  30,
  null,
  "ui.shard",
  false,
);
createUIImageComponent(
  //Bloonstone icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
  1200,
  495,
  30,
  30,
  null,
  "ui.bloonstone",
  false,
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Shard Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
      1225,
      455,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        if (!game?.player) return "⚠";
        if (!game?.player?.blimp) return "⚠"; //in case not
        let upgrade = game.player.blimp.path1;
        if (!upgrade || upgrade === "none") return "...";
        let blimp = Registry.blimps.get(upgrade);
        return shortenedNumber(blimp?.cost?.shards ?? 0);
      },
    },
  ),
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Bloonstone Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
      1225,
      495,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        if (!game?.player) return "⚠";
        if (!game?.player?.blimp) return "⚠"; //in case not
        let upgrade = game.player.blimp.path1;
        if (!upgrade || upgrade === "none") return "...";
        let blimp = Registry.blimps.get(upgrade);
        return shortenedNumber(blimp?.cost?.bloonstones ?? 0);
      },
    },
  ),
);
//cost 2
//Costs
createUIComponent(
  //Cost background
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
  1225,
  720,
  100,
  100,
  "none",
  null,
  "",
  true,
  20,
);
createUIImageComponent(
  //Shard icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
  1200,
  700,
  30,
  30,
  null,
  "ui.shard",
  false,
);
createUIImageComponent(
  //Bloonstone icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
  1200,
  740,
  30,
  30,
  null,
  "ui.bloonstone",
  false,
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Shard Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
      1225,
      700,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        if (!game?.player) return "⚠";
        if (!game?.player?.blimp) return "⚠"; //in case not
        let upgrade = game.player.blimp.path2;
        if (!upgrade || upgrade === "none") return "...";
        let blimp = Registry.blimps.get(upgrade);
        return shortenedNumber(blimp?.cost?.shards ?? 0);
      },
    },
  ),
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Bloonstone Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:blimp"], //Assuming AP is available
      1225,
      740,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        if (!game?.player) return "⚠";
        if (!game?.player?.blimp) return "⚠"; //in case not
        let upgrade = game.player.blimp.path2;
        if (!upgrade || upgrade === "none") return "...";
        let blimp = Registry.blimps.get(upgrade);
        return shortenedNumber(blimp?.cost?.bloonstones ?? 0);
      },
    },
  ),
);
//buttons
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"],
  725,
  825,
  350,
  60,
  "none",
  () => {
    if (!game?.player) return;
    if (!game?.player?.blimp) return;
    let upgrade = game.player.blimp.path1;
    if (!upgrade || upgrade === "none") return;
    let blimp = Registry.blimps.get(upgrade);
    //Check cost and buy
    let shards = blimp?.cost?.shards ?? 0,
      bloonstones = blimp?.cost?.bloonstones ?? 0;
    if (shards <= game.shards && bloonstones <= game.bloonstones) {
      game.shards -= shards;
      game.bloonstones -= bloonstones;
      game.player.upgrade(upgrade);
    }
  },
  "Upgrade\nPrimary",
  false,
  20,
);
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:blimp"],
  1100,
  825,
  350,
  60,
  "none",
  () => {
    if (!game?.player) return;
    if (!game?.player?.blimp) return;
    let upgrade = game.player.blimp.path2;
    if (!upgrade || upgrade === "none") return;
    let blimp = Registry.blimps.get(upgrade);
    //Check cost and buy
    let shards = blimp?.cost?.shards ?? 0,
      bloonstones = blimp?.cost?.bloonstones ?? 0;
    if (shards <= game.shards && bloonstones <= game.bloonstones) {
      game.shards -= shards;
      game.bloonstones -= bloonstones;
      game.player.upgrade(upgrade);
    }
  },
  "Upgrade\nAlternative",
  false,
  20,
);

//#endregion
//###################################################################
//
// in-game UI > interactable UI > upgrade menu > SUPPORT UPGRADE MENU
//
//###################################################################
//#region s. upgrade

//Title
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:sp1"],
    900,
    325,
    0,
    0,
    "none",
    null,
    "ERROR",
    false,
    40,
  ),
  "text",
  {
    get: () => "Weapon: SP" + (-1 - getSelectedSlotIndex()), //Dynamically change based on selected slot
  },
);
//Current upgrade info
Object.defineProperty(
  createUIComponent(
    //Name
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
    900,
    380,
    750,
    40,
    "none",
    null,
    "Not unlocked yet",
    true,
    30,
  ),
  "text",
  {
    get: () => {
      const slot = -2 - getSelectedSlotIndex();
      if (!game?.support) return "No support blimp";
      if (!game?.support?.weaponSlots[slot]) return "Slot Unavailable"; //in case not
      let upgrade = game.support.weaponSlots[slot].tier - 1;
      let regname = game.support.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = { name: "Not unlocked" };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return weapon.name;
    },
  },
);
Object.defineProperty(
  createUIComponent(
    //Description
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
    900,
    475,
    750,
    100,
    "none",
    null,
    "No weapon is present. Upgrade to add one.",
    true,
    20,
  ),
  "text",
  {
    get: () => {
      const slot = -2 - getSelectedSlotIndex();
      if (!game?.support) return "No support";
      if (!game?.support?.weaponSlots[slot])
        return "This weapon slot is not present on\nthe current blimp.";
      let upgrade = game.support.weaponSlots[slot].tier - 1;
      let regname = game.support.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = { description: "No weapon is present. Upgrade to add one." };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return wrapWords(weapon.description, 60);
    },
  },
);
//Next upgrade info
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:sp1"],
  900,
  565,
  0,
  0,
  "none",
  null,
  "Upgrade To:",
  false,
  35,
);
Object.defineProperty(
  createUIComponent(
    //Name
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
    900,
    625,
    750,
    40,
    "none",
    null,
    "Max Upgrades",
    true,
    30,
  ),
  "text",
  {
    get: () => {
      const slot = -2 - getSelectedSlotIndex();
      if (!game?.support) return "No player";
      if (!game?.support?.weaponSlots[slot]) return "Slot Unavailable";
      let upgrade = game.support.weaponSlots[slot].tier;
      let regname = game.support.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = { name: "Max Upgrades" };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return weapon.name;
    },
  },
);
Object.defineProperty(
  createUIComponent(
    //Description
    ["in-game"],
    ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
    835,
    720,
    625,
    100,
    "none",
    null,
    "Maximum upgrade level for this blimp\nhas been reached.",
    true,
    20,
  ),
  "text",
  {
    get: () => {
      const slot = -2 - getSelectedSlotIndex();
      if (!game?.support) return "No player";
      if (!game?.support?.weaponSlots[slot])
        return "This weapon slot is not present on\nthe current blimp.";
      let upgrade = game.support.weaponSlots[slot].tier;
      let regname = game.support.weaponSlots[slot].upgrades[upgrade] ?? "";
      let weapon = {
        name: "Maximum upgrade level for this blimp\nhas been reached.",
      };
      if (Registry.weapons.has(regname)) {
        weapon = Registry.weapons.get(regname);
      }
      return wrapWords(weapon.description, 50);
    },
  },
);
createUIComponent(
  //Cost background
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
  1225,
  720,
  100,
  100,
  "none",
  null,
  "",
  true,
  20,
);
createUIImageComponent(
  //Shard icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
  1200,
  700,
  30,
  30,
  null,
  "ui.shard",
  false,
);
createUIImageComponent(
  //Bloonstone icon
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
  1200,
  740,
  30,
  30,
  null,
  "ui.bloonstone",
  false,
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Shard Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
      1225,
      700,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        const slot = -2 - getSelectedSlotIndex();
        if (!game?.support) return "⚠";
        if (!game?.support?.weaponSlots[slot]) return "⚠";
        let upgrade = game.support.weaponSlots[slot].tier;
        let regname = game.support.weaponSlots[slot].upgrades[upgrade] ?? "";
        let weapon = {};
        if (Registry.weapons.has(regname)) {
          weapon = Registry.weapons.get(regname);
        }
        return shortenedNumber(weapon.cost?.shards ?? 0);
      },
    },
  ),
);
UIComponent.alignLeft(
  Object.defineProperty(
    createUIComponent(
      //Bloonstone Cost
      ["in-game"],
      ["upgrade-menu-open:true", "submenu-selected:sp1"], //Assuming AP is available
      1225,
      740,
      0,
      0,
      "none",
      null,
      "",
      true,
      20,
    ),
    "text",
    {
      get: () => {
        const slot = -2 - getSelectedSlotIndex();
        if (!game?.support) return "⚠";
        if (!game?.support?.weaponSlots[slot]) return "⚠";
        let upgrade = game.support.weaponSlots[slot].tier;
        let regname = game.support.weaponSlots[slot].upgrades[upgrade] ?? "";
        let weapon = {};
        if (Registry.weapons.has(regname)) {
          weapon = Registry.weapons.get(regname);
        }
        return shortenedNumber(weapon.cost?.bloonstones ?? 0);
      },
    },
  ),
);
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true", "submenu-selected:sp1"],
  900,
  825,
  700,
  60,
  "none",
  () => {
    const slot = -2 - getSelectedSlotIndex();
    if (!game?.support) return;
    if (!game?.support?.weaponSlots[slot]) return;
    game.support.weaponSlots[slot].attemptUpgrade();
    game.support.weaponSlots[slot].tick(1); //Make the game realise the weapon got upgraded
  },
  "Upgrade!",
  false,
  20,
);

//#endregion
//###################################################################
//
// in-game UI > indicative UI > PAUSE INDICATOR
//
//###################################################################
//#region pause

UIComponent.setCondition("paused:false");
createUIComponent(
  ["in-game"],
  ["paused:true", "upgrade-menu-open:false", "mode:adventure|boss-rush"],
  960,
  275,
  1920,
  20,
);
createUIComponent(
  ["in-game"],
  ["paused:true", "upgrade-menu-open:false", "mode:sandbox"],
  960,
  275,
  1920,
  20,
).bgimg = "ui.warn-tape";
UIComponent.setBackgroundOf(
  createUIComponent(
    ["in-game"],
    ["paused:true", "difficulty:easy|normal|hard", "upgrade-menu-open:false"],
    960,
    275,
    400,
    50,
    "both",
  ),
  col.from(0, 200, 255),
);
UIComponent.setBackgroundOf(
  createUIComponent(
    ["in-game"],
    ["paused:true", "difficulty:impossible", "upgrade-menu-open:false"],
    960,
    275,
    400,
    50,
    "both",
  ),
  col.from(255, 70, 0),
);
createUIComponent(
  ["in-game"],
  ["paused:true", "upgrade-menu-open:false"],
  960,
  275,
  350,
  80,
  "both",
  null,
  "Paused",
  true,
  55,
);
//#endregion
//###################################################################
//
// in-game UI > utility UI > SANDBOX TOOLS
//
//###################################################################
//#region sand tools
UIComponent.setCondition("tool:none");
UIComponent.setCondition("min:true");
UIComponent.setCondition("c:shards");
UIComponent.setCondition("d:add");
let tocreate = 0;

createUIComponent(["in-game"], ["mode:sandbox", "min:false"], 1500, 1000, 800, 80).bgimg =
  "ui.warn-tape-wide";
createUIComponent(["in-game"], ["mode:sandbox", "min:true"], 1860, 1000, 80, 80).bgimg =
  "ui.warn-tape-wide";
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:none", "min:false"],
  1860,
  1000,
  55,
  55,
  "none",
  () => UIComponent.setCondition("min:true"),
  "-",
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:none", "min:true"],
  1860,
  1000,
  55,
  55,
  "none",
  () => UIComponent.setCondition("min:false"),
  "+",
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:switcher|diff|currency"],
  1860,
  1000,
  55,
  55,
  "none",
  () => UIComponent.setCondition("tool:none"),
  "X",
);

createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:none", "min:false"],
  1250,
  930,
  0,
  0,
  "none",
  null,
  "Sandbox Tools",
  true,
  30,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:none", "min:false"],
  1170,
  1000,
  120,
  55,
  "none",
  () => UIComponent.setCondition("tool:switcher"),
  "Mode\nSwitch",
  true,
  20,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:none", "min:false"],
  1320,
  1000,
  120,
  55,
  "none",
  () => UIComponent.setCondition("tool:diff"),
  "Difficulty\nSwitch",
  true,
  20,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:none", "min:false"],
  1470,
  1000,
  120,
  55,
  "none",
  () => UIComponent.setCondition("tool:currency"),
  "Currency\nSpawner",
  true,
  20,
);

// mode switcher
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:switcher", "min:false"],
  1250,
  930,
  0,
  0,
  "none",
  null,
  "Mode Switcher",
  true,
  30,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:switcher", "min:false"],
  1750,
  930,
  300,
  40,
  "none",
  null,
  "Not reversible!",
  true,
  30,
).textColour = col.from(255, 197, 0);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:switcher", "min:false"],
  1200,
  1000,
  180,
  55,
  "none",
  () => {
    game.mode = "adventure";
  },
  "Adventure",
  true,
  30,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:switcher", "min:false"],
  1400,
  1000,
  180,
  55,
  "none",
  () => {
    game.mode = "boss-rush";
  },
  "*Boss Rush",
  true,
  30,
);

// diff switcher
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:diff", "min:false"],
  1300,
  930,
  0,
  0,
  "none",
  null,
  "Difficulty Switcher",
  true,
  30,
);
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["mode:sandbox", "tool:diff", "min:false"],
    1190,
    1000,
    150,
    55,
    "none",
    () => {
      game.difficulty = "easy";
    },
    "Easy",
    true,
    30,
  ),
  "emphasised",
  { get: () => game.difficulty === "easy" },
);
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["mode:sandbox", "tool:diff", "min:false"],
    1360,
    1000,
    150,
    55,
    "none",
    () => {
      game.difficulty = "normal";
    },
    "Normal",
    true,
    30,
  ),
  "emphasised",
  { get: () => game.difficulty === "normal" },
);
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["mode:sandbox", "tool:diff", "min:false"],
    1530,
    1000,
    150,
    55,
    "none",
    () => {
      game.difficulty = "hard";
    },
    "Hard",
    true,
    30,
  ),
  "emphasised",
  { get: () => game.difficulty === "hard" },
);
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["mode:sandbox", "tool:diff", "min:false"],
    1700,
    1000,
    150,
    55,
    "none",
    () => {
      game.difficulty = "impossible";
    },
    "Impos",
    true,
    30,
  ),
  "emphasised",
  { get: () => game.difficulty === "impossible" },
);

// currency adder
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false"],
  1300,
  930,
  0,
  0,
  "none",
  null,
  "Currency Spawner",
  true,
  30,
);
Object.defineProperty(
  createUIComponent(
    ["in-game"],
    ["mode:sandbox", "tool:currency", "min:false"],
    1470,
    1000,
    240,
    55,
    "none",
    () => {
      if (UIComponent.evaluateCondition("c:shards")) game.shards += tocreate;
      if (UIComponent.evaluateCondition("c:bloonstones")) game.bloonstones += tocreate;
      tocreate = 0;
    },
    "",
    true,
    30,
  ),
  "text",
  { get: () => "" + tocreate },
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false"],
  1305,
  1000,
  55,
  55,
  "none",
  () => {
    if (UIComponent.evaluateCondition("c:shards")) UIComponent.setCondition("c:bloonstones");
    else if (UIComponent.evaluateCondition("c:bloonstones")) UIComponent.setCondition("c:shards");
  },
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false"],
  1223,
  1000,
  70,
  55,
  "none",
  () => {
    tocreate = 0;
  },
  "Reset",
  true,
  20,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false", "d:add"],
  1140,
  1000,
  55,
  55,
  "none",
  () => {
    UIComponent.setCondition("d:sub");
  },
  "+",
  true,
  40,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false", "d:sub"],
  1140,
  1000,
  55,
  55,
  "none",
  () => {
    UIComponent.setCondition("d:add");
  },
  "-",
  true,
  40,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false"],
  1635,
  1000,
  55,
  55,
  "none",
  () => {
    if (UIComponent.evaluateCondition("d:add")) tocreate += 10000;
    if (UIComponent.evaluateCondition("d:sub")) tocreate -= 10000;
  },
  "10k",
  true,
  30,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false"],
  1710,
  1000,
  55,
  55,
  "none",
  () => {
    if (UIComponent.evaluateCondition("d:add")) tocreate += 1000;
    if (UIComponent.evaluateCondition("d:sub")) tocreate -= 1000;
  },
  "1k",
  true,
  30,
);
createUIComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false"],
  1785,
  1000,
  55,
  55,
  "none",
  () => {
    if (UIComponent.evaluateCondition("d:add")) tocreate += 100;
    if (UIComponent.evaluateCondition("d:sub")) tocreate -= 100;
  },
  "100",
  true,
  30,
);
createUIImageComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false", "c:shards"],
  1305,
  1000,
  55,
  55,
  null,
  "ui.shard",
  false,
);
createUIImageComponent(
  ["in-game"],
  ["mode:sandbox", "tool:currency", "min:false", "c:bloonstones"],
  1305,
  1000,
  55,
  55,
  null,
  "ui.bloonstone",
  false,
);

//#endregion
//###################################################################
//
// in-game UI > universal UI > CLOSE BUTTON
//
//###################################################################
//#region close

// menu close button
createUIComponent(
  ["in-game"],
  ["upgrade-menu-open:true"],
  900,
  25,
  250,
  50,
  "none",
  () => {
    //Return game to previous state
    if (!UIComponent.evaluateCondition("was-game-paused:true")) unpause();
    UIComponent.setCondition("upgrade-menu-open:false");
  },
  "Close",
).isBackButton = true;
//#endregion
