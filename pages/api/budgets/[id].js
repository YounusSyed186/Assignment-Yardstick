import dbConnect from '../../../lib/mongodb'
import Budget from '../../../models/Budget'

export default async function handler(req, res) {
  try {
    await dbConnect()
    const { id } = req.query

    if (req.method === 'PUT') {
      // Validate request body if needed
      const updated = await Budget.findByIdAndUpdate(id, req.body, { new: true })
      if (!updated) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      return res.status(200).json(updated)
    }

    if (req.method === 'DELETE') {
      const deleted = await Budget.findByIdAndDelete(id)
      if (!deleted) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      return res.status(200).json({ message: 'Budget deleted' })
    }

    res.setHeader('Allow', ['PUT', 'DELETE'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  } catch (err) {
    console.error('API Error in /api/budgets/[id]:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
