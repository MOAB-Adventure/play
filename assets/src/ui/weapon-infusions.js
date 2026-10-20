createUIComponent(["weapon-infusions"], [], 1010, 540, 1750, 1000);
{
  const itemWidth = 825,
    itemHeight = 275,
    padding = 30,
    maxItemsPerRow = 2,
    maxRowsPerPage = 3,
    startX = 165,
    startY = 70;

  const ifp = [];
  let pages = 0;
  UIComponent.setCondition("page:1");

  function reloadInfusionsUI() {
    let dx = 0,
      dy = 0,
      itemsThisRow = 0,
      rowsThisPage = 0;
    ui.screens["weapon-infusions"] = ui.screens["weapon-infusions"].filter(c => !ifp.includes(c));
    pages = 0;
    infusions.forEach((i, n) => {
      if (i.levels.length === 0) return;
      if (itemsThisRow === 0 && rowsThisPage === 0) pages++;
      createInfusionInfo(dx, dy, pages, i);
      itemsThisRow++;
      dx += itemWidth + padding;
      if (itemsThisRow >= maxItemsPerRow) {
        dx = 0;
        itemsThisRow = 0;
        rowsThisPage++;
        dy += itemHeight + padding;

        if (rowsThisPage >= maxRowsPerPage) {
          dx = 0;
          dy = 0;
          itemsThisRow = 0;
          rowsThisPage = 0;
        }
      }
    });
    if (UIComponent.getCondition("page") > pages) UIComponent.setCondition("page:" + pages);
    recolorInfusionsUI();
  }
  globalThis.reloadInfusionsUI = reloadInfusionsUI;

  function recolorInfusionsUI() {
    ifp.forEach(c => {
      if (c.recolorizer && c.recolorizer()) applySoulColour(c);
      else applyDisabledColour(c);
    });
  }

  /** @param {number} x @param {number} y @param {number} page   @param {WeaponInfusion} inf */
  function createInfusionInfo(x, y, page, inf) {
    const levels = inf.levels.length,
      pc = ["page:" + page],
      ps = ["weapon-infusions"];
    const addl = function (x, l = 0) {
      ifp.push(x);
      x.recolorizer = () => inf.tier > l;
      return x;
    };
    ifp.push(
      createUIComponent(ps, pc, x + startX + itemWidth * 0.5, y + startY + itemHeight * 0.5, itemWidth, itemHeight, "none", () => {
        if (inf.attemptUpgrade()) recolorInfusionsUI();
      }),
    );
    addl(
      createUIComponent(
        ps,
        pc,
        x + startX + itemWidth * 0.5,
        y + startY + 40 * 0.5,
        itemWidth,
        40,
        "none",
        null,
        truncate(inf.title, itemWidth / 18.1201171875 - 2),
        true,
        30,
      ),
      levels - 1,
    );
    const levelSize = itemWidth / levels;
    for (let clevel = 0; clevel < levels; clevel++) {
      const frac = clevel / levels,
        def = inf.levels[clevel];
      addl(
        createUIComponent(
          ps,
          pc,
          x + startX + levelSize * (0.5 + clevel),
          y + startY + (itemHeight - 80) * 0.5 + 80,
          levelSize,
          itemHeight - 80,
          "none",
          null,
          lineTruncate(wrapWords(def.desc, levelSize / 10.8720703125 - 2), 8),
          true,
          18,
        ),
        clevel,
      );
      addl(
        createUIComponent(
          ps,
          pc,
          x + startX + levelSize * (clevel + 0.5),
          y + startY + 30 * 0.5 + 45,
          levelSize,
          30,
          "none",
          null,
          `${def.cost}`,
          true,
          30,
        ),
        clevel,
      );
      ifp.push(createUIImageComponent(ps, pc, x + startX + levelSize * clevel + 20, y + startY + 40 * 0.5 + 42.5, 40, 40, null, "ui.soul", false));
    }
  }
  Object.defineProperty(createUIComponent(["weapon-infusions"], [], 1010, 1000, 0, 0, "none", null, "", true, 40), "text", {
    get: () => `Page ${UIComponent.getCondition("page")}/${pages}`,
  });
  createUIComponent(
    ["weapon-infusions"],
    [],
    1010 + 660,
    1000,
    350,
    50,
    "none",
    () => {
      let page = +UIComponent.getCondition("page");
      if (page < pages) UIComponent.setCondition("page:" + (page + 1));
    },
    "Next Page >",
    true,
    40,
  );
  createUIComponent(
    ["weapon-infusions"],
    [],
    1010 - 660,
    1000,
    350,
    50,
    "none",
    () => {
      let page = +UIComponent.getCondition("page");
      if (page > 1) UIComponent.setCondition("page:" + (page - 1));
    },
    "< Prev. Page",
    true,
    40,
  );
  UIComponent.setOutlineColour(
    UIComponent.setBackgroundOf(
      createUIComponent(
        ["weapon-infusions"],
        ["page:1"],
        1010 - 660,
        1000,
        350,
        50,
        "none",
        () => {
          ui.menuState = "start-menu";
        },
        "X Exit",
        true,
        40,
      ),
      col.from(150, 50, 50),
    ),
    col.from(100, 25, 25),
  ).isBackButton = true;
}
function applySoulColour(comp) {
  return UIComponent.setOutlineColour(UIComponent.setBackgroundOf(comp, col.from(150, 50, 200)), col.from(75, 25, 100));
}
function applyDisabledColour(comp) {
  return UIComponent.setOutlineColour(UIComponent.setBackgroundOf(comp, col.mono(125)), col.mono(50));
}

// Soul indicator
createUIComponent(["weapon-infusions"], [], 110, 50, 200, 80, "right");
createUIImageComponent(["weapon-infusions"], [], 40, 50, 50, 50, null, "ui.soul", false);
Object.defineProperty(UIComponent.alignLeft(createUIComponent(["weapon-infusions"], [], 75, 50, 0, 0, "none", null, "1022k", true, 40)), "text", {
  get: () => `${game.souls}`,
});

// Toggle
createUIComponent(["weapon-infusions"], [], 57.5, 845, 105, 80, "right");
UIComponent.invert(createUIComponent(["weapon-infusions"], [], 57.5, 655, 105, 80, "right"));

applyDisabledColour(
  createUIComponent(
    ["weapon-infusions"],
    ["infusion-enabled:false"],
    65,
    750,
    120,
    80,
    "none",
    () => {
      UIComponent.setCondition("infusions-enabled:true");
      Serialiser.set("souls.infusions-active", true);
      game.infuse = true;
    },
    "Infusion Disabled",
    true,
    25,
  ),
);
applySoulColour(
  createUIComponent(
    ["weapon-infusions"],
    ["infusion-enabled:true"],
    65,
    750,
    120,
    80,
    "none",
    () => {
      UIComponent.setCondition("infusions-enabled:false");
      Serialiser.set("souls.infusions-active", false);
      game.infuse = false;
    },
    "Infusion Enabled",
    true,
    25,
  ),
);
