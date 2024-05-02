const dotenv = require('dotenv').config()

const config = {
  MONGODB_URI: process.env.MONGODB_URI
}

module.exports = config
