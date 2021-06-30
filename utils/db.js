const chalk = require("chalk")
const pgp = require("pg-promise")()

let db = null

module.exports.initDB = async function () {
  const DB_URL = "localhost:9000"
  const DB_PASSWORD = "Pass1234"
  const DB_USERNAME = "postgres"

  try {
    db = pgp(`postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_URL}`)

    await db.connect()

    console.log(chalk.green(`Success! Connected to postgres at ${DB_URL}`))
  } catch (err) {
    console.error("Failed to connect db!", err)
    process.exit(1)
  }
}

module.exports.getDB = function () {
  return db
}
