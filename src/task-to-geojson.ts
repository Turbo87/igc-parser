import * as turf from "@turf/turf";

import * as oz from "./oz";
import Task from "./task";

export function taskToGeoJSON(task: Task) {
  let legs = turf.lineString(task.points.map(pt => pt.observationZone.center));

  let ozs = task.points.map((pt, i) => {
    let shape = pt.observationZone;

    if (shape instanceof oz.Line) {
      return turf.lineString(shape.coordinates);
    } else if (shape instanceof oz.Cylinder) {
      return turf.circle(shape.center, shape.radius / 1000);
    } else if (shape instanceof oz.Keyhole) {
      let circle = turf.circle(shape.center, shape.innerRadius / 1000);
      let sector = turf.sector(
        turf.point(shape.center),
        shape.outerRadius / 1000,
        shape.direction - shape.outerAngle / 2,
        shape.direction + shape.outerAngle / 2
      );

      return turf.union(circle, sector);
    }
  }).filter(Boolean) as GeoJSON.Feature<any>[];

  return turf.featureCollection([legs, ...ozs]);
}
