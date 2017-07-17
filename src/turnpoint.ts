export class Turnpoint {
    name: string;
    altitude: number;
    location: any;
    observationZone: any;

    constructor(name: string, altitude: number, location, observationZone) {
    this.name = name;
    this.altitude = altitude;
    this.location = location;
    this.observationZone = observationZone;
  }
}
