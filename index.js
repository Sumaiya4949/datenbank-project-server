const express = require("express")

const app = express()

app.get("/sayhello", function (req, res) {
  res.json({
    message: "hello"
  })
  res.end()
})

app.listen("5000", () => console.log("Server running at localhost:5000"))
