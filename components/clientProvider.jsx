// components/ClientProviders.jsx
"use client"

import { ThemeProvider } from "next-themes"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { AppProvider } from "../contexts/AppContext"
import ClientWrapper from "./ClientWrapper"
import { Toaster } from "./ui/toaster"
import { Toaster as Sonner } from "./ui/sonner"

export default function ClientProviders({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClientWrapper>
        <TooltipProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            {children}
          </AppProvider>
        </TooltipProvider>
      </ClientWrapper>
    </ThemeProvider>
  )
}
