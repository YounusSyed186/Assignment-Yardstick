import dbConnect from '../../../lib/mongodb'
import Transaction from '../../../models/Transaction'

export default async function handler(req, res) {
  await dbConnect()

  const { id } = req.query

  if (req.method === 'DELETE') {
    try {
      await Transaction.findByIdAndDelete(id)
      return res.status(200).json({ message: 'Transaction deleted' })
    } catch (err) {
      return res.status(500).json({ message: 'Error deleting transaction', error: err.message })
    }
  }

  res.setHeader('Allow', ['DELETE'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
