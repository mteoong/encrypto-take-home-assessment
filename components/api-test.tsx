"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreditInfo, useBalance, useLoans } from "@/lib/hooks"
import { formatCurrency } from "@/lib/formatters"

export function ApiTest() {
  const { data: creditInfo, loading: creditLoading, error: creditError, refetch: refetchCredit } = useCreditInfo()
  const { data: balance, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useBalance()
  const { data: loans, loading: loansLoading, error: loansError, refetch: refetchLoans } = useLoans()

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">API Test - Clean Slate</h1>
      
      {/* Credit Info Test */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Info API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={refetchCredit} size="sm">Test Credit API</Button>
          {creditLoading && <p className="text-blue-600">Loading...</p>}
          {creditError && <p className="text-red-600">Error: {creditError}</p>}
          {creditInfo && (
            <div className="space-y-1 text-sm">
              <p><strong>Limit:</strong> {formatCurrency(creditInfo.limit)}</p>
              <p><strong>Used:</strong> {formatCurrency(creditInfo.used)}</p>
              <p><strong>Available:</strong> {formatCurrency(creditInfo.available)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Test */}
      <Card>
        <CardHeader>
          <CardTitle>Balance API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={refetchBalance} size="sm">Test Balance API</Button>
          {balanceLoading && <p className="text-blue-600">Loading...</p>}
          {balanceError && <p className="text-red-600">Error: {balanceError}</p>}
          {balance && (
            <div className="space-y-1 text-sm">
              <p><strong>Card Balance:</strong> {formatCurrency(balance.amount)}</p>
              <p><strong>Currency:</strong> {balance.currency}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loans Test */}
      <Card>
        <CardHeader>
          <CardTitle>Loans API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={refetchLoans} size="sm">Test Loans API</Button>
          {loansLoading && <p className="text-blue-600">Loading...</p>}
          {loansError && <p className="text-red-600">Error: {loansError}</p>}
          {loans !== null && (
            <div className="space-y-1 text-sm">
              <p><strong>Number of Loans:</strong> {loans.length}</p>
              {loans.length === 0 && <p className="text-gray-600">✅ No loans (clean slate)</p>}
              {loans.map((loan) => (
                <div key={loan.id} className="border p-2 rounded">
                  <p><strong>Name:</strong> {loan.name}</p>
                  <p><strong>Amount:</strong> {formatCurrency(loan.amount)}</p>
                  <p><strong>Status:</strong> {loan.status}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expected Clean State Summary */}
      <Card className="bg-green-50 dark:bg-green-950/30">
        <CardHeader>
          <CardTitle>Expected Clean State ✅</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <p><strong>Card Balance:</strong> $1,000.00</p>
          <p><strong>Credit Limit:</strong> $5,000.00</p>
          <p><strong>Used:</strong> $0.00</p>
          <p><strong>Available:</strong> $5,000.00</p>
          <p><strong>Loans:</strong> 0 (empty array)</p>
        </CardContent>
      </Card>
    </div>
  )
}