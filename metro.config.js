// metro.config.js (프로젝트 루트)
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// RN 0.73+/Expo SDK 50+ 기준
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
