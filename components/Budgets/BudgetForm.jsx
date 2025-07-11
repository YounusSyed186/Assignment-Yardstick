'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useApp } from '../../contexts/AppContext'
import { categories } from '../../data/categories'
import { toast } from '../../hooks/use-toast'

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required').refine(val => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  month: z.string().min(1, 'Month is required'),
})

export default function BudgetForm({ onSuccess }) {
  const { addBudget, budgets } = useApp()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category: '',
      amount: '',
      month: new Date().toISOString().slice(0, 7), // Current month
    },
  })

  const watchedCategory = watch('category')
  const watchedMonth = watch('month')

  const onSubmit = async (data) => {
    try {
      // Check if budget already exists for this category and month
      const existingBudget = budgets.find(
        b => b.category === data.category && b.month === data.month
      )

      if (existingBudget) {
        toast({
          title: 'Budget Exists',
          description: 'A budget for this category and month already exists.',
          variant: 'destructive',
        })
        return
      }

      addBudget({
        category: data.category,
        amount: Number(data.amount),
        month: data.month,
      })

      toast({
        title: 'Success!',
        description: 'Budget created successfully.',
      })

      reset()
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create budget. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Create Budget</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <Label>Category</Label>
              <Select
                value={watchedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">Budget Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Month */}
          <div>
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              {...register('month')}
              className={errors.month ? 'border-red-500' : ''}
            />
            {errors.month && (
              <p className="text-red-500 text-sm mt-1">{errors.month.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Budget'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}