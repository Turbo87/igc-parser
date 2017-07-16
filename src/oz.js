const turf = require('@turf/turf');

class Cylinder {
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
  }
}

class Line {
  constructor(center, length) {
    this.center = center;
    this.length = length;
  }

  update() {
    let p1 = turf.destination(this.center, this.length / 2000, this.bearing + 90);
    let p2 = turf.destination(this.center, this.length / 2000, this.bearing - 90);

    this.coordinates = [p1.geometry.coordinates, p2.geometry.coordinates];
  }
}

module.exports = { Cylinder, Line };
