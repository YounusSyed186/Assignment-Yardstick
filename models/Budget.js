// models/Budget.js

import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number, // Make sure it's named `amount` (not `limit`)
    required: true,
  },
  month: {
    type: String, // 'YYYY-MM'
    required: true,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Budget || mongoose.model('Budget', budgetSchema)
