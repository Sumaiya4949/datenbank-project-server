const { dbq } = require("../utils/db")

class Teacher {
  constructor(teacher) {
    Object.assign(this, teacher)
  }

  async teaches(args) {
    const subjectIdRows = await dbq(
      args.id
        ? `SELECT SUBJECT_ID AS ID FROM TEACHES WHERE TEACHER_ID='${this.id}' AND SUBJECT_ID='${args.id}'`
        : `SELECT SUBJECT_ID AS ID FROM TEACHES WHERE TEACHER_ID='${this.id}'`
    )
    const subjectIds = subjectIdRows.map((row) => `'${row.id}'`)

    if (subjectIds.length === 0) return []

    const subjects = await dbq(
      `SELECT * FROM SUBJECT WHERE ID IN (${subjectIds.join(", ")})`
    )
    return subjects.map((sub) => new Subject(sub))
  }
}

class Test {
  constructor(test) {
    Object.assign(this, test)
  }

  async subjectName() {
    const idRows = await dbq(
      `SELECT SUBJECT_ID AS ID FROM HAS_TEST WHERE TEST_ID='${this.id}'`
    )

    const subjectId = idRows[0].id

    const nameRows = await dbq(
      `SELECT NAME FROM SUBJECT WHERE ID='${subjectId}'`
    )

    return nameRows[0].name
  }

  async subjectId() {
    const idRows = await dbq(
      `SELECT SUBJECT_ID AS ID FROM HAS_TEST WHERE TEST_ID='${this.id}'`
    )

    return idRows[0].id
  }

  async score(args) {
    const scoreRows = await dbq(
      `SELECT SCORE FROM APPEARS_IN WHERE PUPIL_ID='${args.pupilId}' AND TEST_ID='${this.id}'`
    )
    if (scoreRows.length === 0) return null
    return scoreRows[0].score
  }

  async pupils() {
    const pupilIdRows = await dbq(
      `SELECT PUPIL_ID AS ID FROM APPEARS_IN JOIN TEST ON TEST.ID=APPEARS_IN.TEST_ID WHERE TEST_ID='${this.id}'`
    )

    if (pupilIdRows.length === 0) return []

    const pupilIds = pupilIdRows.map((row) => `'${row.id}'`)

    const pupilRows = await dbq(
      `SELECT * FROM PUPIL WHERE ID IN (${pupilIds.join(", ")})`
    )

    return pupilRows.map((pupil) => new Pupil(pupil))
  }
}

class TestResult extends Test {
  constructor(test, pupilId) {
    super(test)
    this.pupilId = pupilId
  }

  async score() {
    const scoreRow = await dbq(
      `SELECT SCORE FROM APPEARS_IN WHERE PUPIL_ID='${this.pupilId}' AND TEST_ID='${this.id}'`
    )
    return scoreRow[0].score
  }
}

class Pupil {
  constructor(pupil) {
    Object.assign(this, pupil)
  }

  async appearsIn() {
    const testIdRows = await dbq(
      `SELECT TEST_ID AS ID FROM APPEARS_IN WHERE PUPIL_ID='${this.id}'`
    )
    const testIds = testIdRows.map((row) => `'${row.id}'`)

    if (testIds.length === 0) return []

    const tests = await dbq(
      `SELECT * FROM TEST WHERE ID IN (${testIds.join(", ")})`
    )

    return tests.map((test) => new TestResult(test, this.id))
  }

  async className() {
    const rows = await dbq(
      `SELECT CLASS_NAME FROM ASSIGNS WHERE PUPIL_ID='${this.id}'`
    )

    if (rows.length === 0) return null
    return rows[0].class_name
  }

  async subjects(args) {
    const className = await this.className()

    const subjectIdRows = args.id
      ? [{ id: args.id }]
      : await dbq(
          `SELECT SUBJECT_ID AS ID FROM OFFERS WHERE CLASS_NAME='${className}'`
        )

    if (subjectIdRows.length === 0) return []

    const subjectIds = subjectIdRows.map((row) => `'${row.id}'`)

    const subjects = await dbq(
      `SELECT * FROM SUBJECT WHERE ID IN (${subjectIds.join(", ")})`
    )

    return subjects.map((subject) => new Subject(subject))
  }

  async score(args) {
    const { testId } = args

    const rows = await dbq(
      `SELECT SCORE FROM APPEARS_IN WHERE PUPIL_ID='${this.id}' AND TEST_ID='${testId}'`
    )

    return rows.length ? rows[0].score : null
  }
}

class Subject {
  constructor(subject) {
    Object.assign(this, subject)
  }

  async tests() {
    const testIdRows = await dbq(
      `SELECT TEST_ID AS ID FROM HAS_TEST WHERE SUBJECT_ID='${this.id}'`
    )

    const testIds = testIdRows.map((row) => `'${row.id}'`)

    if (testIds.length === 0) return []

    const testRows = await dbq(
      `SELECT * FROM TEST WHERE ID IN (${testIds.join(", ")})`
    )

    return testRows.map((test) => new Test(test))
  }

  async className() {
    const classNameRows = await dbq(
      `SELECT CLASS_NAME FROM OFFERS WHERE SUBJECT_ID='${this.id}'`
    )

    if (classNameRows.length === 0) return null

    const className = `${classNameRows[0].class_name}`

    return className
  }

  async pupils() {
    const pupilIdRows = await dbq(
      `SELECT PUPIL_ID AS ID FROM HAS_TEST NATURAL JOIN APPEARS_IN WHERE SUBJECT_ID='${this.id}'`
    )

    if (pupilIdRows.length === 0) return []

    const pupilIds = pupilIdRows.map((row) => `'${row.id}'`)

    const pupils = await dbq(
      `SELECT * FROM PUPIL WHERE ID IN (${pupilIds.join(", ")})`
    )

    return pupils.map((pupil) => new Pupil(pupil))
  }

  async isArchived() {
    const rows = await dbq(
      `SELECT * FROM ARCHIVED_SUBJECT WHERE ID='${this.id}' AND IS_DUPLICATE=FALSE`
    )
    return !!rows?.length
  }
}

class Class {
  constructor(_class) {
    Object.assign(this, _class)
  }

  async subjects() {
    const subjectIdRows = await dbq(
      `SELECT SUBJECT_ID AS ID FROM OFFERS WHERE CLASS_NAME='${this.name}'`
    )

    if (subjectIdRows.length === 0) return []

    const subjectIds = subjectIdRows.map((row) => `'${row.id}'`)

    const subjectRows = await dbq(
      `SELECT * FROM SUBJECT WHERE ID IN (${subjectIds.join(", ")})`
    )

    return subjectRows.map((subject) => new Subject(subject))
  }

  async pupils() {
    const pupilIdRows = await dbq(
      `SELECT PUPIL_ID AS ID FROM ASSIGNS WHERE CLASS_NAME='${this.name}'`
    )

    if (pupilIdRows.length === 0) return []

    const pupilIds = pupilIdRows.map((row) => `'${row.id}'`)

    const pupilRows = await dbq(
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
  Subject,
}
