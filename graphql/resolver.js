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

  async appearsIn() {}
}

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
    return rows
  },
}
