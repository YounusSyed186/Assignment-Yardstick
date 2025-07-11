import dbConnect from '../../../lib/mongodb';
import Budget from '../../../models/Budget';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const budget = await Budget.create(req.body);
      return res.status(201).json(budget);
    } catch (err) {
      return res.status(400).json({ message: 'Error adding budget', error: err.message });
    }
  }

  if (req.method === 'GET') {
    try {
      const budgets = await Budget.find({});
      return res.status(200).json(budgets);
    } catch (err) {
      return res.status(500).json({ message: 'Error fetching budgets' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
