import * as turf from '@turf/turf';

import {Fix} from "./read-flight";

const Emitter = require('tiny-emitter');

export class TakeoffDetector {
  private _lastFix: Fix | undefined = undefined;

  flying: boolean = false;

  private readonly _emitter = new Emitter();

  update(fix: Fix) {
    let speed = this._currentSpeed(fix);
    let flying = this._isFlightSpeed(speed);

    if (flying && !this.flying) {
      this._emitter.emit('takeoff', fix)
    }
    if (!flying && this.flying) {
      this._emitter.emit('landing', fix)
    }

    this.flying = flying;
    this._lastFix = fix;
  }

  _currentSpeed(fix: Fix): number {
    if (!this._lastFix) return 0;

    let distance = turf.distance(this._lastFix.coordinate, fix.coordinate);
    let milliseconds = fix.time - this._lastFix.time;
    let hours = milliseconds / 3600000;
    return distance / hours;
  }

  _isFlightSpeed(speed: number): boolean {
    return speed > 50;
  }

  on(event: string, handler: Function) {
    return this._emitter.on(event, handler);
  }
}
