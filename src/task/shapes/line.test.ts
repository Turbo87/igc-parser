import Line from "./line";

describe('Line', () => {
  describe('checkTransition()', () => {
    it('returns undefined if the line was not crossed', () => {
      let line = new Line([0, 0], 10000, 90);
      expect(line.checkTransition([1, 0], [2, 0])).toBeUndefined();
    });

    it('returns undefined if the line was crossed in the wrong direction', () => {
      let line = new Line([0, 0], 10000, 90);
      expect(line.checkTransition([1, 0], [-1, 0])).toBeUndefined();
    });

    it('returns the fraction between the two fixes if the line was crossed in the right direction', () => {
      let line = new Line([0, 0], 10000, 90);
      expect(line.checkTransition([-1, 0], [1, 0])).toBeCloseTo(0.5);
      expect(line.checkTransition([-2, 0], [1, 0])).toBeCloseTo(0.6667);
      expect(line.checkTransition([-1, 0], [2, 0])).toBeCloseTo(0.3333);
    });
  });
});
