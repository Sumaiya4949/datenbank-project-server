export class Teacher {
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

export class Pupil {
  constructor(pupil) {
    Object.assign(this, pupil)
  }

  async appearsIn() {}
}
