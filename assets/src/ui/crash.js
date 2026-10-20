createUIComponent(["crash"], [], 960, 540, 1000, 900);
createUIComponent(["crash"], [], 960, 150, 1000, 180, "none", null, "Oh No", false, 100);
createUIComponent(
  ["crash"],
  [],
  960,
  300,
  0,
  0,
  "none",
  null,
  "MOAB Adventure has encountered an error.",
  true,
  40,
);
/**
 * @param {Error} error
 */
function crash(error) {
  if (ui.menuState !== "crash") {
    reload();
    SoundCTX.stop("*");
    ui.menuState = "crash";
    crashStats.type.text = (error?.constructor?.name ?? "Unknown Error") + ":";
    crashStats.message.text = error?.message ? wrapWords(error.message, 40) : "No message provided";
    crashStats.stack.text = error?.stack ?? "No stacktrace available";
  } else {
    try {
      noLoop();
    } catch (e) {
      // if noLoop() breaks, then everything else p5 broke too (probably)
      // and then rAF takes care of it
      document.querySelector("canvas").remove();
    }
    console.error("Critical error:", error);
    requestAnimationFrame(() => {
      try {
        resetMatrix();
        scale(contentScale);
        noStroke();
        fill(0, 0, 200);
        rect(960, 540, 1920, 1080);
        fill(255);
        textFont("consolas");
        textAlign(CENTER, TOP);
        textSize(30);
        text(`MOAB Adventure | Critical Error`, 960, 20);
        textSize(20);
        textAlign(LEFT, TOP);
        text(
          error ?
            `All known error details:\n[${error.name} - ${error.constructor.name}]\n\n${error.stack}`
          : "We don't know anything about this.\nConsider opening an issue and reporting\nwhat you were doing before this occurred.",
          20,
          60,
        );
        textAlign(RIGHT, TOP);
        text(
          `Press F11 to exit fullscreen\nF12 to open console\n\nReport this here: https://github.com/MOAB-Adventure/play/issues/new`,
          1900,
          60,
        );
        textAlign(CENTER, BOTTOM);
        text(`This is just the game that's broken - your PC is fine!`, 960, 1060);
      } catch (e) {
        console.error("Error rendering bluescreen:", e);
        document.querySelector("canvas").remove();
        const d = document.createElement("div");
        d.innerHTML = `
        &nbsp;&nbsp;MOAB Adventure | Really F*cking Bad Error
        
        The game broke so badly that we can't even render the canvas bluescreen.
        We really recommend that you open an issue on GitHub, since this may be a big problem.
        You can open an issue here: <a href="https://github.com/MOAB-Adventure/play/issues/new">https://github.com/MOAB-Adventure/play/issues/new</a>

        Well, here's the original error:
         - [${error?.name ?? "(no name)"} - ${error?.constructor?.name ?? "(no type)"}]
        Stacktrace:
        &nbsp;&nbsp;${(error?.stack ?? "(no trace)").replaceAll("\n", "\n&nbsp;&nbsp;")}

        And here's the one which broke my bluescreen:
         - [${e?.name ?? "(no name)"} - ${e?.constructor?.name ?? "(no type)"}]
        Stacktrace:
        &nbsp;&nbsp;${(e?.stack ?? "(no trace)").replaceAll("\n", "\n&nbsp;&nbsp;")}

        `.replaceAll("\n", "<br>");
        d.style.color = "white";
        d.style.backgroundColor = "rgb(0,0,200)";
        d.style.fontFamily = "consolas";
        d.querySelectorAll("a").forEach((e) => (e.style.color = "white"));
        document.body.append(d);
      }
    });
  }
}
const crashStats = {
  type: createUIComponent(["crash"], [], 960, 460, 0, 0, "none", null, "Error", true, 50),
  message: createUIComponent(
    ["crash"],
    [],
    960,
    530,
    0,
    0,
    "none",
    null,
    "Game crashed.",
    true,
    40,
  ),
  stack: createUIComponent(["crash"], [], 960, 700, 0, 0, "none", null, "", true, 20),
};
createUIComponent(
  ["crash"],
  [],
  960,
  860,
  700,
  50,
  "none",
  () => {
    ui.menuState = "in-game";
  },
  "Re-enter Game (May crash again)",
  true,
  35,
);
createUIComponent(
  ["crash"],
  [],
  960,
  940,
  700,
  50,
  "none",
  () => {
    ui.menuState = "title";
  },
  "Back to Start (Progress is lost)",
  true,
  35,
);
