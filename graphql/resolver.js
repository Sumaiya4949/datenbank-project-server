const { dbq } = require("../utils/db")
const { Teacher, Pupil, Class } = require("./types")

module.exports = {
  // Queries

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

  classes: async (args) => {
    const rows = await dbq(
      args.name
        ? `SELECT * FROM CLASS WHERE NAME='${args.name}'`
        : "SELECT * FROM CLASS;"
    )
    return rows.map((row) => new Class(row))
  },

  pupil: async (args) => {
    // Verify if its the logged in student

    const pupilRows = await dbq(`SELECT * FROM PUPIL WHERE ID='${args.id}'`)

    if (pupilRows.length === 0) return null

    return new Pupil(pupilRows[0])
  },

  teacher: async (args) => {
    // Verify if its the logged in teacher

    const teacherRows = await dbq(`SELECT * FROM TEACHER WHERE ID='${args.id}'`)

    if (teacherRows.length === 0) return null

    return new Teacher(teacherRows[0])
  },

  // Mutations
  editPupilInfo: async (args) => {
    const { id, userInfo } = args

    const { forename, surname } = userInfo

    await dbq(
      `UPDATE PUPIL SET FORENAME='${forename}', SURNAME='${surname}' WHERE ID='${id}';`
    )

    const pupilRows = await dbq(`SELECT * FROM PUPIL WHERE ID='${id}';`)
    return new Pupil(pupilRows[0])
  },

  editTeacherInfo: async (args) => {
    const { id, userInfo } = args

    const { forename, surname } = userInfo

    await dbq(
      `UPDATE TEACHER SET FORENAME='${forename}', SURNAME='${surname}' WHERE ID='${id}';`
    )

    const teacherRows = await dbq(`SELECT * FROM TEACHER WHERE ID='${id}';`)
    return new Teacher(teacherRows[0])
  },

  editAdminInfo: async (args) => {
    const { id, userInfo } = args

    const { forename, surname } = userInfo

    await dbq(
      `UPDATE ADMIN SET FORENAME='${forename}', SURNAME='${surname}' WHERE ID='${id}';`
    )

    const teacherRows = await dbq(`SELECT * FROM ADMIN WHERE ID='${id}';`)
    return teacherRows[0]
  },
}
