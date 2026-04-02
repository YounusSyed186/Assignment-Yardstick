import dbConnect from '../../../lib/mongodb';
import Budget from '../../../models/Budget';
import { verifyToken } from '../../../lib/auth';

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  console.log(`[API /budgets] Auth header received: ${authHeader ? 'yes ('+authHeader.substring(0,20)+'...)' : 'no'}`);
  return token;
};

export default async function handler(req, res) {
  try {
    await dbConnect();

    const token = getBearerToken(req);
    if (!token) {
      console.error('[API /budgets] Missing authorization token');
      return res.status(401).json({ message: 'Missing authorization token' });
    }

    try {
      verifyToken(token);
      console.log('[API /budgets] Token verified successfully');
    } catch (err) {
      console.error('[API /budgets] Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (req.method === 'POST') {
      console.log('[API /budgets] POST request received');
      // Validate request body
      const { category, amount, month } = req.body;
      if (!category || !amount || !month) {
        console.warn('[API /budgets] Missing required fields:', { category: !!category, amount: !!amount, month: !!month });
        return res.status(400).json({ message: 'Missing required fields: category, amount, month' });
      }
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        console.warn('[API /budgets] Invalid amount:', amount);
        return res.status(400).json({ message: 'Amount must be a positive number' });
      }

      const budget = await Budget.create(req.body);
      console.log('[API /budgets] Budget created:', budget._id);
      return res.status(201).json(budget);
    }

    if (req.method === 'GET') {
      console.log('[API /budgets] GET request received');
      const budgets = await Budget.find({});
      console.log('[API /budgets] Found', budgets.length, 'budgets');
      return res.status(200).json(budgets);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (err) {
    console.error('API Error in /api/budgets:', err);
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
}
