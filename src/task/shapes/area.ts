import Point from "../../geo/point";
import Shape from "./base";

abstract class AreaShape implements Shape {
  abstract center: Point;

  abstract isInside(coordinate: Point): boolean;
}

export default AreaShape;
