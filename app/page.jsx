
import SummaryCards from '../components/Dashboard/SummaryCards'
import MonthlyExpenseChart from '../components/Dashboard/MonthlyExpenseChart'
import CategoryPieChart from '../components/Dashboard/CategoryPieChart'
import BudgetComparisonChart from '../components/Dashboard/BudgetComparisonChart'
import RecentTransactions from '../components/Dashboard/RecentTransactions'
import Layout from '../components/Layout'

export default function Dashboard() {

  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Financial Dashboard
          </h1>
          <p className="text-gray-600">Track your expenses, manage budgets, and gain financial insights</p>
        </div>

        {/* Summary Cards */}
        <SummaryCards />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyExpenseChart />
          <CategoryPieChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetComparisonChart />
          <RecentTransactions />
        </div>
      </div>
    </Layout>
  )
}
