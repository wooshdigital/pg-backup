module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json', '.native.js'],
          alias: {
            '@screens': './src/screens',
            '@components': './src/components',
            '@context': './src/context',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types',
            '@constants': './src/constants',
            '@navigation': './src/navigation',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};