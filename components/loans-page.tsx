"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ToastContainer } from "@/components/ui/toast"
import { useState } from "react"
import { Clock } from "lucide-react"
import Link from "next/link"
import { NewLoanModal } from "./new-loan-modal"
import { useToast } from "@/hooks/use-toast"
import { useDashboardData, useLoanPayment } from "@/lib/hooks"
import { formatCurrency } from "@/lib/formatters"

// Helper function to get loan icon color
const getLoanIconColor = (name: string) => {
  const colors = [
    "bg-green-600",
    "bg-blue-600", 
    "bg-orange-600",
    "bg-red-600",
    "bg-purple-600",
    "bg-pink-600"
  ]
  return colors[name.length % colors.length]
}

// Helper function to get loan icon letter
const getLoanIcon = (name: string) => {
  return name.charAt(0).toUpperCase()
}

export function LoansPage() {
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false)
  const { toast, toasts, dismiss } = useToast()
  const { makePayment, loading: paymentLoading } = useLoanPayment()
  
  // Get real data from APIs
  const { 
    creditInfo, 
    balance, 
    loans, 
    loading, 
    error, 
    refetch 
  } = useDashboardData()

  // Calculate upcoming payment amount from active loans
  const upcomingDue = loans?.reduce((total, loan) => {
    return total + (loan.nextPaymentDue?.totalAmount || 0)
  }, 0) || 0

  const handlePayNow = async () => {
    if (!loans || loans.length === 0) {
      toast({
        title: "No Payments Due",
        description: "You don't have any upcoming payments.",
        variant: "default",
      })
      return
    }

    try {
      // Process all upcoming payments
      for (const loan of loans) {
        if (loan.nextPaymentDue) {
          await makePayment(
            loan.id, 
            loan.nextPaymentDue.totalAmount, 
            loan.nextPaymentDue.id
          )
        }
      }
      
      toast({
        title: "Payment Successful",
        description: `Payment of ${formatCurrency(upcomingDue)} has been processed successfully.`,
        variant: "success",
      })
      
      // Refresh data after successful payment
      refetch()
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleNewLoan = () => {
    setIsNewLoanModalOpen(true)
  }

  const handleLoanCreated = (amount: number) => {
    // Refresh all data after loan creation
    refetch()
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 space-y-8 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-muted-foreground">Loading your loan information...</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="h-24 bg-muted rounded-lg"></div>
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-8 max-w-4xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
        <Button onClick={refetch}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-balance">Loans</h1>
        <p className="text-muted-foreground">Manage your loans and payments</p>
      </div>

      {/* Summary Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Summary</h2>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Upcoming Due</h3>

              <div className="text-4xl font-bold text-foreground">
                {formatCurrency(upcomingDue)}
              </div>

              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-sm text-muted-foreground">
                  {loans?.length || 0} Payment{loans?.length !== 1 ? 's' : ''}
                </span>
              </div>

              <Button
                onClick={handlePayNow}
                disabled={paymentLoading || upcomingDue === 0}
                className="w-full h-12 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                {paymentLoading ? "Processing..." : upcomingDue === 0 ? "No Payments Due" : "Pay Now"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </section>

      {/* Borrowing Section */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Borrowing</h2>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(creditInfo?.available || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Remaining credit limit
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(creditInfo?.used || 0)} of {formatCurrency(creditInfo?.limit || 0)} used
                </p>
              </div>
              <Button
                onClick={handleNewLoan}
                disabled={!creditInfo || creditInfo.available <= 0}
                className="px-4 py-2 text-black font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: "var(--accent-green)" }}
              >
                {!creditInfo ? "Loading..." : creditInfo.available <= 0 ? "No Credit Available" : "Get Loan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Payments Section */}
      <section className="space-y-4" data-section="payments">
        <h2 className="text-xl font-semibold">Payments</h2>

        {loans && loans.length > 0 ? (
          <div className="space-y-6">
            {loans.map((loan) => (
              <div key={loan.id} className="mb-4">
                <Link href={`/loan/${loan.id}`}>
                  <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="px-3 py-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getLoanIconColor(loan.name)} rounded-full flex items-center justify-center`}>
                            <span className="text-white text-sm font-bold">{getLoanIcon(loan.name)}</span>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{loan.name}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              Due: {loan.nextPaymentDue?.dueDate || 'No payment due'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">
                            {formatCurrency(loan.nextPaymentDue?.totalAmount || 0)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Payment {loan.nextPaymentDue?.paymentNumber || 0} of {loan.terms.totalPayments}
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-2">
                        <Progress
                          value={loan.progress}
                          className="h-2"
                          style={
                            {
                              "--progress-background": "var(--accent-green)",
                            } as React.CSSProperties
                          }
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round(loan.progress)}% paid</span>
                          <span>{Math.round(100 - loan.progress)}% remaining</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active loans</p>
          </div>
        )}
      </section>

      {/* New Loan Modal */}
      <NewLoanModal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        remainingLimit={creditInfo?.available || 0}
        onLoanCreated={handleLoanCreated}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={dismiss} />
    </div>
  )
}
