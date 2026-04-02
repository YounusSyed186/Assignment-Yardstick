import dbConnect from '../../../lib/mongodb'
import Budget from '../../../models/Budget'
import { verifyToken } from '../../../lib/auth'

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  console.log(`[API /budgets/[id]] Auth header received: ${authHeader ? 'yes ('+authHeader.substring(0,20)+'...)' : 'no'}`)
  return token
}

export default async function handler(req, res) {
  try {
    await dbConnect()
    const { id } = req.query

    const token = getBearerToken(req)
    if (!token) {
      console.error('[API /budgets/[id]] Missing authorization token')
      return res.status(401).json({ message: 'Missing authorization token' })
    }
    try {
      verifyToken(token)
      console.log('[API /budgets/[id]] Token verified successfully')
    } catch (err) {
      console.error('[API /budgets/[id]] Token verification failed:', err.message)
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    if (req.method === 'PUT') {
      console.log('[API /budgets/[id]] PUT request for budget:', id)
      // Validate request body if needed
      const updated = await Budget.findByIdAndUpdate(id, req.body, { new: true })
      if (!updated) {
        console.warn('[API /budgets/[id]] Budget not found:', id)
        return res.status(404).json({ message: 'Budget not found' });
      }
      console.log('[API /budgets/[id]] Budget updated:', id)
      return res.status(200).json(updated)
    }

    if (req.method === 'DELETE') {
      console.log('[API /budgets/[id]] DELETE request for budget:', id)
      const deleted = await Budget.findByIdAndDelete(id)
      if (!deleted) {
        console.warn('[API /budgets/[id]] Budget not found:', id)
        return res.status(404).json({ message: 'Budget not found' });
      }
      console.log('[API /budgets/[id]] Budget deleted:', id)
      return res.status(200).json({ message: 'Budget deleted' })
    }

    res.setHeader('Allow', ['PUT', 'DELETE'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  } catch (err) {
    console.error('API Error in /api/budgets/[id]:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
