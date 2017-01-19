// Uses ES6 - transpile or use an evergreen browser
// constants capitalized by convention
// limited use of JSDoc annotation syntax

/* Sketch globals */
// number of entities in the system
const ENTITY_COUNT = 32; // tweak as necessary for performance
// base for scaling up to match actual screen resolution
const BASE_SCALE = 64; // base of 4 for less surprises with scaling, rendering
// percentage of area for entity placement
const INNER_AREA = .8; // leaves 10% of margin around initial placement

/* Key mapping for interactivity */
const KEYS = {
  'space': 32
};

/* Colour palettes from http://clrs.cc/ */
// grayscale backgrounds
const BASES = [
  '#111', // near-black
  '#333', // dark gray
  '#DDD' // silver
];
// bright accents
const ACCENTS = [
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

/* dynamic system variables */
let entities; // array of moving objects
let gravity; // allocatable gravity well

/** Represents a moving entity with position and velocity
  * @constructor
  */
const Entity = (position, sizeRange) => ({
  // position vector
  position, // shorthand ES6 object assignment
  // unique size of the entity
  size: random(...sizeRange), // within range provided
  // initial velocity
  velocity: createVector(random(-.75, .75), random(-.75, .75)),
  // trail following entity
  trail: new FixedArray(32) // adjust length for performance
});

/* P5 CALLBACKS */
function setup() {
  // initial central gravity well
  gravity = createVector(BASE_SCALE, BASE_SCALE).div(2); // halve the vector to center

  // populate with entities
  entities = buildArray(ENTITY_COUNT, () => Entity(
    // position within scale shifted back by 1 due to canvas starting position of 0
    createVector(random(BASE_SCALE-1), random(BASE_SCALE-1)),
    // size within aesthetically pleasing range
    [.25, 3.25]
  ));

  createCanvas(...getSize()); // spread from single call
  // visual adjustments
  strokeWeight(.25);
}

function draw() {
  /* Update state within system */
  var prev; // keep track for trail vector pairs
  entities.forEach(e => { // parse & change entities
    prev = e.position.copy(); // lock previous entity position
    // update position by current velocity
    e.position.add(computeVelocity({
      position: e.position,
      velocity: e.velocity
    }, gravity, BASE_SCALE));

    // update the trail with extracted coordinates
    e.trail.push(FlattenCoordinates(prev, e.position));
  });

  /* Prepare for drawing the frame */
  // clear over previous frame
  clear();
  // offset of origin for centering the sketch
  let offset = (min(height, width) * (1 - INNER_AREA) / 2); // account for margins
  // center in the middle
  translate(offset, offset);
  // ensure correct scale// ensure correct scale
  scale(getScale());
  // set drawing mode
  fill(colour.accent);
  stroke(colour.accent);

  /* Draw the current state */
  entities.forEach(e => { // parse entities
    // draw the trail
    e.trail.forEach(pair => { // lines need a coordinate pair
      line(...pair);
    });
    // draw the entity
    ellipse(e.position.x, e.position.y, e.size);
  });
}

// User interaction handlers
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

// screen resize handler for responsive canvas
function windowResized() {
  resizeCanvas(...getSize()); // spread from single call
}

/* CUSTOM UTILITIES */
/** Calculates new entity velocity. */
const computeVelocity = (entity, attractor, scalar) => {
  // p5.Vector mutates upon vector operations
  // preventive copying to avoid changing the global variables during calculation

  let change = attractor.copy() // avoid mutation of global vector
    .sub(entity.position) // difference between attractor & position
    .normalize() // to unit vector
    .div(scalar); // adjust by scalar to ensure scaling correctness

  // combining old velocity & change vector yields an updated velocity vector
  return entity.velocity.add(change);
}

/** Extended Array with set fixed length
  @constructor
  */
class FixedArray extends Array { // ES6 class syntax for convenience
  constructor(size) {
    super(); // invoke parent constructor
    // fixed size limit
    this._size = size; // naming by convention for private properties
  }
  push(x) {
    super.push(x); // invoke parent functionality
    // ensure length doesn't exceed size limit
    if (this.length > this._size) {
      super.shift();
    }
  }
}

/** Returns 2-value array of current screen dimensions. */
const getSize = () => new Array(2).fill(min(windowWidth, windowHeight));

/** Gets current scaling factor. */
const getScale = () => min(height, width) / BASE_SCALE * INNER_AREA;

/** Build an array of set length, populate with callback */
const buildArray = (n, func) => {
  let collection = [];
  for (var i = 0; i < n; i++) {
    collection.push(func());
  };
  return collection;
}

/** Turn coordinate pairs into flat array. */
const FlattenCoordinates = (...coords) => coords.reduce((previous, current) => {
  return previous.concat([current.x, current.y]);
}, []); // reduce into an array
