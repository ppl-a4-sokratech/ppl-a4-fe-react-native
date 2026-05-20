const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sdkRoot = path.resolve(projectRoot, '../ppl-a4-sdk-react-native');

const config = getDefaultConfig(projectRoot);

// Watch the local SDK source so Metro picks up its files.
config.watchFolders = [sdkRoot];

// Resolve the SDK by name without installing it as an npm dependency.
// Force react / react-native to the app's single copy to avoid duplicates.
config.resolver.extraNodeModules = {
  'ppl-a4-sdk-react-native': sdkRoot,
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
