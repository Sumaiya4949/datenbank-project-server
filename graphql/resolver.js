const { getDB } = require("../utils/db")
const { Teacher, Pupil, Class } = require("./types")

module.exports = {
  hello: () => "Hello",

  admins: async () => {
    const rows = await getDB().any("SELECT * FROM ADMIN;")
    return rows
  },

  teachers: async () => {
    const rows = await getDB().any("SELECT * FROM TEACHER;")
    return rows.map((row) => new Teacher(row))
  },

  pupils: async () => {
    const rows = await getDB().any("SELECT * FROM PUPIL;")
    return rows.map((row) => new Pupil(row))
  },

  classes: async () => {
    const rows = await getDB().any("SELECT * FROM CLASS;")
    return rows.map((row) => new Class(row))
  },
}
