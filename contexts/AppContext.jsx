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
        transactions: state.transactions.filter((t) => t._id !== action.payload),
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

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const [transactionsRes, budgetsRes] = await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/budgets"),
        ]);
        const [transactions, budgets] = await Promise.all([
          transactionsRes.json(),
          budgetsRes.json(),
        ]);
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
        headers: { "Content-Type": "application/json" },
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
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete transaction");

      dispatch({ type: "DELETE_TRANSACTION", payload: id });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addBudget = async (budget) => {
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });

      if (!res.ok) throw new Error("Failed to add budget");

      const newBudget = await res.json();
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update budget");

      const updatedBudget = await res.json();
      dispatch({ type: "UPDATE_BUDGET", payload: { id, updates: updatedBudget } });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete budget");

      dispatch({ type: "DELETE_BUDGET", payload: id });
    } catch (err) {
      console.error(err);
      throw err;
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
