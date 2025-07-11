
import TransactionForm from '../../components/Transactions/TransactionForm'
import TransactionList from '../../components/Transactions/TransactionList'
import Layout from '../../components/Layout'

export default function Transactions() {
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Transactions
          </h1>
          <p className="text-gray-600">Add, view, and manage your financial transactions</p>
        </div>

        {/* Transaction Form */}
        <TransactionForm />

        {/* Transaction List */}
        <TransactionList />
      </div>
    </Layout>
  )
}
