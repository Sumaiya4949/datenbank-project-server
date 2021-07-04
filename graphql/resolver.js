const { dbq } = require("../utils/db")
const { Teacher, Pupil, Class, Test, Subject } = require("./types")
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

  subjects: async (args) => {
    const rows = await dbq(`SELECT * FROM SUBJECT`)

    return rows.map((row) => new Subject(row))
  },

  gradesheet: async (args) => {
    const { pupilId } = args

    const rows = await dbq(`
      WITH GRADES AS (
        SELECT
          SUBJECT.ID AS SUBJECT_ID, SUBJECT.NAME AS SUBJECT_NAME, OFFERS.CLASS_NAME AS CLASS_NAME, APPEARS_IN.SCORE AS SCORE
        
        FROM 
        HAS_TEST JOIN APPEARS_IN 
          ON HAS_TEST.TEST_ID = APPEARS_IN.TEST_ID
        JOIN SUBJECT
          ON SUBJECT.ID = HAS_TEST.SUBJECT_ID
        JOIN OFFERS
          ON SUBJECT.ID = OFFERS.SUBJECT_ID

        WHERE APPEARS_IN.PUPIL_ID = '${pupilId}'
      )

      SELECT SUBJECT_ID, SUBJECT_NAME, CLASS_NAME, AVG(SCORE) AS AVG_GRADE
      FROM GRADES
      GROUP BY SUBJECT_ID, SUBJECT_NAME, CLASS_NAME;
    `)

    return rows.map((row) => ({
      subjectId: row.subject_id,
      subjectName: row.subject_name,
      avgGrade: row.avg_grade,
      className: row.class_name,
    }))
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

  createClass: async (args) => {
    const { adminId, class: className } = args

    // TODO: Verify admin by id

    const rows = await dbq(`SELECT NAME FROM CLASS WHERE NAME='${className}'`)

    if (rows.length) return Promise.reject("Class already exists")

    try {
      await dbq(`INSERT INTO CLASS VALUES ('${className}')`)
      return className
    } catch (err) {
      return Promise.reject(err.message)
    }
  },

  createSubject: async (args) => {
    const { adminId, teacherId, name, class: className } = args

    // TODO: Verify admin, teacher, class

    const id = uuid()

    await dbq(`INSERT INTO SUBJECT VALUES('${id}', '${name}')`)
    await dbq(`INSERT INTO OFFERS VALUES('${className}', '${id}')`)
    await dbq(`INSERT INTO TEACHES VALUES('${teacherId}', '${id}')`)

    const rows = await dbq(`SELECT * FROM SUBJECT WHERE ID='${id}'`)

    return rows.length ? new Subject(rows[0]) : null
  },

  archiveSubjectByAdmin: async (args) => {
    const { adminId, subjectId } = args

    // TODO: verify admin

    const subjectRows = await dbq(
      `SELECT * FROM SUBJECT WHERE ID='${subjectId}'`
    )

    if (subjectRows.length === 0) return Promise.reject("No subject")

    const subject = subjectRows[0]

    const alreadyExistingRows = await dbq(
      `SELECT * FROM ARCHIVED_SUBJECT WHERE ID='${subject.id}'`
    )

    if (alreadyExistingRows.length) {
      // If subject was already archived indirectly, set it as "not duplicated"
      await dbq(
        `UPDATE ARCHIVED_SUBJECT SET IS_DUPLICATE=FALSE WHERE ID='${subject.id}'`
      )
    } else {
      // Add the subject to archive table
      await dbq(
        `INSERT INTO ARCHIVED_SUBJECT VALUES('${subject.id}', '${subject.name}', FALSE)`
      )
    }

    const archivedSubjectRows = await dbq(
      `SELECT * FROM ARCHIVED_SUBJECT WHERE ID='${subject.id}'`
    )
    return new Subject(archivedSubjectRows[0])
  },

  deleteSubject: async (args) => {
    const { adminId, subjectId } = args

    // TODO: verify admin

    const archivedSubjectRows = await dbq(
      `SELECT ID FROM ARCHIVED_SUBJECT WHERE ID='${subjectId}'`
    )

    if (archivedSubjectRows.length)
      return {
        success: false,
        message: "Cannot delete an archived subject",
      }

    const testRows = await dbq(
      `SELECT TEST_ID FROM HAS_TEST WHERE SUBJECT_ID='${subjectId}'`
    )

    if (testRows.length)
      return {
        success: false,
        message: "Cannot delete this subject because it has tests",
      }

    await dbq(`DELETE FROM HAS_TEST WHERE SUBJECT_ID='${subjectId}'`)
    await dbq(`DELETE FROM TEACHES WHERE SUBJECT_ID='${subjectId}'`)
    await dbq(`DELETE FROM OFFERS WHERE SUBJECT_ID='${subjectId}'`)

    await dbq(`DELETE FROM SUBJECT WHERE ID='${subjectId}'`)

    return {
      success: true,
      message: "Deleted subject successfully",
    }
  },

  assignPupil: async (args) => {
    const { adminId, pupilId, class: className } = args

    const classRows = await dbq(
      `SELECT * FROM ASSIGNS WHERE PUPIL_ID='${pupilId}'`
    )

    if (classRows.length) {
      // Reassign to another class
      await dbq(
        `UPDATE ASSIGNS SET CLASS_NAME='${className}' WHERE PUPIL_ID='${pupilId}'`
      )
    } else {
      // Assign a classless pupil to a class
      await dbq(`INSERT INTO ASSIGNS VALUES ('${className}', '${pupilId}');`)
    }

    return true
  },

  deassignPupil: async (args) => {
    const { adminId, pupilId } = args

    // TODO: VERIFY ADMIN

    await dbq(`DELETE FROM ASSIGNS WHERE PUPIL_ID='${pupilId}'`)

    const subjectRows = await dbq(`
      WITH TEST_SUBJECT_IDS AS (
        SELECT SUBJECT.ID AS ID
        FROM 
        HAS_TEST JOIN APPEARS_IN
        ON HAS_TEST.TEST_ID = APPEARS_IN.TEST_ID
        JOIN SUBJECT
        ON SUBJECT.ID = HAS_TEST.SUBJECT_ID
        WHERE APPEARS_IN.PUPIL_ID='${pupilId}'
        GROUP BY SUBJECT.ID
      )
      SELECT ID, NAME
      FROM SUBJECT NATURAL JOIN TEST_SUBJECT_IDS
    `)

    for (const row of subjectRows) {
      const rows = await dbq(
        `SELECT * FROM ARCHIVED_SUBJECT WHERE ID='${row.id}'`
      )
      if (!rows.length) {
        await dbq(
          `INSERT INTO ARCHIVED_SUBJECT VALUES('${row.id}', '${row.name}', TRUE)`
        )
      }
    }

    return true
  },

  deleteTest: async (args) => {
    const { teacherId, testId } = args

    // TODO: verify teacher

    await dbq(`DELETE FROM HAS_TEST WHERE TEST_ID='${testId}'`)

    await dbq(`DELETE FROM APPEARS_IN WHERE TEST_ID='${testId}'`)

    await dbq(`DELETE FROM TEST WHERE ID='${testId}'`)

    return true
  },

  deletePupil: async (args) => {
    const { adminId, id } = args

    // TODO: Verify admin

    await dbq(`DELETE FROM APPEARS_IN WHERE PUPIL_ID='${id}'`)

    await dbq(`DELETE FROM ASSIGNS WHERE PUPIL_ID='${id}'`)

    await dbq(`DELETE FROM PUPIL WHERE ID='${id}'`)

    return {
      success: true,
    }
  },

  deleteTeacher: async (args) => {
    const { adminId, id } = args

    // TODO: Verify admin

    const mySubjectIdRows = await dbq(`
      SELECT SUBJECT.ID AS ID
      FROM TEACHES JOIN SUBJECT
        ON TEACHES.SUBJECT_ID = SUBJECT.ID
      WHERE TEACHES.TEACHER_ID = '${id}';
    `)

    if (mySubjectIdRows.length) {
      const mySubjectIds = mySubjectIdRows.map((row) => `'${row.id}'`)

      const rows = await dbq(
        `SELECT ID 
        FROM ARCHIVED_SUBJECT 
        WHERE ID IN (${mySubjectIds.join(",")})`
      )

      if (rows.length < mySubjectIds.length)
        return {
          success: false,
          message: "Teachers with unarchived subjects cannot be removed",
        }
    }

    await dbq(`DELETE FROM TEACHER WHERE ID='${id}'`)

    return {
      success: true,
    }
  },

  deleteClass: async (args) => {
    const { adminId, class: className } = args

    // TODO: verify admin

    // Unassign pupils of this class
    await dbq(`DELETE FROM ASSIGNS WHERE CLASS_NAME='${className}'`)

    // All archived subjects which are in this class
    const archivedSubjectIdRows = await dbq(`
      SELECT ARCHIVED_SUBJECT.ID AS ID
      FROM
      OFFERS JOIN ARCHIVED_SUBJECT
        ON OFFERS.SUBJECT_ID = ARCHIVED_SUBJECT.ID
      WHERE OFFERS.CLASS_NAME = '${className}'
    `)

    const archivedSubjectIds = archivedSubjectIdRows.map((row) => `'${row.id}'`)

    // All unarchived subjects which are in this class
    const unarchivedSubjectIdRows = archivedSubjectIds.length
      ? await dbq(`
          SELECT SUBJECT_ID AS ID
          FROM OFFERS
          WHERE 
            SUBJECT_ID NOT IN (${archivedSubjectIds.join(", ")})
            AND CLASS_NAME = '${className}'
      `)
      : await dbq(`
          SELECT SUBJECT_ID AS ID
          FROM OFFERS
          WHERE CLASS_NAME = '${className}'
      `)

    const unarchivedSubjectIds = unarchivedSubjectIdRows.map(
      (row) => `'${row.id}'`
    )

    if (unarchivedSubjectIds.length) {
      // Delete teacher assignments of unarchived subjects
      await dbq(
        `DELETE FROM TEACHES 
        WHERE SUBJECT_ID IN (${unarchivedSubjectIds.join(",")})`
      )

      // Delete class offers of unarchived subjects
      await dbq(
        `DELETE FROM OFFERS 
        WHERE SUBJECT_ID IN (${unarchivedSubjectIds.join(",")})`
      )

      // Delete unarchived subjects
      await dbq(
        `DELETE FROM SUBJECT WHERE ID IN (${unarchivedSubjectIds.join(",")})`
      )

      // Delete tests and scores of unarchived subjects
      const testIdRows = await dbq(
        `SELECT TEST_ID AS ID 
        FROM HAS_TEST WHERE SUBJECT_ID IN (${unarchivedSubjectIds.join(",")})`
      )

      const testIds = testIdRows.map((row) => `'${row.id}'`)

      await dbq(
        `DELETE FROM HAS_TEST 
        WHERE SUBJECT_ID IN (${unarchivedSubjectIds.join(",")})`
      )

      if (testIds.length) {
        await dbq(
          `DELETE FROM APPEARS_IN 
          WHERE TEST_ID IN (${testIds.join(",")})`
        )

        await dbq(`DELETE FROM TEST WHERE ID IN (${testIds.join(",")})`)
      }
    }

    // Delete class offers
    await dbq(`DELETE FROM OFFERS WHERE CLASS_NAME='${className}'`)

    // Delete actual class
    await dbq(`DELETE FROM CLASS WHERE NAME='${className}'`)

    return true
  },
}
