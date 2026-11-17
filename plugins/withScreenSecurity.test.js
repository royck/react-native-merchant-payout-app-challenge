const { describe, expect, it } = require('@jest/globals');
const {
  addAndroidPermissions,
  addFaceIdUsageDescription,
} = require('./withScreenSecurity');

describe('ScreenSecurity config plugin helpers', () => {
  it('adds both required Android permissions', () => {
    const manifest = addAndroidPermissions({});
    const names = manifest['uses-permission'].map(
      (permission) => permission.$['android:name']
    );

    expect(names).toEqual(
      expect.arrayContaining([
        'android.permission.DETECT_SCREEN_CAPTURE',
        'android.permission.USE_BIOMETRIC',
      ])
    );
  });

  it('does not duplicate Android permissions', () => {
    const manifest = addAndroidPermissions({});

    expect(addAndroidPermissions(manifest)['uses-permission']).toHaveLength(2);
  });

  it('adds the Face ID usage description when missing', () => {
    expect(addFaceIdUsageDescription({}).NSFaceIDUsageDescription)
      .toMatch(/Face ID/);
  });

  it('preserves a custom Face ID usage description', () => {
    const infoPlist = { NSFaceIDUsageDescription: 'Custom description' };

    expect(addFaceIdUsageDescription(infoPlist).NSFaceIDUsageDescription)
      .toBe('Custom description');
  });
});
