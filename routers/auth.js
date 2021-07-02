const express = require("express")
const { dbq } = require("../utils/db")
const { getPasswordHash } = require("../utils/helpers")

const authRouter = express.Router()

authRouter.post("/login", async function (req, res) {
  const passwordHash = getPasswordHash(req.body.password)

  try {
    const rows = await dbq(
      `SELECT * FROM ${req.body.role.toUpperCase()} WHERE USERNAME='${
        req.body.username
      }' AND PASSWORD='${passwordHash}'`
    )

    if (rows.length === 0) {
      res.sendStatus(404)
      res.end()
      return
    }

    const loggedInUser = rows[0]
    const { id, surname, forename, username } = loggedInUser

    res.json({
      id,
      surname,
      forename,
      username,
    })
  } catch (err) {
    console.log(err)
    res.sendStatus(400)
    res.end()
  }
})

module.exports = authRouter
