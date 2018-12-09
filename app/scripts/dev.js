
import Log from 'utils/log'

module.exports = function(config) {
  const eslintLoader = config.module.rules[0]
  eslintLoader.use[0].options.useEslintrc = true

  const loaderList = config.module.rules[1].oneOf
  loaderList.splice(loaderList.length - 1, 0, {
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
  })
}
