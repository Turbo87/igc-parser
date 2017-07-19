import Cylinder from "./cylinder";

describe('Cylinder', () => {
  describe('checkTransition()', () => {
    it('returns undefined if the cylinder was not entered', () => {
      let line = new Cylinder([0, 0], 10000);
      expect(line.checkEnter([1, 0], [2, 0])).toBeUndefined();
    });

    it('returns undefined if the cylinder was left', () => {
      let line = new Cylinder([0, 0], 10000);
      expect(line.checkEnter([0, 0], [1, 0])).toBeUndefined();
    });

    it('returns the fraction between the two fixes if the cylinder was entered', () => {
      let line = new Cylinder([0, 0], 10000);

      // 1 deg = 111 km at the equator -> entered the cylinder after 101 km
      expect(line.checkEnter([1, 0], [0, 0])).toBeCloseTo(101111 / 111111);
    });
  });
});
