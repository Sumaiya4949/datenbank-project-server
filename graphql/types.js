const { getDB } = require("../utils/db")

class Teacher {
  constructor(teacher) {
    Object.assign(this, teacher)
  }

  async teaches() {
    const subjectIdRows = await getDB().any(
      `SELECT SUBJECT_ID AS ID FROM TEACHES WHERE TEACHER_ID='${this.id}'`
    )
    const subjectIds = subjectIdRows.map((row) => `'${row.id}'`)

    if (subjectIds.length === 0) return []

    const subjects = await getDB().any(
      `SELECT * FROM SUBJECT WHERE ID IN (${subjectIds.join(", ")})`
    )
    return subjects
  }
}

class Pupil {
  constructor(pupil) {
    Object.assign(this, pupil)
  }

  async appearsIn() {
    const testIdRows = await getDB().any(
      `SELECT TEST_ID AS ID FROM APPEARS_IN WHERE PUPIL_ID='${this.id}'`
    )
    const testIds = testIdRows.map((row) => `'${row.id}'`)

    if (testIds.length === 0) return []

    const tests = await getDB().any(
      `SELECT * FROM TEST WHERE ID IN (${testIds.join(", ")})`
    )

    return tests
  }
}

module.exports = {
  Pupil,
  Teacher,
}
