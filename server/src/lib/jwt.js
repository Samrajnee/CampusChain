import jwt from 'jsonwebtoken'

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const signToken = (payload) => {
  const SECRET = process.env.JWT_SECRET  // moved inside
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

export const verifyToken = (token) => {
  const SECRET = process.env.JWT_SECRET  // moved inside
  return jwt.verify(token, SECRET)
}