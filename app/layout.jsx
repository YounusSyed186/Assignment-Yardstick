// app/layout.jsx
import ClientProviders from "../components/clientProvider"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ExpenseTracker - Spending Savvy Board",
  description:
    "Track your expenses, manage budgets, and gain financial insights",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
