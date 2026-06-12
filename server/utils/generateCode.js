const crypto = require('crypto') // built into Node, no install needed

// Generates a code like "AB12CD34" — 8 chars, uppercase alphanumeric
const generateCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
  // randomBytes(4) = 4 random bytes = 8 hex characters
}

module.exports = generateCode