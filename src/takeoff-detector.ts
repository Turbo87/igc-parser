import * as turf from '@turf/turf';

import {Fix} from "./read-flight";

export class TakeoffDetector {
  private _lastFix: Fix | undefined = undefined;

  onTakeoff: (fix: Fix) => void;
  onLanding: (fix: Fix) => void;

  flying: boolean = false;

  update(fix: Fix) {
    let speed = this._currentSpeed(fix);
    let flying = this._isFlightSpeed(speed);

    if (flying && !this.flying && this.onTakeoff) {
      this.onTakeoff(fix);
    }
    if (!flying && this.flying && this.onLanding) {
      this.onLanding(fix);
    }

    this.flying = flying;
    this._lastFix = fix;
  }

  _currentSpeed(fix): number {
    if (!this._lastFix) return 0;

    let distance = turf.distance(this._lastFix.coordinate, fix.coordinate);
    let seconds = fix.secOfDay - this._lastFix.secOfDay;
    return distance / (seconds / 3600);
  }

  _isFlightSpeed(speed: number): boolean {
    return speed > 50;
  }
}
