'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Trash2, Filter, Search } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { categories, getCategoryByName } from '../../data/categories'
import { toast } from '../../hooks/use-toast'

export default function TransactionList() {
  const { transactions, deleteTransaction } = useApp()

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const handleDelete = (id, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      deleteTransaction(id)
      toast({
        title: 'Deleted',
        description: 'Transaction deleted successfully.',
      })
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || transaction.category === categoryFilter

    let matchesDate = true
    if (dateFilter !== 'all') {
      const transactionDate = new Date(transaction.date)
      const now = new Date()

      switch (dateFilter) {
        case 'thisMonth':
          matchesDate =
            transactionDate.getMonth() === now.getMonth() &&
            transactionDate.getFullYear() === now.getFullYear()
          break
        case 'lastMonth':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
          matchesDate =
            transactionDate.getMonth() === lastMonth.getMonth() &&
            transactionDate.getFullYear() === lastMonth.getFullYear()
          break
        case 'last3Months':
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3)
          matchesDate = transactionDate >= threeMonthsAgo
          break
      }
    }

    return matchesSearch && matchesCategory && matchesDate
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Transactions ({filteredTransactions.length})
        </CardTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const category = getCategoryByName(transaction.category)
              return (
                <div
                  key={transaction._id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start sm:items-center space-x-4 w-full">
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        transaction.type === 'expense' ? 'bg-red-100' : 'bg-green-100'
                      }`}
                    >
                      <span className="text-lg">{category?.icon || '💰'}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-base sm:text-lg">{transaction.description}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm">
                        <Badge
                          variant="secondary"
                          style={{
                            backgroundColor: category?.color + '20',
                            color: category?.color,
                          }}
                        >
                          {transaction.category}
                        </Badge>
                        <span className="text-gray-500">{formatDate(transaction.date)}</span>
                        <Badge
                          variant={transaction.type === 'expense' ? 'destructive' : 'default'}
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 mt-4 sm:mt-0">
                    <div
                      className={`font-bold text-base sm:text-lg ${
                        transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(transaction._id, transaction.description)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
