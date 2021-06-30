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
  const classes = await getDB().any("SELECT NAME FROM CLASS;")

  const response = []

  for (const classInfo of classes) {
    const subjects = await getDB().any(`
      SELECT NAME, ID 
      FROM SUBJECT JOIN OFFERS ON SUBJECT.ID = OFFERS.SUBJECT_ID
      WHERE OFFERS.CLASS_NAME = '${classInfo.name}'`)

    response.push({
      name: classInfo.name,
      subjects,
    })
  }

  res.json({
    classes: response,
  })
  res.end()
})

module.exports = adminRouter
