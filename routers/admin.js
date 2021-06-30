const express = require("express")
const { getDB } = require("../utils/db")

const adminRouter = express.Router()

// API #1 List all users
adminRouter.get("/users", async function (req, res) {
  const dbResult = await getDB().any(
    "SELECT ID, USERNAME, FORENAME, SURNAME FROM PUPIL;"
  )

  res.json({
    users: dbResult,
  })
  res.end()
})

// API #9 List all classes
adminRouter.get("/classes", async function (req, res) {
  const dbResult = await getDB().any("SELECT NAME FROM CLASS;")

  res.json({
    classes: dbResult,
  })
  res.end()
})

module.exports = adminRouter
