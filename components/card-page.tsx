"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpIcon, ArrowDownIcon, CreditCardIcon } from "lucide-react"
import { useBalance, useTransactions } from "@/lib/hooks"
import { formatCurrency } from "@/lib/formatters"

const formatDate = (timestamp: string) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp))
}

export function CardPage() {
  const { data: balance, loading: isLoadingBalance, error: balanceError } = useBalance()
  const { data: transactions, loading: isLoadingTransactions, error: transactionsError } = useTransactions()

  const error = balanceError || transactionsError

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Card - Visual Credit Card */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-6">
          {isLoadingBalance ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-32 mb-6"></div>
              <div className="h-4 bg-gray-700 rounded w-40"></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Current Balance</p>
                <h2 className="text-3xl font-bold text-white mb-4">{formatCurrency(balance?.amount || 0)}</h2>
                <div className="flex items-center gap-2 text-gray-400">
                  <CreditCardIcon className="h-4 w-4" />
                  <span className="text-sm">•••• •••• •••• 4829</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs mb-1">Valid Thru</p>
                <p className="text-white text-sm">12/27</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Summary Card */}
      <Card className="border-gray-800">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-24"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {/* Deposits */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUpIcon className="h-4 w-4 text-[#7EE4B8]" />
                  <span className="text-gray-400 text-sm">Deposits</span>
                </div>
                <p className="text-2xl font-bold text-[#7EE4B8]">
                  {formatCurrency(
                    (transactions?.filter(t => t.type === 'card_load' || t.type === 'loan_disbursement').reduce((sum, t) => sum + t.amount, 0) || 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Deposited</p>
              </div>

              {/* Expenses */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowDownIcon className="h-4 w-4 text-red-400" />
                  <span className="text-gray-400 text-sm">Expenses</span>
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {formatCurrency(
                    Math.abs(transactions?.filter(t => t.amount < 0 && t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0) || 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">This Month</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions Section */}
      <Card className="border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            {transactions && transactions.length > 0 && (
              <Button variant="ghost" size="sm" className="text-[#7EE4B8] hover:text-[#7EE4B8]/80">
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="space-y-4" aria-live="polite" aria-label="Loading transactions">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between py-3">
                  <div>
                    <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No recent activity.</p>
            </div>
          ) : (
            <div className="space-y-1" role="list" aria-label="Recent transactions">
              {transactions?.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b border-gray-800 last:border-b-0"
                  role="listitem"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-white text-sm">{transaction.description}</h4>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-semibold text-sm ${transaction.amount >= 0 ? "text-[#7EE4B8]" : "text-red-400"}`}
                    >
                      {transaction.amount >= 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
