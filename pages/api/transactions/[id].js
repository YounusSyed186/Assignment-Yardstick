import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  if (req.method === 'DELETE') {
    try {
      const deleted = await Transaction.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
