'use client'

import { useApp } from '../../contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function BudgetComparisonChart() {
  const { budgets, transactions } = useApp()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthBudgets = budgets.filter(b => b.month === currentMonth)

  const comparisonData = currentMonthBudgets.map(budget => {
    const actualSpending = transactions
      .filter(t => 
        t.category === budget.category && 
        t.date.startsWith(currentMonth) && 
        t.type === 'expense'
      )
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      category: budget.category.length > 15 ? budget.category.substring(0, 15) + '...' : budget.category,
      budget: budget.amount,
      actual: actualSpending,
    }
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((pld, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: pld.color }}
              />
              <span className="text-sm">
                {pld.dataKey === 'budget' ? 'Budget' : 'Actual'}: 
                <span className="font-bold ml-1">${pld.value.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (comparisonData.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No budget data for this month</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Budget vs Actual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="category" 
              stroke="#64748b"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="budget" fill="#10b981" name="Budget" radius={[2, 2, 0, 0]} />
            <Bar dataKey="actual" fill="#f59e0b" name="Actual" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}