const { getDB, dbRead } = require("../utils/db")

class Teacher {
  constructor(teacher) {
    Object.assign(this, teacher)
  }

  async teaches() {
    const subjectIdRows = await dbRead(
      `SELECT SUBJECT_ID AS ID FROM TEACHES WHERE TEACHER_ID='${this.id}'`
    )
    const subjectIds = subjectIdRows.map((row) => `'${row.id}'`)

    if (subjectIds.length === 0) return []

    const subjects = await dbRead(
      `SELECT * FROM SUBJECT WHERE ID IN (${subjectIds.join(", ")})`
    )
    return subjects
  }
}

class Test {
  constructor(test) {
    Object.assign(this, test)
  }

  async subjectName() {
    const idRows = await dbRead(
      `SELECT SUBJECT_ID AS ID FROM HAS_TEST WHERE TEST_ID='${this.id}'`
    )

    const subjectId = idRows[0].id

    const nameRows = await dbRead(
      `SELECT NAME FROM SUBJECT WHERE ID='${subjectId}'`
    )

    return nameRows[0].name
  }
}

class Pupil {
  constructor(pupil) {
    Object.assign(this, pupil)
  }

  async appearsIn() {
    const testIdRows = await dbRead(
      `SELECT TEST_ID AS ID FROM APPEARS_IN WHERE PUPIL_ID='${this.id}'`
    )
    const testIds = testIdRows.map((row) => `'${row.id}'`)

    if (testIds.length === 0) return []

    const tests = await dbRead(
      `SELECT * FROM TEST WHERE ID IN (${testIds.join(", ")})`
    )

    return tests.map((test) => new Test(test))
  }
}

class Subject {
  constructor(subject) {
    Object.assign(this, subject)
  }

  async tests() {
    const testIdRows = await dbRead(
      `SELECT TEST_ID AS ID FROM HAS_TEST WHERE SUBJECT_ID='${this.id}'`
    )

    const testIds = testIdRows.map((row) => `'${row.id}'`)

    if (testIds.length === 0) return []

    const testRows = await dbRead(
      `SELECT * FROM TEST WHERE ID IN (${testIds.join(", ")})`
    )

    return testRows
  }
}

class Class {
  constructor(_class) {
    Object.assign(this, _class)
  }

  async subjects() {
    const subjectIdRows = await dbRead(
      `SELECT SUBJECT_ID AS ID FROM OFFERS WHERE CLASS_NAME='${this.name}'`
    )

    const subjectIds = subjectIdRows.map((row) => `'${row.id}'`)

    const subjectRows = await dbRead(
      `SELECT * FROM SUBJECT WHERE ID IN (${subjectIds.join(", ")})`
    )

    return subjectRows.map((subject) => new Subject(subject))
  }

  async pupils() {
    const pupilIdRows = await dbRead(
      `SELECT PUPIL_ID AS ID FROM ASSIGNS WHERE CLASS_NAME='${this.name}'`
    )

    const pupilIds = pupilIdRows.map((row) => `'${row.id}'`)

    const pupilRows = await dbRead(
      `SELECT * FROM PUPIL WHERE ID IN (${pupilIds.join(", ")})`
    )

    return pupilRows.map((pupil) => new Pupil(pupil))
  }
}

module.exports = {
  Pupil,
  Teacher,
  Test,
  Class,
}
