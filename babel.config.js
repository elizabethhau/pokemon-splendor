module.exports = function (api) {
  api.cache(true);
  // Reanimated plugin is needed for app builds but breaks Jest — exclude in test env
  const plugins = process.env.NODE_ENV !== 'test' ? ['react-native-reanimated/plugin'] : [];
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
