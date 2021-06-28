module.exports = {
  mocha: {
    enableTimeouts: false,
    timeout: 250000
  },
  skipFiles: [
    'lib/',
    'interfaces/',
      'Alchemize.sol',
      'AlchemizeFactory.sol',
      'ConjureRouter.sol',
      'OpenOracleFrameworkLight.sol'
  ]
}
