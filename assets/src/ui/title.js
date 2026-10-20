//   Title Screen 'title-screen'

createUIImageComponent(["title"], [], 960, 540, 1120, 420, null, "ui.title", false);

//Play button on title screen
createUIComponent(
  ["title"],
  [],
  960,
  870,
  350,
  100,
  "none",
  () => {
    ui.menuState = "start-menu";
  },
  "Play",
  false,
  60
);
createUIComponent(
  ["title"],
  [],
  960,
  970,
  250,
  50,
  "none",
  () => {
    ui.menuState = "how-to-play";
  },
  "How to Play",
  true,
  30
);
Object.defineProperty(
  UIComponent.alignLeft(
    createUIComponent(
      [
        "title",
        "options",
        "start-menu",
        "new-game",
        "load-game",
        "weapon-slots",
        "you-win",
        "you-died",
        "crash",
        "how-to-play",
      ],
      [],
      10,
      1050,
      0,
      0,
      "none",
      null,
      "ERROR",
      true,
      30
    )
  ),
  "text",
  {
    get: () =>
      (versionReplacementText.length > 0
        ? versionReplacementText
        : (isPreview ? "Preview Version " : "v") +
          gameVersion + 
          (branchName ? ` (${branchName} Edition)` : "") +
          (window.location.origin !== "https://moab-adventure.github.io"
            ? " - In Development"
            : "")
      ).substring(0, Math.floor((frameCount ?? 0) / 10)),
  }
);

createUIImageComponent(
  [
    "title",
    "new-game",
    "load-game",
    "options",
    "options.sound",
    "options.ui",
    "start-menu",
    "weapon-slots",
    "you-win",
    "crash",
  ],
  ["mode:sandbox"],
  200,
  200,
  1920,
  20,
  null,
  "ui.warn-tape",
  false
).angle = -Math.PI / 4;

createUIImageComponent(
  [
    "title",
    "new-game",
    "load-game",
    "options",
    "options.sound",
    "options.ui",
    "start-menu",
    "weapon-slots",
    "you-win",
    "crash",
  ],
  ["mode:sandbox"],
  1100,
  1100,
  1920,
  20,
  null,
  "ui.warn-tape",
  false
).angle = -Math.PI / 7;
createUIImageComponent(
  [
    "title",
    "new-game",
    "load-game",
    "options",
    "options.sound",
    "options.ui",
    "start-menu",
    "weapon-slots",
    "you-win",
    "crash",
  ],
  ["mode:sandbox"],
  1450,
  950,
  1920,
  20,
  null,
  "ui.warn-tape",
  false
).angle = -Math.PI / 5;