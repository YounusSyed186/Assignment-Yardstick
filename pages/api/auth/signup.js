import dbConnect from '../../../lib/mongodb'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  try {
    await dbConnect()

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
    }

    const { name, email, password } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields: name, email, password' })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: email.toLowerCase().trim(), password: hashed })

    return res.status(201).json({ id: user._id, name: user.name, email: user.email })
  } catch (err) {
    console.error('/api/auth/signup error:', err)
    return res.status(500).json({ message: 'Internal Server Error', error: err.message })
  }
}
