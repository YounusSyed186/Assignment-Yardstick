import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import mongoose from 'mongoose';
import { verifyToken } from '../../../lib/auth';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  console.log(`[API /transactions/[id]] Auth header received: ${authHeader ? 'yes ('+authHeader.substring(0,20)+'...)' : 'no'}`);
  return token;
};

export default async function handler(req, res) {
  await dbConnect();

  const token = getBearerToken(req);
  if (!token) {
    console.error('[API /transactions/[id]] Missing authorization token');
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    verifyToken(token);
    console.log('[API /transactions/[id]] Token verified successfully');
  } catch (err) {
    console.error('[API /transactions/[id]] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const { id } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn('[API /transactions/[id]] Invalid transaction ID:', id);
    return res.status(400).json({ message: 'Invalid transaction ID' });
  }

  if (req.method === 'DELETE') {
    try {
      console.log('[API /transactions/[id]] DELETE request for transaction:', id);
      const deleted = await Transaction.findByIdAndDelete(id);

      if (!deleted) {
        console.warn('[API /transactions/[id]] Transaction not found:', id);
        return res.status(404).json({ message: 'Transaction not found' });
      }

      console.log('[API /transactions/[id]] Transaction deleted:', id);
      return res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('[API /transactions/[id]] Error deleting transaction:', error.message);
      return res.status(500).json({ message: 'Error deleting transaction', error: error.message });
    }
  }

  res.setHeader('Allow', ['DELETE']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
