const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sdkRoot = path.resolve(projectRoot, '../ppl-a4-sdk-react-native');

const config = getDefaultConfig(projectRoot);

// Watch the local SDK source so Metro picks up its files.
config.watchFolders = [sdkRoot];

// Packages that must always resolve to the app's single copy. The SDK is
// consumed as a sibling folder (not via npm) and has its own dev copies of
// these (different versions), which causes duplicate-package crashes when
// Metro bundles both. Force every import of these to the PoC's copy.
const dedupedPackages = new Set([
  'react',
  'react-native',
  'react-native-web',
  'react-native-device-info',
  'expo',
  'expo-sensors',
  'expo-modules-core',
]);

function isDedupedSpecifier(name) {
  if (dedupedPackages.has(name)) return true;
  if (name.startsWith('@react-native/')) return true;
  for (const pkg of dedupedPackages) {
    if (name.startsWith(pkg + '/')) return true;
  }
  return false;
}

config.resolver.extraNodeModules = {
  'ppl-a4-sdk-react-native': sdkRoot,
};

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isDedupedSpecifier(moduleName)) {
    // Resolve from the PoC root so Metro always finds the app's copy.
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, 'package.json') },
      moduleName,
      platform
    );
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(sdkRoot, 'node_modules'),
];

module.exports = config;
