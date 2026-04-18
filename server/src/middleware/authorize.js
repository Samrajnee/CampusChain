import { sendError } from '../lib/apiResponse.js'

// Role hierarchy — higher index = more authority
const ROLE_HIERARCHY = ['STUDENT', 'LAB_ASSISTANT', 'LIBRARIAN', 'TEACHER', 'HOD', 'PRINCIPAL', 'SUPER_ADMIN']

// Usage: authorize('TEACHER') — allows TEACHER and above
// Usage: authorize(['HOD', 'PRINCIPAL']) — allows only these specific roles
const authorize = (rolesOrMinRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role

    if (!userRole) return sendError(res, 'Unauthorized', 401)

    if (Array.isArray(rolesOrMinRole)) {
      if (!rolesOrMinRole.includes(userRole)) {
        return sendError(res, 'You do not have permission to perform this action', 403)
      }
    } else {
      const minIndex = ROLE_HIERARCHY.indexOf(rolesOrMinRole)
      const userIndex = ROLE_HIERARCHY.indexOf(userRole)
      if (userIndex < minIndex) {
        return sendError(res, 'You do not have permission to perform this action', 403)
      }
    }

    next()
  }
}

export default authorize