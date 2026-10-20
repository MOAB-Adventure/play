//Name max line width = 40 chars
//Description max line width = 51 chars, prefer 50
//Description max line number = 4 lines, prefer 3

//These aren't usually obtainable.

//## BOXES ## (not really bosses, but  s h u t)

Registry.weapons.add(".robox-gun", {
  name: ".robox-gun",
  fireSound: "laser-bolt",
  reload: 180,
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 60,
      speed: 30,
      hitSize: 5,
      damage: [
        {
          type: "laser",
          amount: 1.5,
          levelScaling: 0.5,
        },
      ],
      drawer: {
        shape: "ellipse",
        fill: "red",
        width: 15,
        height: 5,
      },
      trail: true,
      trailColour: [255, 0, 0, 50],
      trailLifeFactor: 0.2,
      followsScreen: true,
    },
    pattern: {},
  },
  parts: [
    {
      type: "part",
      x: 22.5,
      y: 0,
      width: 12,
      height: 6,
      rotation: 0,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
      recoilAnimations: [{ type: "recoil-animation", duration: 5, xOffset: -15 }],
    },
    {
      type: "part",
      x: 0,
      y: 0,
      width: 21,
      height: 21,
      rotation: 0,
      slide: 0,
      colour: [92, 92, 92],
      image: false,
    },
    {
      type: "part",
      x: 13.5,
      y: 0,
      width: 6,
      height: 11,
      rotation: 0,
      slide: 0,
      colour: [92, 92, 92],
      image: false,
    },
    {
      type: "part",
      x: -13.25,
      y: 0,
      width: 5.5,
      height: 15,
      rotation: 0,
      slide: 0,
      colour: [92, 92, 92],
      image: false,
    },
    {
      type: "part",
      x: 19,
      y: -7,
      width: 14,
      height: 4,
      rotation: 0,
      slide: 0,
      colour: [92, 92, 92],
      image: false,
    },
    {
      type: "part",
      x: 19,
      y: 7,
      width: 14,
      height: 4,
      rotation: 0,
      slide: 0,
      colour: [92, 92, 92],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: 0,
      width: 17,
      height: 17,
      rotation: 0,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: 0,
      width: 13,
      height: 13,
      rotation: 0,
      slide: 0,
      colour: [92, 92, 92],
      image: false,
    },
  ],
});

//## MONKEY ACE ##
Registry.weapons.add(".mini-ace-gatling-gun", {
  name: ".ace-gatling-gun",
  rotate: false,
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 120,
      speed: 30,
      hitSize: 8,
      trail: false,
      damage: [
        {
          type: "ballistic",
          amount: 1,
          levelScaling: 0.5,
        },
      ],
      drawer: {
        image: "bullet.normal",
        width: 28,
        height: 16,
      },
    },
    pattern: {
      spread: 3,
    },
  },
});
//## GIGANTIC BOX ##
Registry.weapons.add(".box-impact", {
  name: ".box-impact",
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 0,
      speed: 0,
      hitSize: 0,
      trail: false,
      knockback: 200,
      kineticKnockback: true,
      damage: [
        {
          type: "impact",
          amount: 15,
          area: 175,
          sparkColour: [0, 0, 0, 0],
          sparkColourTo: [0, 0, 0, 0],
          levelScaling: 5,
        },
      ],
    },
    pattern: {},
  },
});
Registry.weapons.add(".box-impact-impos", {
  name: ".box-impact",
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 0,
      speed: 0,
      hitSize: 0,
      trail: false,
      knockback: 200,
      kineticKnockback: true,
      damage: [
        {
          type: "impact",
          amount: 25,
          area: 200,
          sparkColour: [0, 0, 0, 0],
          sparkColourTo: [0, 0, 0, 0],
          levelScaling: 10,
        },
      ],
      fragNumber: 8,
      fragSpacing: 45,
      fragBullet: {
        type: "bullet",
        lifetime: 48,
        speed: 40,
        hitSize: 6,
        trail: true,
        trailLifeFactor: 0.2,
        trailColour: [183, 142, 71],
        followsScreen: true,
        damage: [
          {
            type: "ballistic",
            amount: 8,
            levelScaling: 4,
          },
        ],
        drawer: {
          image: "box.wood",
          width: 50,
          height: 20,
        },
      },
    },
    pattern: {},
  },
});
Registry.weapons.add(".box-rotary-pain", {
  name: ".box-rotary-pain",
  rotate: false,
  shoot: {
    bullet: {
      type: "bullet",
      lifetime: 64,
      speed: 30,
      hitSize: 6,
      trail: true,
      trailLifeFactor: 0.2,
      trailColour: [183, 142, 71],
      damage: [
        {
          type: "ballistic",
          amount: 8,
          levelScaling: 4,
        },
      ],
      drawer: {
        image: "box.wood",
        width: 50,
        height: 20,
      },
    },
    pattern: {
      amount: 3,
      spacing: 120,
    },
  },
});

