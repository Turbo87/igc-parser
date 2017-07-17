import {ObservationZone} from "./oz";

export class Turnpoint {
    name: string;
    altitude: number;
    observationZone: ObservationZone;

    constructor(name: string, altitude: number, observationZone: ObservationZone) {
    this.name = name;
    this.altitude = altitude;
    this.observationZone = observationZone;
  }
}
