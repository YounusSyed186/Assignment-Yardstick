"use client";

import { createContext, useContext, useReducer, useEffect } from "react";

const AppContext = createContext();

const appReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter(
          (tx) => tx._id !== action.payload
        ),
      };

    case "SET_BUDGETS":
      return { ...state, budgets: action.payload };
    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [action.payload, ...state.budgets],
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((b) =>
          b._id === action.payload.id ? { ...b, ...action.payload.updates } : b
        ),
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b._id !== action.payload),
      };
    default:
      return state;
  }
};

const initialState = {
  transactions: [],
  budgets: [],
  isLoading: false,
};

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function to add authorization headers
  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {}
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Helper function to safely parse JSON responses
  const safeJson = async (res) => {
    if (!res.ok) {
      let errorMsg = res.statusText || 'Request failed';
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorMsg;
      } catch {
        // If not JSON, use status text
      }
      throw new Error(`HTTP ${res.status}: ${errorMsg}`);
    }
    return await res.json();
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const [transactionsRes, budgetsRes] = await Promise.all([
          fetch("/api/transactions", { headers: { ...getAuthHeaders() } }),
          fetch("/api/budgets", { headers: { ...getAuthHeaders() } }),
        ]);
        const transactions = await safeJson(transactionsRes);
        const budgets = await safeJson(budgetsRes);
        dispatch({ type: "SET_TRANSACTIONS", payload: transactions });
        dispatch({ type: "SET_BUDGETS", payload: budgets });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
  }, []);

  const addTransaction = async (transaction) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(transaction),
      });

      if (!res.ok) throw new Error("Failed to add transaction");

      const newTransaction = await res.json();
      dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    if (!id) return console.error("No ID provided");

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Failed to delete transaction");

      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    } catch (err) {
      console.error("Error deleting transaction:", err);
    }
  };

  const addBudget = async (budget) => {
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(budget),
      });

      const newBudget = await safeJson(res);
      dispatch({ type: "ADD_BUDGET", payload: newBudget });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateBudget = async (id, updates) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates),
      });

      const updatedBudget = await safeJson(res);
      dispatch({
        type: "UPDATE_BUDGET",
        payload: { id, updates: updatedBudget },
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    if (!id) {
      console.error("No ID provided to deleteBudget");
      return;
    }

    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      await safeJson(res); // Will throw if not ok
      dispatch({ type: "DELETE_BUDGET", payload: id });
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  };

  const value = {
    ...state,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
