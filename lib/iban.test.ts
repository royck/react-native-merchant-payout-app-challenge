import { isValidIban } from './iban';

describe('isValidIban', () => {
  it('accepts a valid IBAN with spaces', () => {
    expect(isValidIban('GB82 WEST 1234 5698 7654 32')).toBe(true);
  });

  it('rejects invalid check digits', () => {
    expect(isValidIban('GB81 WEST 1234 5698 7654 32')).toBe(false);
  });

  it('rejects incorrect country length and malformed values', () => {
    expect(isValidIban('GB82 WEST')).toBe(false);
    expect(isValidIban('123456789')).toBe(false);
  });
});
