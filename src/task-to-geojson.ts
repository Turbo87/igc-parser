import * as turf from "@turf/turf";
import {Cylinder, Keyhole, Line} from "./task/shapes";
import Task from "./task";

export function taskToGeoJSON(task: Task) {
  let legs = turf.lineString(task.points.map(pt => pt.shape.center));

  let ozs = task.points.map((pt, i) => {
    let shape = pt.shape;

    if (shape instanceof Line) {
      return turf.lineString(shape.coordinates);
    } else if (shape instanceof Cylinder) {
      return turf.circle(shape.center, shape.radius / 1000);
    } else if (shape instanceof Keyhole) {
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
