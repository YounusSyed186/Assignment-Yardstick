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
    if (token) {
      console.log('[API] Adding auth token to headers:', token.substring(0, 20) + '...')
      return { Authorization: `Bearer ${token}` }
    }
    console.log('[API] No token available for headers')
    return {}
  }

  // Helper function to safely parse JSON responses
  const safeJson = async (res) => {
    if (!res.ok) {
      let errorMsg = res.statusText || 'Request failed'
      console.log(`[API] Response not ok (${res.status}), attempting to parse error`)
      try {
        const errorData = await res.json()
        errorMsg = errorData.message || errorMsg
      } catch {
        // If not JSON, use status text
        console.log('[API] Error response is not JSON')
      }
      const fullError = `HTTP ${res.status}: ${errorMsg}`
      console.error('[API] Request failed:', fullError)
      throw new Error(fullError)
    }
    return await res.json()
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
  // Fetch all data on mount
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        console.log('[AppContext] Fetching initial data (transactions & budgets)')
        const [transactionsRes, budgetsRes] = await Promise.all([
          fetch("/api/transactions", { 
            headers: { ...getAuthHeaders() },
            credentials: 'include',
          }),
          fetch("/api/budgets", { 
            headers: { ...getAuthHeaders() },
            credentials: 'include',
          }),
        ]);
        const transactions = await safeJson(transactionsRes);
        const budgets = await safeJson(budgetsRes);
        
        // Ensure arrays for safety
        const transactionsArray = Array.isArray(transactions) ? transactions : [];
        const budgetsArray = Array.isArray(budgets) ? budgets : [];
        
        dispatch({ type: "SET_TRANSACTIONS", payload: transactionsArray });
        dispatch({ type: "SET_BUDGETS", payload: budgetsArray });
        console.log(`[AppContext] Data fetched: ${transactionsArray.length} transactions, ${budgetsArray.length} budgets`)
      } catch (err) {
        console.error("[AppContext] Error fetching data:", err);
        dispatch({ type: "SET_TRANSACTIONS", payload: [] });
        dispatch({ type: "SET_BUDGETS", payload: [] });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
  }, []);

  const addTransaction = async (transaction) => {
    try {
      console.log('[AppContext] Adding transaction')
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(transaction),
        credentials: 'include',
      });

      const newTransaction = await safeJson(res);
      dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
      console.log('[AppContext] Transaction added successfully')
    } catch (err) {
      console.error('[AppContext] Error adding transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    if (!id) {
      console.error('[AppContext] No ID provided for delete');
      return;
    }

    try {
      console.log('[AppContext] Deleting transaction:', id)
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      await safeJson(res);
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
      console.log('[AppContext] Transaction deleted successfully')
    } catch (err) {
      console.error('[AppContext] Error deleting transaction:', err);
      throw err;
    }
  };

  const addBudget = async (budget) => {
    try {
      console.log('[AppContext] Adding budget')
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(budget),
        credentials: 'include',
      });

      const newBudget = await safeJson(res);
      dispatch({ type: "ADD_BUDGET", payload: newBudget });
      console.log('[AppContext] Budget added successfully')
    } catch (err) {
      console.error('[AppContext] Error adding budget:', err);
      throw err;
    }
  };

  const updateBudget = async (id, updates) => {
    try {
      console.log('[AppContext] Updating budget:', id)
      const res = await fetch(`/api/budgets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(updates),
        credentials: 'include',
      });

      const updatedBudget = await safeJson(res);
      dispatch({
        type: "UPDATE_BUDGET",
        payload: { id, updates: updatedBudget },
      });
      console.log('[AppContext] Budget updated successfully')
    } catch (err) {
      console.error('[AppContext] Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (id) => {
    if (!id) {
      console.error('[AppContext] No ID provided to deleteBudget');
      return;
    }

    try {
      console.log('[AppContext] Deleting budget:', id)
      const res = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      await safeJson(res);
      dispatch({ type: "DELETE_BUDGET", payload: id });
      console.log('[AppContext] Budget deleted successfully')
    } catch (err) {
      console.error('[AppContext] Error deleting budget:', err.message);
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
