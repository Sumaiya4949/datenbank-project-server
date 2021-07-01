const express = require("express")
const chalk = require("chalk")
const { initDB } = require("./utils/db")
const { graphqlHTTP } = require("express-graphql")
const { buildSchema } = require("graphql")
const fs = require("fs")
const rootResolver = require("./graphql/resolver")
const authRouter = require("./routers/auth")

async function createServer() {
  await initDB()

  // Construct a schema, using GraphQL schema language
  const schema = buildSchema(
    fs.readFileSync("./graphql/schema.graphql", { encoding: "utf-8" })
  )

  const app = express()

  app.use("/auth", authRouter)

  app.use(
    "/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: rootResolver,
      graphiql: true,
    })
  )

  app.listen("5000", () =>
    console.log(chalk.blue("Server running at localhost:5000"))
  )
}

createServer()
