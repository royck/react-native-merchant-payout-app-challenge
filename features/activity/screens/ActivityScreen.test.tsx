import { describe, expect, it } from '@jest/globals';

import { formatDate } from './ActivityScreen';

describe('formatDate', () => {
  it('formats activity dates as DD MM YYYY', () => {
    expect(formatDate('2026-11-03T10:00:00')).toBe('03 11 2026');
  });
});
