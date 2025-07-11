
export const categories = [
  { id: 1, name: 'Food & Dining', icon: '🍕', color: '#ff6b6b' },
  { id: 2, name: 'Transportation', icon: '🚗', color: '#4ecdc4' },
  { id: 3, name: 'Shopping', icon: '🛍️', color: '#45b7d1' },
  { id: 4, name: 'Entertainment', icon: '🎬', color: '#f9ca24' },
  { id: 5, name: 'Bills & Utilities', icon: '⚡', color: '#f0932b' },
  { id: 6, name: 'Healthcare', icon: '🏥', color: '#eb4d4b' },
  { id: 7, name: 'Education', icon: '📚', color: '#6c5ce7' },
  { id: 8, name: 'Travel', icon: '✈️', color: '#a29bfe' },
  { id: 9, name: 'Fitness', icon: '💪', color: '#00b894' },
  { id: 10, name: 'Personal Care', icon: '💄', color: '#e17055' },
  { id: 11, name: 'Home & Garden', icon: '🏠', color: '#00cec9' },
  { id: 12, name: 'Insurance', icon: '🛡️', color: '#636e72' },
  { id: 13, name: 'Savings', icon: '💰', color: '#00b894' },
  { id: 14, name: 'Investments', icon: '📈', color: '#0984e3' },
  { id: 15, name: 'Other', icon: '📦', color: '#74b9ff' },
]

export const getCategoryByName = (name) => {
  return categories.find(category => category.name === name)
}

export const getCategoryById = (id) => {
  return categories.find(category => category.id === id)
}
