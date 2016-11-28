// Uses ES6
// define color schema here (hex codes from http://clrs.cc/)
const BASES = [ // grayscale dark to light
  '#111', // near-black
  '#333', // dark gray
  '#DDD' // silver
];
const ACCENTS = [ // bright accents
  '#0074D9', // blue
  '#01FF70', // lime green
  '#FFDC00', // yellow
  '#FF4136 ' // red
];
let colour = {
  accent: ACCENTS[0],
  base: BASES[1]
}

// GLOBALS
const ENTITY_COUNT = 32;
const LIMIT = 64; // scaling resolution
const INNER_AREA = .8; // percentage of area for entity placement

// dynamic object collections
let entities;
let gravity;

// debug stuff
//const FR = (n) => frameRate(n);
let running;
let fr;
const PAUSE = () => {
  if (running) {
    frameRate(NaN);
  } else {
    frameRate(fr);
  }
  running = !running;
}


// utility functions
const getSize = () => new Array(2).fill(min(windowWidth, windowHeight)); // 2-value array
const getScale = () => min(height, width) / LIMIT * INNER_AREA; // scale factor
// construct new entity objects
const Entity = (pos, variance) => ({
  pos, // ES6 object assignment
  size: random(variance[0], variance[1]),
  vel: createVector(random(-.75, .75), random(-.75, .75)), // TODO proper values
  trail: new FixedArray(32)
});
const KEYS = {
  'space': 32
};

// TODO create a new type of FixedArray
class FixedArray extends Array {
  constructor(size) {
    super();
    this._size = size;
  }
  push(x) {
    super.push(x);
    if (this.length > this._size) {
      super.shift();
    }
  }
}

function setup() {
  gravity = createVector(LIMIT, LIMIT).div(2);
  entities = new Array(ENTITY_COUNT)
  .fill(undefined)
  .map(_ => Entity(
    createVector(random(LIMIT-1), random(LIMIT-1)),
    [.25, 3.25]
  ));
  createCanvas(...getSize()); // spread from single call
  strokeWeight(.25);
  running = true;
}

function draw() {
  fr = frameRate();
  var prev;
  entities.forEach(e => {
    prev = e.pos.copy();
    e.pos.add(e.vel.add(gravity.copy().sub(e.pos).normalize().div(LIMIT)));
    e.trail.push([prev, e.pos.copy()]); // avoid mutation?
  });

  // draw the state
  background(colour.base);

  let offset = (min(height, width) * (1 - INNER_AREA) / 2); // allocate margins
  translate(offset, offset); // center in the middle
  scale(getScale()); // ensure correct scale

  // set drawing mode
  fill(colour.accent);
  stroke(colour.accent);

  // draw
  entities.forEach(e => {
    let prev = e.pos;
    e.trail.forEach(pair => {
     line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
    })
    ellipse(e.pos.x, e.pos.y, e.size);
  });
}

function mouseReleased() {
  gravity = createVector(mouseX, mouseY).div(getScale());
}
function keyPressed() {
  switch (keyCode) {
    case KEYS['space']:
      colour.accent = random(ACCENTS);
      break;
    default:
      return;
  }
}

// screen resize handdler
function windowResized() {
  resizeCanvas(...getSize()); // spread from single call
}
