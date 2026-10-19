/** Special boss tht changes the zone and gives souls when defeated. */
class FinalBoss extends Boss {
  dv = 1500;
  destinationWorld = "";
  //5s default delay
  transportDelay = 600;
  //When the boss dies,
  onDeath(source) {
    //Do all the stuff bosses do,
    super.onDeath(source);
    //but don't start spawning boxes yet
    world.reducedSpawns = true;
    //If there is a next world
    if (!this.world.endless) {
      if (Registry.worlds.has(this.destinationWorld)) {
        // disable most things
        this.world.transitioning = true;
        //Create an effect as a warning, 3/4 of the way through the transport delay
        Timer.main.do(
          () =>
            this.world.particles.push(
              new ShapeParticle(
                960,
                540,
                0,
                this.transportDelay * 0.25,
                0,
                0,
                "rect",
                col.hide(col.white),
                col.white,
                1080,
                1080,
                1920,
                1920,
                0,
                false,
              ),
            ),
          (this.transportDelay / 4) * 3,
        );
        //And add an operation to the timer
        Timer.main.do(
          () => {
            //To move the player to a world,
            moveToWorld(this.destinationWorld);
            //And save progress (again)
            saveGame();
          },
          //After the specified delay.
          this.transportDelay,
        );
      } else {
        //Create an effect as a warning, but don't wait
        this.world.particles.push(
          new ShapeParticle(960, 540, 0, this.transportDelay, 0, 0, "rect", col.hide(col.white), col.white, 1080, 1080, 1920, 1920, 0, false),
        );
        Timer.main.do(() => {
          //win and save it
          game.won = true;
          saveGame();
          playerWins();
        }, this.transportDelay);
      }
    }
    //Give souls
    if (game.originalMode === "adventure") addSouls(++game.zone);
  }
}
