import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
import { verifyToken } from '../../../lib/auth';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  console.log(`[API /transactions] Auth header received: ${authHeader ? 'yes ('+authHeader.substring(0,20)+'...)' : 'no'}`);
  return token;
};

export default async function handler(req, res) {
  await dbConnect();

  const token = getBearerToken(req);
  if (!token) {
    console.error('[API /transactions] Missing authorization token');
    return res.status(401).json({ message: 'Missing authorization token' });
  }

  try {
    verifyToken(token);
    console.log('[API /transactions] Token verified successfully');
  } catch (err) {
    console.error('[API /transactions] Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  if (req.method === 'POST') {
    try {
      console.log('[API /transactions] POST request received');
      const transaction = await Transaction.create(req.body);
      console.log('[API /transactions] Transaction created:', transaction._id);
      return res.status(201).json(transaction);
    } catch (err) {
      console.error('[API /transactions] Error adding transaction:', err.message);
      return res.status(400).json({ message: 'Error adding transaction', error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      console.log('[API /transactions] GET request received');
      const transactions = await Transaction.find({}).sort({ date: -1 });
      console.log('[API /transactions] Found', transactions.length, 'transactions');
      return res.status(200).json(transactions);
    } catch (err) {
      console.error('[API /transactions] Error fetching transactions:', err.message);
      return res.status(500).json({ message: 'Error fetching transactions', error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
