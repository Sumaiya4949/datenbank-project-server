const express = require("express")
const { getDB } = require("../utils/db")

const teacherRouter = express.Router()

// API #2 Teacher's own info
teacherRouter.get("/info", async function (req, res) {
  const dbResult = await getDB().any(`
    SELECT ID, USERNAME, FORENAME, SURNAME FROM TEACHER
    WHERE ID = '${req.query.id}';
  `)

  res.json({
    ...dbResult[0],
  })
  res.end()
})

module.exports = teacherRouter
