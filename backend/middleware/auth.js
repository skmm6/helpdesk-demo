import jwt from 'jsonwebtoken'

export default function (req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Нет токена' })

  const token = auth.split(' ')[1]
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET)
    req.user = user
    next()
  } catch (e) {
    res.status(403).json({ error: 'Недействительный токен' })
  }
}