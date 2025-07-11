"use client";
import { useEffect, useState } from "react";
import BudgetForm from "../../components/Budgets/BudgetForm";
import BudgetList from "../../components/Budgets/BudgetList";
import Layout from "../../components/Layout";

export default function Budgets() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   fetch("/api/users")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setUsers(data);
  //       setLoading(false);
  //       console.log(users)
  //     })
  //     .catch((err) => {
  //       console.error("Failed to fetch users:", err);
  //       setLoading(false);
  //     });
  // }, []);
  return (
    <Layout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Budget Management
          </h1>
          <p className="text-gray-600">
            Set budgets, track spending, and stay on top of your finances
          </p>
        </div>

        {/* Budget Form */}
        <BudgetForm />

        {/* Budget List */}
        <BudgetList />
      </div>
    </Layout>
  );
}
