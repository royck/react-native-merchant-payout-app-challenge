const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

function withScreenSecurity(config) {
  config = withInfoPlist(config, (modConfig) => {
    modConfig.modResults.NSFaceIDUsageDescription =
      'Face ID is used to securely confirm payouts over £1,000.';
    return modConfig;
  });

  config = withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const permissions = manifest['uses-permission'] ?? [];
    const requiredPermissions = [
      'android.permission.DETECT_SCREEN_CAPTURE',
      'android.permission.USE_BIOMETRIC',
    ];
    for (const permissionName of requiredPermissions) {
      if (!permissions.some((permission) => permission.$?.['android:name'] === permissionName)) {
        permissions.push({ $: { 'android:name': permissionName } });
      }
    }
    manifest['uses-permission'] = permissions;
    return modConfig;
  });

  return config;
}

module.exports = withScreenSecurity;
