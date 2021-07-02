const { dbq } = require("../utils/db")
const { Teacher, Pupil, Class } = require("./types")

module.exports = {
  hello: () => "Hello",

  admins: async () => {
    const rows = await dbq("SELECT * FROM ADMIN;")
    return rows
  },

  teachers: async () => {
    const rows = await dbq("SELECT * FROM TEACHER;")
    return rows.map((row) => new Teacher(row))
  },

  pupils: async () => {
    const rows = await dbq("SELECT * FROM PUPIL;")
    return rows.map((row) => new Pupil(row))
  },

  classes: async () => {
    const rows = await dbq("SELECT * FROM CLASS;")
    return rows.map((row) => new Class(row))
  },

  pupil: async (args) => {
    // Verify if its the logged in student

    const pupilRows = await dbq(`SELECT * FROM PUPIL WHERE ID='${args.id}'`)

    if (pupilRows.length === 0) return null

    return new Pupil(pupilRows[0])
  },
}
