const express = require("express")
const chalk = require("chalk")
const { initDB } = require("./utils/db")
const adminRouter = require("./routers/admin")
const teacherRouter = require("./routers/teacher")
const pupilRouter = require("./routers/pupil")

async function createServer() {
  await initDB()

  const app = express()

  app.use("/admin", adminRouter)
  app.use("/teacher", teacherRouter)
  app.use("/pupil", pupilRouter)

  app.listen("5000", () =>
    console.log(chalk.blue("Server running at localhost:5000"))
  )
}

createServer()
