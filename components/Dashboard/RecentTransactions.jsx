'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { getCategoryByName } from '../../data/categories'

export default function RecentTransactions() {
  const { transactions } = useApp()

  const recentTransactions = transactions
    .slice(0, 5)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (recentTransactions.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-gray-500">No transactions yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold text-gray-900">Recent Transactions</CardTitle>
        <Link href="/transactions">
          <Button variant="outline" size="sm" className="hover:bg-blue-50">
            View All
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-4">
        {recentTransactions.map((transaction, index) => {
          const category = getCategoryByName(transaction.category)
          return (
            <div
              key={transaction.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors animate-fade-in gap-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Left Side: Icon + Info */}
              <div className="flex items-start sm:items-center space-x-3 w-full sm:w-auto">
                <div className={`p-2 rounded-full shrink-0 ${transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {transaction.type === 'expense' ? (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base text-gray-900 truncate">{transaction.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm">
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: category?.color + '20',
                        color: category?.color
                      }}
                    >
                      {category?.icon} {transaction.category}
                    </Badge>
                    <span className="text-gray-500">{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Amount */}
              <div className={`font-bold text-sm sm:text-base ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
