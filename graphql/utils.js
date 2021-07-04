function isAdminAuthUser(gqlContext, clientUserId) {
  const { sessionUserId, sessionUserRole } = gqlContext
  return sessionUserId === clientUserId && sessionUserRole === "admin"
}

function isPupilAuthUser(gqlContext, clientUserId) {
  const { sessionUserId, sessionUserRole } = gqlContext
  return sessionUserId === clientUserId && sessionUserRole === "pupil"
}

function isAnyAdmin(gqlContext) {
  const { sessionUserRole } = gqlContext
  return sessionUserRole === "admin"
}

function isNotAdmin(gqlContext) {
  return !isAnyAdmin(gqlContext)
}

function isAnyTeacher(gqlContext) {
  const { sessionUserRole } = gqlContext
  return sessionUserRole === "teacher"
}

function isNotTeacher(gqlContext) {
  return !isAnyTeacher(gqlContext)
}

module.exports = {
  isAdminAuthUser,
  isAnyAdmin,
  isNotAdmin,
  isNotTeacher,
  isPupilAuthUser,
  isAnyTeacher,
}
