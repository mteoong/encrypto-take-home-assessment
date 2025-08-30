"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useLoanInfo } from "@/lib/hooks"
import { formatCurrency } from "@/lib/formatters"

interface LoanDetailPageProps {
  loanId: string
}

export function LoanDetailPage({ loanId }: LoanDetailPageProps) {
  const [isPayNowLoading, setIsPayNowLoading] = useState(false)
  const [isPayInFullLoading, setIsPayInFullLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { data: loan, loading, error } = useLoanInfo(loanId)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Loan not found</h1>
        </div>
        {error && <p className="text-red-600">{error}</p>}
      </div>
    )
  }

  // Calculate loan progress based on real data
  const progressPercentage = loan.progress
  const paidAmount = (loan.terms.totalAmount * progressPercentage) / 100
  const remainingAmount = loan.terms.totalAmount - paidAmount
  const nextPayment = loan.nextPaymentDue || loan.terms.paymentSchedule.find(p => p.status === 'pending')
  const nextPaymentAmount = nextPayment?.totalAmount || 0
  const nextPaymentDate = nextPayment ? new Date(nextPayment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'
  const paymentsLeft = loan.terms.paymentSchedule.filter(p => p.status === 'pending').length
  
  // Get first letter of loan name for icon
  const loanIcon = loan.name.charAt(0).toUpperCase()

  const handlePayNow = async () => {
    setIsPayNowLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Payment Successful",
        description: `${formatCurrency(nextPaymentAmount)} payment has been processed.`,
      })

      // Navigate back to loans page
      router.push("/")
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPayNowLoading(false)
    }
  }

  const handlePayInFull = async () => {
    setIsPayInFullLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Loan Paid in Full",
        description: `${formatCurrency(remainingAmount)} has been paid. Your loan is now complete!`,
      })

      // Navigate back to loans page
      router.push("/")
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPayInFullLoading(false)
    }
  }

  return (
    <div className="p-2 space-y-2 w-full max-w-2xl mx-auto">
      {/* Loan Amount Card */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4 text-center space-y-3">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
            style={{ backgroundColor: "#7EE4B8" }}
          >
            <span className="text-white text-xl font-bold">{loanIcon}</span>
          </div>

          {/* Loan Title */}
          <h1 className="text-lg font-semibold text-foreground">{loan.name}</h1>

          {/* Total Amount */}
          <div className="text-3xl font-bold text-foreground">{formatCurrency(loan.terms.totalAmount)}</div>

          {/* Payment Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-base font-semibold max-w-xs mx-auto">
              <div>
                <div className="text-xs text-muted-foreground">Paid</div>
                <div>{formatCurrency(paidAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Left to pay</div>
                <div>{formatCurrency(remainingAmount)}</div>
              </div>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 max-w-xs mx-auto"
              style={
                {
                  "--progress-background": "#7EE4B8",
                } as React.CSSProperties
              }
            />
          </div>

          {/* Payment Schedule Indicators */}
          <div className="flex justify-center space-x-3 pt-2">
            {loan.terms.paymentSchedule.map((payment, index) => (
              <div key={payment.id} className="flex flex-col items-center space-y-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    payment.status === "paid"
                      ? "text-black"
                      : payment.status === "pending" &&
                          index === loan.terms.paymentSchedule.findIndex((p) => p.status === "pending")
                        ? "bg-gray-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                  style={payment.status === "paid" ? { backgroundColor: "#7EE4B8" } : undefined}
                >
                  {payment.status === "paid" ? "✓" : payment.paymentNumber}
                </div>
                <div className="text-xs font-medium">{formatCurrency(payment.totalAmount)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loan Details Card */}
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-base font-semibold mb-3">Loan Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">APR</span>
              <span className="font-medium">{loan.terms.apr}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest</span>
              <span className="font-medium">{formatCurrency(loan.terms.totalInterest)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Payment</span>
              <span className="font-medium">{formatCurrency(nextPaymentAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">{nextPaymentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payments Left</span>
              <span className="font-medium">
                {paymentsLeft} of {loan.terms.totalPayments}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handlePayNow}
          disabled={isPayNowLoading}
          className="w-full h-10 text-black font-medium rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#7EE4B8" }}
        >
          {isPayNowLoading ? "Processing..." : `Pay Now - ${formatCurrency(nextPaymentAmount)}`}
        </Button>

        <Button
          onClick={handlePayInFull}
          disabled={isPayInFullLoading}
          variant="outline"
          className="w-full h-10 font-medium rounded-lg border-border hover:bg-muted bg-transparent"
        >
          {isPayInFullLoading ? "Processing..." : `Pay in Full - ${formatCurrency(remainingAmount)}`}
        </Button>
      </div>
    </div>
  )
}
