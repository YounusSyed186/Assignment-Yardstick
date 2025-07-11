import dbConnect from '../../../lib/mongodb'
import Budget from '../../../models/Budget'

export default async function handler(req, res) {
  await dbConnect()
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const updated = await Budget.findByIdAndUpdate(id, req.body, { new: true })
      return res.status(200).json(updated)
    } catch (err) {
      return res.status(400).json({ message: 'Error updating budget', error: err.message })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await Budget.findByIdAndDelete(id)
      return res.status(200).json({ message: 'Budget deleted' })
    } catch (err) {
      return res.status(500).json({ message: 'Error deleting budget', error: err.message })
    }
  }

  res.setHeader('Allow', ['PUT', 'DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
