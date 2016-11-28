// Uses ES6; transpile or use latest Chrome/Firefox
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
// current colour state
let colour = {
  accent: ACCENTS[0],
  base: BASES[1]
}

// GLOBALS, tweak as necessary
const ENTITY_COUNT = 32;
const LIMIT = 64; // scaling resolution
const INNER_AREA = .8; // percentage of area for entity placement
// interactive key map
const KEYS = {
  'space': 32 // toggle colour
};

// dynamic object collections
let entities;
let gravity;

// debug functions
let running; // pause state
let fr; // framerate memory
// pause the sketch for variable inspection
const PAUSE = () => {
  if (running) {
    frameRate(NaN); // stops drawing
  } else {
    frameRate(fr); // retur to previous framerate
  }
  running = !running; // toggle pause state
}

// utility functions
const getSize = () => new Array(2).fill(min(windowWidth, windowHeight)); // 2-value array
const getScale = () => min(height, width) / LIMIT * INNER_AREA; // scale factor

// construct new entity objects
const Entity = (pos, variance) => ({
  pos, // direct ES6 object assignment
  size: random(variance[0], variance[1]),
  vel: createVector(random(-.75, .75), random(-.75, .75)), // TODO proper values
  trail: new FixedArray(32)
});

// TODO create a new type of FixedArray
class FixedArray extends Array {
  constructor(size) {
    super();
    // fixed size limit
    this._size = size; // naming by convention for private attributes
  }
  push(x) {
    super.push(x);
    // ensure length doesn't exceed size limit
    if (this.length > this._size) {
      super.shift();
    }
  }
}

// CALLBACKS
function setup() {
  // init global gravity well
  gravity = createVector(LIMIT, LIMIT).div(2);
  // populate with entities
  entities = new Array(ENTITY_COUNT)
  .fill(undefined) // so .map() works
  .map(_ => Entity( // underscore for unneeded value
    createVector(random(LIMIT-1), random(LIMIT-1)),
    [.25, 3.25]
  ));
  createCanvas(...getSize()); // spread from single call
  // visual adjustments
  strokeWeight(.25);
  // all systems go
  running = true;
}

function draw() {
  fr = frameRate(); // register framerate

  // update state
  var prev;
  entities.forEach(e => { // iterate over entities
    prev = e.pos.copy(); // lock previous entity position
    // calculate position with forces applied
    e.pos.add(e.vel.add(gravity.copy().sub(e.pos).normalize().div(LIMIT)));
    // update the traiil
    e.trail.push([prev, e.pos.copy()]); // avoid mutation of position
  });

  // draw the state
  background(colour.base);

  let offset = (min(height, width) * (1 - INNER_AREA) / 2); // allocate margins
  translate(offset, offset); // center in the middle
  scale(getScale()); // ensure correct scale
  // set drawing mode
  fill(colour.accent);
  stroke(colour.accent);

  // draw state
  entities.forEach(e => { // parse entities with the new state
    let prev = e.pos;
    e.trail.forEach(pair => { // lines with start & end positions
     line(pair[0].x, pair[0].y, pair[1].x, pair[1].y);
    })
    // draw the entity
    ellipse(e.pos.x, e.pos.y, e.size);
  });
}

// INTERACTIVITY
function mouseReleased() {
  gravity = createVector(mouseX, mouseY).div(getScale()); // account for scale
}

function keyPressed() {
  switch (keyCode) {
    // change to random predefined color
    case KEYS['space']:
      colour.accent = random(ACCENTS);
      break;
    default:
      return;
  }
}

// screen resize handler
function windowResized() {
  resizeCanvas(...getSize()); // spread from single call
}
