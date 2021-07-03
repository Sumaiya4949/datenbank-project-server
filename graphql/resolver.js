const { dbq } = require("../utils/db")
const { Teacher, Pupil, Class, Test } = require("./types")
const { v4: uuid } = require("uuid")
const { getPasswordHash } = require("../utils/helpers")

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

  test: async (args) => {
    const { id } = args
    const rows = await dbq(`SELECT * FROM TEST WHERE ID='${id}'`)

    if (rows.length === 0) return null

    return new Test(rows[0])
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

  createTest: async (args) => {
    const { teacherId, subjectId, test } = args

    // TODO: verify if its a teacher of this subject

    const testId = uuid()

    try {
      await dbq(
        `INSERT INTO TEST VALUES('${testId}', '${test.name}', '${test.date}')`
      )
      await dbq(`INSERT INTO HAS_TEST VALUES('${subjectId}', '${testId}')`)
    } catch {
      // TODO: undo all changes
      return null
    }

    const rows = await dbq(`SELECT * FROM TEST WHERE ID='${testId}'`)

    return new Test(rows[0])
  },

  editTest: async (args) => {
    const { id, teacherId, subjectId, test } = args

    // TODO: verify if its a teacher of this subject

    try {
      await dbq(
        `UPDATE TEST SET NAME='${test.name}', DATE='${test.date}' WHERE ID='${id}'`
      )
    } catch (err) {
      // TODO: undo all changes
      return null
    }

    const rows = await dbq(`SELECT * FROM TEST WHERE ID='${id}'`)

    return new Test(rows[0])
  },

  editScore: async (args) => {
    const { teacherId, pupilId, testId, score } = args

    // TODO: authenticate

    await dbq(
      `UPDATE APPEARS_IN SET SCORE='${score}' WHERE TEST_ID='${testId}' AND PUPIL_ID='${pupilId}'`
    )

    const rows = await dbq(
      `SELECT SCORE FROM APPEARS_IN WHERE TEST_ID='${testId}' AND PUPIL_ID='${pupilId}'`
    )

    return rows[0].score
  },

  createUser: async (args) => {
    const { adminId, user } = args

    // TODO: Verify admin by id

    const { role, forename, surname, username, password } = user

    const userId = uuid()

    const passwordHash = getPasswordHash(password)

    const tableName =
      role === "pupil"
        ? "PUPIL"
        : role === "teacher"
        ? "TEACHER"
        : role === "admin"
        ? "ADMIN"
        : null

    const rows = await dbq(
      `SELECT ID FROM ${tableName} WHERE USERNAME='${username}'`
    )

    if (rows.length) return Promise.reject("User already exists")

    try {
      await dbq(
        `INSERT INTO ${tableName} VALUES ('${userId}', '${username}', '${passwordHash}', '${forename}', '${surname}')`
      )
      return "Created"
    } catch (err) {
      return Promise.reject(err.message)
    }
  },
}
