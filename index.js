const express = require("express")
const chalk = require("chalk")
const { initDB } = require("./utils/db")
const adminRouter = require("./routers/admin")

async function createServer() {
  await initDB()

  const app = express()

  app.use("/admin", adminRouter)

  app.listen("5000", () =>
    console.log(chalk.blue("Server running at localhost:5000"))
  )
}

createServer()
