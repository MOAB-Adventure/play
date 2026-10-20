Registry.bulletType.add("bullet", Bullet);
Registry.bulletType.add("missile", Missile);
Registry.bulletType.add("laser", LaserBullet);
Registry.bulletType.add("telegraph", LineTelegraph);
Registry.bulletType.add("continuous-laser", ContinuousLaserBullet);
Registry.bulletType.add("point", PointBullet);
Registry.bulletType.add("grab", GrabBullet);
Registry.bulletType.add("critical", CriticalBullet);
Registry.bulletType.add("chained", ChainedBullet);
Registry.bulletType.add("radiation-zone", RadiationZone);
Registry.bulletType.alias("radiation-zone", "fallout"); //Let "fallout" refer to the same thing as "radiation-zone"
Registry.bulletType.add("deflect", Deflection);
Registry.bulletType.add("arc-deflect", ArcDeflection);
Registry.bulletType.add("shield", Shield);
Registry.bulletType.add("shield-wall", ShieldWall);