const express = require("express")
const chalk = require("chalk")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const session = require("express-session")
const fs = require("fs")
const cors = require("cors")
const rootResolver = require("./graphql/resolver")
const authRouter = require("./routers/auth")
const { initDB } = require("./utils/db")

async function createServer() {
  await initDB()

  const schema = buildSchema(
    fs.readFileSync("./graphql/schema.graphql", { encoding: "utf-8" })
  )

  const app = express()

  app.set("trust proxy", 1)

  app.use(cors())

  app.use(
    session({
      name: "sid",
      cookie: { secure: process.env === "production" },
      sameSite: "none",
      resave: true,
      saveUninitialized: false,
      secret: "1567",
    })
  )

  app.use(express.json())

  app.use(
    express.urlencoded({
      extended: true,
    })
  )

  app.use("/auth", authRouter)

  app.use(
    "/graphql",
    graphqlHTTP((req) => {
      return {
        schema: schema,
        rootValue: rootResolver,
        graphiql: true,
        context: {
          sessionUserId: req.session.userId,
          sessionUserRole: req.session.userRole,
        },
      }
    })
  )

  app.listen("5000", () => {
    console.log(chalk.green("Success! Server running at localhost:5000"))
    console.log(chalk.blue("GraphQL APIs running at localhost:5000/graphql"))
    console.log(chalk.blue("Auth APIs running at localhost:5000/auth"))
  })
}

createServer()
