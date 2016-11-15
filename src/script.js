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

// GLOBALS
const ENTITY_COUNT = 128;
const LIMIT = 64; // scaling resolution
const INNER_AREA = .8; // percentage of area for entity placement

// dynamic object collections
let entities;
let gravity;

// utility functions
const getSize = () => new Array(2).fill(min(windowWidth, windowHeight)); // 2-value array
const getScale = () => min(height, width) / LIMIT * INNER_AREA; // scale factor
// construct new entity objects
const Entity = (pos, variance) => ({
  pos, // ES6 object assignment
  size: random(variance[0], variance[1]),
  vel: createVector(random(-.75, .75), random(-.75, .75)), // TODO proper values
  trail: []
});

function setup() {
  gravity = createVector(LIMIT, LIMIT).div(2);
  entities = new Array(ENTITY_COUNT)
  .fill(undefined)
  .map(_ => Entity(
    createVector(random(0, LIMIT-1), random(0, LIMIT-1)),
    [.25, 3.25]
  ));
  createCanvas(...getSize()); // spread from single call
  strokeWeight(.25);
}

function draw() {
  // calculate the new state
  entities.forEach(e => {
    e.pos.add(e.vel.add(gravity.copy().sub(e.pos).normalize().div(64)));
  });

  // draw the state
  background(BASES[1]);

  let offset = (min(height, width) * (1 - INNER_AREA) / 2); // allocate margins
  translate(offset, offset); // center in the middle
  scale(getScale()); // ensure correct scale

  // set drawing mode
  noFill();
  stroke(ACCENTS[0]);

  // draw
  entities.forEach(e => {
    ellipse(e.pos.x, e.pos.y, e.size);
  });
}

function mouseReleased() {
  gravity = createVector(mouseX, mouseY).div(getScale());
}

// screen resize handdler
function windowResized() {
  resizeCanvas(...getSize()); // spread from single call
}
