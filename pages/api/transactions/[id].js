import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import mongoose from 'mongoose';
import { verifyToken } from '../../../lib/auth';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.replace('Bearer ', '').trim();
};

export default async function handler(req, res) {
  await dbConnect();

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    verifyToken(token);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

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
