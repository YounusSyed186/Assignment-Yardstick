'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { getCategoryByName } from '../../data/categories'
import { toast } from '../../hooks/use-toast'

export default function BudgetList() {
  const { budgets, deleteBudget, transactions } = useApp()
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const handleDelete = (id, category) => {
    if (window.confirm(`Are you sure you want to delete the budget for ${category}?`)) {
      deleteBudget(id)
      toast({
        title: 'Deleted',
        description: 'Budget deleted successfully.',
      })
    }
  }

  const filteredBudgets = budgets.filter(budget => budget.month === selectedMonth)

  const getBudgetInsights = (budget) => {
    const actualSpent = transactions
      .filter(t =>
        t.category === budget.category &&
        t.date.startsWith(budget.month) &&
        t.type === 'expense'
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const percentage = (actualSpent / budget.amount) * 100
    const remaining = budget.amount - actualSpent

    let status = 'on-track'
    let message = `You're on track with your ${budget.category} budget.`

    if (percentage >= 100) {
      status = 'over-budget'
      message = `You've exceeded your ${budget.category} budget by $${Math.abs(remaining).toFixed(2)}.`
    } else if (percentage >= 80) {
      status = 'warning'
      message = `You're ${percentage.toFixed(0)}% through your ${budget.category} budget.`
    } else if (percentage >= 50) {
      status = 'halfway'
      message = `You're halfway through your ${budget.category} budget.`
    }

    return {
      actualSpent,
      percentage: Math.min(percentage, 100),
      remaining,
      status,
      message,
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'over-budget': return 'text-red-600 bg-red-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'halfway': return 'text-blue-600 bg-blue-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    if (percentage >= 50) return 'bg-blue-500'
    return 'bg-green-500'
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-bold text-gray-900">Budget Overview</CardTitle>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </CardHeader>

      <CardContent>
        {filteredBudgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No budgets found for this month</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBudgets.map((budget, index) => {
              const category = getCategoryByName(budget.category)
              const insights = getBudgetInsights(budget)

              return (
                <div
                  key={budget.id}
                  className="p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    {/* Category & Budget Info */}
                    <div className="flex items-start sm:items-center space-x-3 flex-1">
                      <div
                        className="p-3 rounded-full shrink-0"
                        style={{ backgroundColor: category?.color + '20' }}
                      >
                        <span className="text-xl">{category?.icon || '💰'}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                          {budget.category}
                        </h3>
                        <p className="text-sm text-gray-600 leading-snug">
                          Budget: ${budget.amount.toFixed(2)} |{' '}
                          Spent: ${insights.actualSpent.toFixed(2)} |{' '}
                          Remaining: ${insights.remaining.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Badge + Delete */}
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(insights.status)}>
                        {insights.status === 'over-budget' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {insights.percentage.toFixed(0)}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(budget._id, budget.category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{insights.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(insights.percentage)}`}
                        style={{ width: `${Math.min(insights.percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Insight Message */}
                  <div className={`mt-4 p-3 rounded-lg ${getStatusColor(insights.status)}`}>
                    <p className="text-sm font-medium">{insights.message}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
