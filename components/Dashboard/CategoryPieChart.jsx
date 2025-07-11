'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useApp } from '../../contexts/AppContext'
import { getCategoryByName } from '../../data/categories'

export default function CategoryPieChart() {
  const { transactions } = useApp()

  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentMonthExpenses = transactions.filter(t => 
    t.date.startsWith(currentMonth) && t.type === 'expense'
  )

  const categoryData = currentMonthExpenses.reduce((acc, transaction) => {
    const category = getCategoryByName(transaction.category)
    const existingCategory = acc.find(item => item.name === transaction.category)
    
    if (existingCategory) {
      existingCategory.value += transaction.amount
    } else {
      acc.push({
        name: transaction.category,
        value: transaction.amount,
        color: category?.color || '#8884d8',
      })
    }
    return acc
  }, [])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / categoryData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.color }}>
            Amount: <span className="font-bold">${data.value.toFixed(2)}</span>
          </p>
          <p className="text-gray-600">Percentage: {percentage}%</p>
        </div>
      )
    }
    return null
  }

  if (categoryData.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">Category Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-500">No expense data for this month</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Category Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}