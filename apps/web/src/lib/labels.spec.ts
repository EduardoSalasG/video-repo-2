import { describe, it, expect } from 'vitest';
import { humanizeParamValue } from './labels';

describe('humanizeParamValue', () => {
  it('converts SNAKE_CASE values to readable labels', () => {
    expect(humanizeParamValue('MAMBO_ON2')).toBe('Mambo On2');
    expect(humanizeParamValue('SENSUAL_BACHATA')).toBe('Sensual Bachata');
    expect(humanizeParamValue('BEGGINNER')).toBe('Begginner');
  });

  it('handles single words and mixed input', () => {
    expect(humanizeParamValue('CASINO')).toBe('Casino');
    expect(humanizeParamValue('casino')).toBe('Casino');
  });
});
