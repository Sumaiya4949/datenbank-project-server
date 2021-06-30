const express = require("express")
const { getDB } = require("../utils/db")

const pupilRouter = express.Router()

// API #3 Pupil's own info
pupilRouter.get("/info", async function (req, res) {
  const dbResult = await getDB().any(`
    SELECT ID, USERNAME, FORENAME, SURNAME FROM PUPIL
    WHERE ID = '${req.query.id}';
  `)

  res.json({
    ...dbResult[0],
  })
  res.end()
})

module.exports = pupilRouter