//## SUPER MONKEY ##
Registry.weapons.add(".super-monkey-throw", {
  name: ".super-monkey-throw",
  rotate: false,
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 40,
      speed: 0,
      pierce: 9999999,
      hitSize: -1000,
      trail: false,
      //Gives the impression of many shots
      intervalBullet: {
        lifetime: 45,
        speed: 45,
        hitSize: 5,
        trail: true,
        trailLifeFactor: 0.4,
        damage: [
          {
            type: "ballistic",
            amount: 0.5,
            levelScaling: 0.5,
          },
          {
            type: "no",
            amount: 0,
            area: 20,
            smokeColour: [0, 0, 0, 0],
            smokeColourTo: [0, 0, 0, 0],
            waveColour: [255, 255, 255, -2000],
            sparkColour: [255, 255, 255],
            sparkColourTo: [255, 255, 255],
          },
        ],
        drawer: {
          image: "bullet.normal", //should really be a dart but i don't have the asset
          width: 32,
          height: 16,
        },
      },
      intervalTime: 2,
      intervalNumber: 1,
      followsSource: true,
    },
    pattern: {},
  },
});
Registry.weapons.add(".super-monkey-shoot-laser", {
  name: ".super-monkey-throw",
  rotate: false,
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 40,
      speed: 0,
      pierce: 9999999,
      hitSize: -1000,
      trail: false,
      //Gives the impression of many shots
      intervalBullet: {
        lifetime: 45,
        speed: 45,
        hitSize: 5,
        trail: true,
        trailLifeFactor: 0.4,
        trailColour: [255, 0, 0],
        damage: [
          {
            type: "laser",
            amount: 1,
            levelScaling: 1,
          },
          {
            type: "no",
            amount: 0,
            area: 40,
            smokeColour: [0, 0, 0, 0],
            smokeColourTo: [0, 0, 0, 0],
            waveColour: [255, 255, 255, -2000],
            sparkColour: [255, 100, 100],
            sparkColourTo: [255, 0, 0, 0],
          },
        ],
        drawer: {
          shape: "ellipse",
          fill: "red",
          width: 32,
          height: 16,
        },
      },
      intervalTime: 2,
      intervalNumber: 2,
      intervalSpread: 10,
      followsSource: true,
    },
    pattern: {},
  },
});
//## ROBO-MONKEY ##
Registry.weapons.add(".robo-monkey-laser", {
  name: ".robo-monkey-laser",
  rotate: false,
  fireSound: "whirr",
  shoot: {
    bullet: {
      type: "continuous-laser",
      spawnSound: "laser-beam",
      lifetime: 30,
      length: 2000,
      pierce: 999,
      hitSize: 15,
      drawer: {
        shape: "rect",
        fill: [234, 84, 232],
      },
      followsSource: true,
      damage: [
        {
          amount: 2.5,
          type: "laser",
        },
      ],
      telegraph: {
        time: 45,
        follow: true,
      },
    },
    pattern: {},
  },
});
Registry.weapons.add(".robo-monkey-laser-impos", {
  name: ".robo-monkey-laser",
  rotate: false,
  fireSound: "whirr",
  shoot: {
    bullet: {
      type: "continuous-laser",
      spawnSound: "laser-beam",
      lifetime: 30,
      length: 2000,
      pierce: 999,
      hitSize: 15,
      drawer: {
        shape: "rect",
        fill: [234, 84, 232],
      },
      followsSource: true,
      damage: [
        {
          amount: 8,
          type: "laser",
        },
      ],
      telegraph: {
        time: 30,
        follow: true,
      },
    },
    pattern: {
      amount: 3,
      spacing: 20,
    },
  },
});
//## WORMS ##
Registry.weapons.add(".worm-gun", {
  get reload() {
    return rnd(180, 240);
  },
  shoot: {
    bullet: {
      type: "Bullet",
      lifetime: 60,
      speed: 60,
      hitSize: 7.5,
      damage: [
        {
          type: "laser",
          amount: 1,
          levelScaling: 1,
        },
      ],
      drawer: {
        shape: "ellipse",
        fill: "red",
        width: 30,
        height: 5,
      },
      trail: true,
      pierce: 1,
      trailColour: [255, 0, 0, 50],
    },
    pattern: {}, //Blank pattern
  },
  parts: [
    {
      type: "part",
      x: 0,
      y: 0,
      width: 25,
      height: 25,
      rotation: 0,
      slide: 0,
      colour: [0, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 16.25,
      y: 12.5,
      width: 17.5,
      height: 7.5,
      rotation: -18,
      slide: 0,
      colour: [56, 56, 56],
      image: false,
    },
    {
      type: "part",
      x: 16.25,
      y: -12.5,
      width: 17.5,
      height: 7.5,
      rotation: 18,
      slide: 0,
      colour: [56, 56, 56],
      image: false,
    },
    {
      type: "part",
      x: 16.25,
      y: 0,
      width: 7.5,
      height: 7.5,
      rotation: 0,
      slide: 0,
      colour: [56, 56, 56],
      image: false,
    },
    {
      type: "part",
      x: -15,
      y: 0,
      width: 5,
      height: 20,
      rotation: 0,
      slide: 0,
      colour: [56, 56, 56],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: -15,
      width: 17.5,
      height: 7.5,
      rotation: 0,
      slide: 0,
      colour: [56, 56, 56],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: 15,
      width: 17.5,
      height: 7.5,
      rotation: 0,
      slide: 0,
      colour: [56, 56, 56],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: -15,
      width: 12.5,
      height: 2.5,
      rotation: 0,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: 15,
      width: 12.5,
      height: 2.5,
      rotation: 0,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: 0,
      width: 20,
      height: 15,
      rotation: 0,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: 0,
      width: 15,
      height: 10,
      rotation: 0,
      slide: 0,
      colour: [0, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 16.25,
      y: -12.5,
      width: 7.5,
      height: 2.5,
      rotation: 18,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 16.25,
      y: 12.5,
      width: 7.5,
      height: 2.5,
      rotation: -18,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: -6.25,
      width: 7.5,
      height: 5,
      rotation: 0,
      slide: 0,
      colour: [0, 0, 0],
      image: false,
    },
    {
      type: "part",
      x: 0,
      y: -5,
      width: 2.5,
      height: 7.5,
      rotation: 0,
      slide: 0,
      colour: [255, 0, 0],
      image: false,
    },
  ],
});
