import dbConnect from '../../../lib/mongodb'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'
import { signToken } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    await dbConnect()

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }

    const { email, password } = req.body || {}
    if (!email || !password) {
      console.warn('[API /auth/login] Missing email or password');
      return res.status(400).json({ message: 'Missing required fields: email, password' })
    }

    console.log('[API /auth/login] Attempting login for:', email);
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      console.warn('[API /auth/login] User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.warn('[API /auth/login] Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken({ id: user._id, email: user.email, name: user.name })
    console.log('[API /auth/login] Login successful, token created for:', email);
    return res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (err) {
    console.error('/api/auth/login error:', err)
    return res.status(500).json({ message: 'Internal Server Error', error: err.message })
  }
}
