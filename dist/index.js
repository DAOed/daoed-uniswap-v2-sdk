
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./uniswap-v2-sdk-core.cjs.production.min.js')
} else {
  module.exports = require('./uniswap-v2-sdk-core.cjs.development.js')
}
