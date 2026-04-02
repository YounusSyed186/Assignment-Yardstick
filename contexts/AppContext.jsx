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
          b._id === action.payload.id
            ? { ...b, ...action.payload.updates }
            : b
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

  // Auth headers
  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("auth_token");

    if (token) {
      console.log(
        "[API] Adding auth token:",
        token.substring(0, 20) + "..."
      );
      return { Authorization: `Bearer ${token}` };
    }

    console.log("[API] No token found");
    return {};
  };

  // Safe JSON handler
  const safeJson = async (res) => {
    if (!res.ok) {
      let errorMsg = res.statusText || "Request failed";

      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorMsg;
      } catch {
        console.log("[API] Non-JSON error response");
      }

      throw new Error(`HTTP ${res.status}: ${errorMsg}`);
    }

    return res.json();
  };

  // ✅ FIXED useEffect (only once, no nesting)
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        console.log("[AppContext] Fetching data...");

        const [transactionsRes, budgetsRes] = await Promise.all([
          fetch("/api/transactions", {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
          fetch("/api/budgets", {
            headers: getAuthHeaders(),
            credentials: "include",
          }),
        ]);

        const transactions = await safeJson(transactionsRes);
        const budgets = await safeJson(budgetsRes);

        dispatch({
          type: "SET_TRANSACTIONS",
          payload: Array.isArray(transactions) ? transactions : [],
        });

        dispatch({
          type: "SET_BUDGETS",
          payload: Array.isArray(budgets) ? budgets : [],
        });

        console.log("[AppContext] Data loaded");
      } catch (err) {
        console.error("[AppContext] Fetch error:", err);

        dispatch({ type: "SET_TRANSACTIONS", payload: [] });
        dispatch({ type: "SET_BUDGETS", payload: [] });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    fetchData();
  }, []);

  const addTransaction = async (transaction) => {
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(transaction),
      credentials: "include",
    });

    const data = await safeJson(res);
    dispatch({ type: "ADD_TRANSACTION", payload: data });
  };

  const deleteTransaction = async (id) => {
    if (!id) return;

    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    await safeJson(res);
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const addBudget = async (budget) => {
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(budget),
      credentials: "include",
    });

    const data = await safeJson(res);
    dispatch({ type: "ADD_BUDGET", payload: data });
  };

  const updateBudget = async (id, updates) => {
    const res = await fetch(`/api/budgets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(updates),
      credentials: "include",
    });

    const data = await safeJson(res);

    dispatch({
      type: "UPDATE_BUDGET",
      payload: { id, updates: data },
    });
  };

  const deleteBudget = async (id) => {
    if (!id) return;

    const res = await fetch(`/api/budgets/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });

    await safeJson(res);
    dispatch({ type: "DELETE_BUDGET", payload: id });
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

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}