const { SHA3 } = require("sha3")

function getPasswordHash(password) {
  const hash = new SHA3(512)
  hash.update(password)
  return hash.digest("hex")
}

module.exports = {
  getPasswordHash,
}
