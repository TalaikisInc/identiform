const rewire = require('rewire')
const proxyquire = require('proxyquire')

switch (process.argv[2]) {
  case 'start':
    rewireModule('react-scripts/scripts/start.js', loadCustomizer('../dev'))
    break
  case 'build':
    rewireModule('react-scripts/scripts/build.js', loadCustomizer('../prod'))
    break
  case 'test':
    const customizer = loadCustomizer('../test')
    proxyquire('react-scripts/scripts/test.js', {
      '../utils/createJestConfig': (...args) => {
        const createJestConfig = require('react-scripts/utils/createJestConfig')
        return customizer(createJestConfig(...args))
      }
    })
    break
  default:
    console.log('custom config only supports "start", "build", and "test" options.')
    process.exit(-1)
}

function loadCustomizer(module) {
  try {
    return require(module)
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    }
  }

  return config => config
}

function rewireModule(modulePath, customizer) {
  const defaults = rewire(modulePath)
  const config = defaults.__get__('config')
  customizer(config)
}
