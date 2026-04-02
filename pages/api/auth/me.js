import dbConnect from '../../../lib/mongodb'
import User from '../../../models/User'
import { verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    await dbConnect()

    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }

    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '').trim()
    if (!token) {
      return res.status(401).json({ message: 'No authorization token provided' })
    }

    let payload
    try {
      payload = verifyToken(token)
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const user = await User.findById(payload.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.status(200).json({ user })
  } catch (err) {
    console.error('/api/auth/me error:', err)
    return res.status(500).json({ message: 'Internal Server Error', error: err.message })
  }
}
