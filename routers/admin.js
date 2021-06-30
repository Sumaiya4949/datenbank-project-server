const express = require("express")
const { getDB } = require("../utils/db")

const adminRouter = express.Router()

adminRouter.get("/users", async function (req, res) {
  const dbResult = await getDB().any(
    "SELECT ID, USERNAME, FORENAME, SURNAME FROM PUPIL;"
  )

  res.json(dbResult)
  res.end()
})

module.exports = adminRouter
