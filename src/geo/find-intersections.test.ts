import {findIntersection, findIntersections} from './find-intersections';
import Point from './point';

const POLYGON = [
  [6.2127685546875, 50.9151558824997],
  [6.0919189453125, 50.85450904781293],
  [6.248474121093749, 50.71559113343383],
  [6.512145996093749, 50.70167663576478],
  [6.70989990234375, 50.82502352402512],
  [6.34735107421875, 50.77815527465925],
  [6.50390625, 50.91169247570917],
  [6.26495361328125, 50.875311142200765],
  [6.2127685546875, 50.9151558824997],
] as Point[];

const LINE1 = [
  [6.51763916015625, 50.776418510713576],
  [6.185302734375, 50.98609893339354],
] as [Point, Point];

const LINE2 = [
  [6.490173339843749, 50.74166968624287],
  [6.3446044921875, 50.74688365485319],
] as [Point, Point];

const LINE3 = [
  [6.1468505859375, 50.93420001306366],
  [6.17156982421875, 50.85624291019714],
] as [Point, Point];

const LINE4 = [
  [6.6851806640625, 50.76078473271486],
  [6.6192626953125, 50.84410451978964],
] as [Point, Point];

const LINE5 = [
  [6.18255615234375, 50.93852713736125],
  [6.288299560546875, 50.970535344046034],
] as [Point, Point];

describe('findIntersection()', () => {
  test(`line1 + line5`, () => {
    let intersection = findIntersection(LINE1, LINE5);
    expect(intersection).toBeCloseTo(0.849);
  });

  test(`line2 + line5`, () => {
    let intersection = findIntersection(LINE2, LINE5);
    expect(intersection).toBeNull();
  });

  test(`line5 + line1`, () => {
    let intersection = findIntersection(LINE5, LINE1);
    expect(intersection).toBeCloseTo(0.5);
  });
});

describe('findIntersections()', () => {
  test(`line1 + polygon`, () => {
    let intersections = findIntersections(LINE1, POLYGON);
    expect(intersections.length).toEqual(3);
    expect(intersections[0]).toBeCloseTo(0.094);
    expect(intersections[1]).toBeCloseTo(0.298);
    expect(intersections[2]).toBeCloseTo(0.528);
  });

  test(`line2 + polygon`, () => {
    let intersections = findIntersections(LINE2, POLYGON);
    expect(intersections.length).toEqual(0);
  });

  test(`line3 + polygon`, () => {
    let intersections = findIntersections(LINE3, POLYGON);
    expect(intersections.length).toEqual(1);
    expect(intersections[0]).toBeCloseTo(0.577);
  });

  test(`line4 + polygon`, () => {
    let intersections = findIntersections(LINE4, POLYGON);
    expect(intersections.length).toEqual(2);
    expect(intersections[0]).toBeCloseTo(0.392);
    expect(intersections[1]).toBeCloseTo(0.666);
  });

  test(`line5 + polygon`, () => {
    let intersections = findIntersections(LINE5, POLYGON);
    expect(intersections.length).toEqual(0);
  });

  test(`line1 + line5`, () => {
    let intersections = findIntersections(LINE1, LINE5);
    expect(intersections.length).toEqual(1);
    expect(intersections[0]).toBeCloseTo(0.849);
  });

  test(`line2 + line5`, () => {
    let intersections = findIntersections(LINE2, LINE5);
    expect(intersections.length).toEqual(0);
  });

  test(`line5 + line1`, () => {
    let intersections = findIntersections(LINE5, LINE1);
    expect(intersections.length).toEqual(1);
    expect(intersections[0]).toBeCloseTo(0.499);
  });
});
