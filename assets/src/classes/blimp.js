//Basically just a storage class for entity properties
//Properties on any entity this is applied to are overriden by these ones
class Blimp {
  health = 200;
  name = "MOAB";
  description = "";
  speed = 6;
  resistances = {};
  drawer = {
    shape: "circle",
    fill: "red",
    image: "error",
    width: 100,
    height: 100,
  };
  positions = [];
  weaponSlots = [];
  hitSize = 75;

  hasBooster = false;
  boosterPos = { x: 0, y: 0 };

  //Upgrade info
  path1 = "none";
  path2 = "none";
  cost = {
    shards: 0,
    bloonstones: 0,
  };

  minion = null;
  minionCooldown = 1200;

  /**@param {Entity} entity*/
  upgradeEntity(entity) {
    entity.maxHealth = this.health;
    entity.health = this.health; //Heal
    entity.name = this.name;
    entity.speed = this.speed;
    entity.hitSize = this.hitSize;
    //Make entity know it is this
    entity.blimp = this;
    //Put these resistances in there, overriding others
    entity.resistances = Object.assign({}, this.resistances);
    entity.drawer = this.drawer;
    //Set positions
    for (let i = 0; i < entity.weaponSlots.length; i++) {
      //Stop if position not defined
      if (!this.positions[i]) break;
      //If defined, move slot
      entity.weaponSlots[i].posX = this.positions[i].x;
      entity.weaponSlots[i].posY = this.positions[i].y;
    }
    if (entity.weaponSlots[5]) {
      entity.weaponSlots[5].posX = this.boosterPos.x;
      entity.weaponSlots[5].posY = this.boosterPos.y;
    }

    if (entity === game.player) {
      //Only continue if player
      //Set UI conditions
      UIComponent.setCondition("is-ap1-available:" + this.weaponSlots.includes(1)); //Set AP1 availability to a Boolean expression
      UIComponent.setCondition("is-ap2-available:" + this.weaponSlots.includes(2));
      UIComponent.setCondition("is-ap3-available:" + this.weaponSlots.includes(3));
      UIComponent.setCondition("is-ap4-available:" + this.weaponSlots.includes(4));
      UIComponent.setCondition("is-ap5-available:" + this.weaponSlots.includes(5));
      UIComponent.setCondition("is-booster-available:" + this.hasBooster);
    }
    if (entity === game.support) {
      //Only continue if player
      //Set UI conditions
      UIComponent.setCondition("is-sp1-available:" + this.weaponSlots.includes(1)); //Set AP1 availability to a Boolean expression
    }
  }
}
