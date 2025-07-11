'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { DollarSign, Target, TrendingUp, Award } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'

export default function SummaryCards() {
  const { transactions, budgets } = useApp()
  
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth))
  
  const totalSpent = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const totalBudget = budgets
    .filter(b => b.month === currentMonth)
    .reduce((sum, b) => sum + b.amount, 0)
    
  const budgetLeft = totalBudget - totalSpent
  
  // Get top category
  const categorySpending = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})
    
  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'

  const cards = [
    {
      title: 'Total Spent',
      value: `$${totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Total Budget',
      value: `$${totalBudget.toFixed(2)}`,
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Budget Left',
      value: `$${budgetLeft.toFixed(2)}`,
      icon: TrendingUp,
      color: budgetLeft >= 0 ? 'from-green-500 to-emerald-500' : 'from-red-500 to-pink-500',
      bgColor: budgetLeft >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: 'Top Category',
      value: topCategory,
      icon: Award,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card key={card.title} className={`${card.bgColor} border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in`} style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color}`}>
              <card.icon className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}