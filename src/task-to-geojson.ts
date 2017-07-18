import * as turf from "@turf/turf";

import * as oz from "./oz";
import {Task} from "./read-task";

export function taskToGeoJSON(task: Task) {
  let legs = turf.lineString(task.points.map(pt => pt.observationZone.center));

  let ozs = task.points.map((pt, i) => {
    if (pt.observationZone instanceof oz.Line) {
      return turf.lineString(pt.observationZone.coordinates);
    } else if (pt.observationZone instanceof oz.Cylinder) {
      return turf.circle(pt.observationZone.center, pt.observationZone.radius / 1000);
    }
  }).filter(Boolean) as GeoJSON.Feature<any>[];

  return turf.featureCollection([legs, ...ozs]);
}
