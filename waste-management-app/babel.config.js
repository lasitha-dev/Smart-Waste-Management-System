module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-react',
      '@babel/preset-flow'
    ],
    plugins: [
      '@babel/plugin-syntax-jsx',
      '@babel/plugin-syntax-flow'
    ]
  };
};


