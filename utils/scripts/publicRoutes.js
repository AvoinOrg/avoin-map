const appletConf = require('../../appletConf.json')
const {
  createPublicRouteContract,
} = require('../../src/common/routing/publicRouteContract/index.js')

module.exports = {
  ...createPublicRouteContract(appletConf),
  createPublicRouteContract,
}
