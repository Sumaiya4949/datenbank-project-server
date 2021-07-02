const express = require("express")
const { dbq } = require("../utils/db")
const { getPasswordHash } = require("../utils/helpers")

const authRouter = express.Router()

authRouter.get("/me", async function (req, res) {
  try {
    const rows = await dbq(
      `SELECT ID, USERNAME, FORENAME, SURNAME FROM ${req.session.userRole.toUpperCase()} WHERE ID='${
        req.session.userId
      }'`
    )
    res.json({
      ...rows[0],
      role: req.session.userRole,
    })
    res.end()
  } catch {
    res.statusCode = 400
    res.end("You are not logged in")
  }
})

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
      res.end("Invalid credentials")
      return
    }

    const loggedInUser = rows[0]
    const { id, surname, forename, username } = loggedInUser

    req.session.userRole = req.body.role
    req.session.userId = id
    req.session.save()

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
