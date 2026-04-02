import dbConnect from '../../../lib/mongodb';
import Budget from '../../../models/Budget';
import { verifyToken } from '../../../lib/auth';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  return authHeader.replace('Bearer ', '').trim();
};

export default async function handler(req, res) {
  try {
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
      // Validate request body
      const { category, amount, month } = req.body;
      if (!category || !amount || !month) {
        return res.status(400).json({ message: 'Missing required fields: category, amount, month' });
      }
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }

      const budget = await Budget.create(req.body);
      return res.status(201).json(budget);
    }

    if (req.method === 'GET') {
      const budgets = await Budget.find({});
      return res.status(200).json(budgets);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('API Error in /api/budgets:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
