import dbConnect from '../../../lib/mongodb';
import Transaction from '../../../models/Transaction';
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

  if (req.method === 'POST') {
    try {
      const transaction = await Transaction.create(req.body);
      return res.status(201).json(transaction);
    } catch (err) {
      return res.status(400).json({ message: 'Error adding transaction', error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const transactions = await Transaction.find({}).sort({ date: -1 });
      return res.status(200).json(transactions);
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching transactions' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
