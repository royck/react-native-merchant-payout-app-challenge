import { isValidIban } from './iban';

describe('isValidIban', () => {
  it('accepts the valid README example', () => {
    expect(isValidIban('GB29NWBK60161331926819')).toBe(true);
  });

  it('rejects the invalid README example', () => {
    expect(isValidIban('FR1212345123451234567A12310131231231231')).toBe(false);
  });

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
