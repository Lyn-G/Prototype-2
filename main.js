title = "Arrow";

let Highscores = []

description = `
Collect Speed Boosts
`;

characters = [
  `
   ll  
 llll
llll
 lll
  l
`,
  `
  l  
 lll
llll
 llll
   ll
`,
  `
ll   
 lll
lllll
 lll 
ll 
`,
  `
rrr
 rrr   
  rrr
 rrr
rrr
`,
];

const G = {
  WIDTH: 150,
  HEIGHT: 100,

  TrailRate: 4,
  TrailOffset: 3,

  TrailSpeed: 5,
};

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  theme: "shapeDark",
};

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type  { Star [] }
 */
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Triangle
 */

/**
 * @type  { Triangle [] }
 */
let Triangle;

/**
 * @typedef {{
 * pos: Vector,
 * boostFactor: number
 * }} SpeedBoost
 */

/**
 * @type  { SpeedBoost }
 */
let speedBoost;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean
 * }} Player
 */

/**
 * @type { Player }
 */

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;
let player;
let speed = 1;
let holdTime = 0;
let direction = 2;
let prevDirection = 2;
let boostBreak = 200;
let boostCollected = false;
let deathTimer = 2000;
let fTriangle;

//globals
let ypointtip = 50;
let ypointbottom = 0;



function update() {
  if (!ticks) {
    deathTimer = 2000;
    stars = times(20, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
        pos: vec(posX, posY),
        // More RNG
        speed: rnd(speed - 0.5, speed),
      };
    });
    player = {
      pos: vec(G.WIDTH * 0.3, G.HEIGHT * 0.5),
      firingCooldown: 8 * speed,
      isFiringLeft: true,
    };
    speedBoost = {
      pos: vec(G.WIDTH - 5, rnd(0, G.HEIGHT)),
      boostFactor: 2,
    };
    fBullets = [];
    fTriangle = [];
    fTriangle.push({
      pos: vec(G.WIDTH - 5, rnd(0, G.HEIGHT)),
      speed: speed,
    });

  }
  fTriangle.forEach((t) => {
    updateTriangle(t);
  });

  stars.forEach((s) => {
    // Move the star downwards
    s.pos.x -= s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("red");
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });

  if (input.isPressed) holdTime++;
  else if (input.isJustReleased) holdTime = 0;

  if (input.isJustReleased && direction == 2) direction = 0;
  else if (input.isJustReleased && direction == 0) direction = 2;
  else if (input.isPressed) prevDirection = direction;

  // else if (input.isPressed) direction = 1;
  if (input.isPressed && holdTime > 5) {
    player.pos.y += 0;
    color("black");
    char("c", player.pos);
  } else if (direction == 0) {
    player.pos.y += speed;
    color("black");
    char("b", player.pos);
  } else if (direction == 2) {
    player.pos.y -= speed;
    color("black");
    char("a ", player.pos);
  }
  player.pos.clamp(0, G.WIDTH, 1, G.HEIGHT - 2);

  player.firingCooldown--;
  // Time to fire the next shot
  if (player.firingCooldown <= 0) {
    // Create the bullet
    if (direction == 2) {
      fBullets.push({
        pos: vec(player.pos.x + 1, player.pos.y),
      });
    } else if (direction == 0) {
      fBullets.push({
        pos: vec(player.pos.x + 2, player.pos.y),
      });
    }
    // Reset the firing cooldown
    player.firingCooldown = 2;
  }

  // Updating and drawing bullets
  fBullets.forEach((fb) => {
    // Move the bullets upwards
    fb.pos.x -= speed;

    // Drawing
    color("yellow");
    box(fb.pos, 1);
  });
  remove(fBullets, (fb) => {
    return fb.pos.x < 0;
  });

  const speedBoostCollected = char("d", speedBoost.pos).isColliding.rect.yellow;

  if (speedBoostCollected && !boostCollected) {
    speed += 0.1;
    speedBoost.pos = vec(-5, rnd(0, G.HEIGHT));
    boostCollected = true;
    deathTimer = 2000;
    addScore(10 * speed, player.pos);
  }
  speedBoost.pos.x -= speed;
  if (speedBoost.pos.x < 0 || boostCollected) {
    boostBreak--;
  }
  if (boostBreak <= 0 && speedBoost.pos.x < 0) {
    speedBoost.pos = vec(G.WIDTH, rnd(0, G.HEIGHT));
    boostBreak = 200 / speed;
    boostCollected = false;
  }
  char("d", speedBoost.pos);

  deathTimer -= speed;
  if (deathTimer <= 0) end(getHighscoreText());
}

function updateTriangle(object) {
  color("purple");
  line(20 + object.pos.x, ypointbottom, 65 + object.pos.x, ypointtip);
  line(65 + object.pos.x, ypointtip, 110 + object.pos.x, ypointbottom);

  object.pos.x -= speed;
  if (object.pos.x < -110) {
    object.pos.wrap(0, G.WIDTH + 80, 0, G.HEIGHT + 80);

    //if it wraps, change coordinates
    ypointtip = rnd(10, G.HEIGHT-10); //randomizes top of triangle

    let coin = rnd(0,2);            //50/50 chance to spawn triangle at top/bottom
    if (coin == 0) ypointbottom = 0;
    else ypointbottom = G.HEIGHT;
  }

  if (char("c", player.pos).isColliding.rect.purple) end(getHighscoreText());
}

function getHighscoreText(){
  if (score > 0 && Highscores.indexOf(score) == -1 ){
    Highscores.push(Math.floor(score))
    Highscores.sort()
    Highscores.reverse()
  }
  console.log(Highscores.join())

  return `Highscores:\n${Highscores}`
}
