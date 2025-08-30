"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useLoanInitiation, useLoanApproval } from "@/lib/hooks"
import { LoanTerms } from "@/lib/types"
import { formatCurrency } from "@/lib/formatters"
import { useRouter } from "next/navigation"

// Remove the old LoanPlan interface since we're using LoanTerms from types

interface NewLoanModalProps {
  isOpen: boolean
  onClose: () => void
  remainingLimit: number
  onLoanCreated: (amount: number) => void
}

export function NewLoanModal({ isOpen, onClose, remainingLimit, onLoanCreated }: NewLoanModalProps) {
  const [step, setStep] = useState(1)
  const [loanAmount, setLoanAmount] = useState(100)
  const [loanName, setLoanName] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<LoanTerms | null>(null)
  const [loanNameError, setLoanNameError] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  
  // Use the API hooks
  const { initiateLoan, data: loanOptions, loading: initiating, error: initiateError } = useLoanInitiation()
  const { approveLoan, loading: approving } = useLoanApproval()

  const minAmount = 100
  const maxAmount = remainingLimit

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setLoanAmount(100)
      setLoanName("")
      setSelectedPlan(null)
      setLoanNameError(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (initiateError) {
      toast({
        title: "Error",
        description: initiateError,
        variant: "destructive",
      })
    }
  }, [initiateError, toast])

  const handleAmountChange = (value: number[]) => {
    const newAmount = value[0]
    setLoanAmount(newAmount)
  }

  const handleGetLoanTerms = async () => {
    if (loanAmount >= minAmount && loanAmount <= maxAmount) {
      const nameToUse = loanName.trim() || "Loan"
      await initiateLoan(loanAmount, nameToUse)
    }
  }

  // Auto-refresh loan terms when amount changes (with debouncing)
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setTimeout(() => {
      if (loanAmount >= minAmount && loanAmount <= maxAmount) {
        const nameToUse = loanName.trim() || "Loan"
        initiateLoan(loanAmount, nameToUse)
      }
    }, 800) // Wait 800ms after user stops changing
    
    return () => clearTimeout(timer)
  }, [loanAmount]) // Only depend on loanAmount

  const handleContinue = () => {
    setLoanNameError(false)

    if (!loanName.trim()) {
      setLoanNameError(true)
      return
    }

    if (!selectedPlan) {
      toast({
        title: "Payment plan required",
        description: "Please select a payment plan to continue.",
        variant: "destructive",
      })
      return
    }

    if (loanAmount < minAmount || loanAmount > maxAmount) {
      toast({
        title: "Invalid amount", 
        description: `Amount must be between ${formatCurrency(minAmount)} and ${formatCurrency(maxAmount)}.`,
        variant: "destructive",
      })
      return
    }

    // Move to confirmation step
    setStep(2)
  }

  const handleConfirmLoan = async () => {
    if (!selectedPlan) {
      toast({
        title: "No Plan Selected",
        description: "Please select a payment plan first.",
        variant: "destructive",
      })
      return
    }

    try {
      // Call POST approve to finalize the loan - pass payment count in termsId
      const termsId = `terms${selectedPlan.totalPayments}-${selectedPlan.id}`
      const result = await approveLoan(termsId, loanAmount, loanName)

      toast({
        title: "Loan Created Successfully",
        description: `${formatCurrency(loanAmount)} has been added to your card balance.`,
        variant: "success",
      })

      // Server-first refresh to ensure data consistency
      router.refresh()
      
      onLoanCreated(loanAmount)
      onClose()
    } catch (error) {
      toast({
        title: "Loan Creation Failed",
        description: "There was an error creating your loan. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (step === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Pay over time</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="loan-name" className="text-sm font-medium text-foreground mb-2 block">
                Loan name or reason *
              </label>
              <Input
                id="loan-name"
                value={loanName}
                onChange={(e) => {
                  const name = e.target.value
                  setLoanName(name)
                  if (loanNameError) setLoanNameError(false)
                  // Name changes will trigger the debounced effect above
                }}
                placeholder="e.g., Home improvement, Emergency fund"
                className="w-full"
                aria-describedby={loanNameError ? "loan-name-error" : undefined}
                aria-invalid={loanNameError ? "true" : "false"}
              />
              {loanNameError && (
                <div 
                  id="loan-name-error" 
                  role="status" 
                  aria-live="polite" 
                  className="text-red-500 text-sm"
                >
                  Loan name is required
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <label htmlFor="loan-amount-slider" className="text-sm font-medium text-foreground mb-2 block">
                  Loan Amount
                </label>
                <div className="text-3xl font-bold">{formatCurrency(loanAmount)}</div>
              </div>

              <div className="space-y-2">
                <Slider
                  id="loan-amount-slider"
                  value={[loanAmount]}
                  onValueChange={handleAmountChange}
                  min={minAmount}
                  max={maxAmount}
                  step={10}
                  className="w-full"
                  aria-label={`Loan amount: ${formatCurrency(loanAmount)}`}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Min: {formatCurrency(minAmount)}</span>
                  <span>Max: {formatCurrency(maxAmount)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <fieldset>
                <legend className="text-sm font-medium text-foreground">Choose payment plan</legend>
              
              {initiating && (
                <div className="text-center py-4">
                  <div className="animate-pulse text-sm text-muted-foreground">Getting loan terms...</div>
                </div>
              )}
              
              {loanOptions && !initiating && (
                <div className="space-y-3">

                {/* 3 Payment Option */}
                <Card
                  className={`cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedPlan?.totalPayments === 3 
                      ? "ring-2 ring-purple-600 bg-purple-50 dark:bg-purple-950/30" 
                      : ""
                  }`}
                  onClick={() => setSelectedPlan(loanOptions.terms3)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedPlan?.totalPayments === 3}
                  aria-label={`3 payment plan: ${formatCurrency(loanOptions.terms3.monthlyPayment)} per month, ${loanOptions.terms3.apr}% APR`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedPlan(loanOptions.terms3)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(loanOptions.terms3.monthlyPayment)}</div>
                        <div className="text-sm text-muted-foreground">Every month</div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {loanOptions.terms3.totalPayments} payments
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ml-3 ${
                            selectedPlan?.totalPayments === 3
                              ? "bg-purple-600 border-purple-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPlan?.totalPayments === 3 && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">APR</div>
                        <div className="font-medium">{loanOptions.terms3.apr}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Interest</div>
                        <div className="font-medium">{formatCurrency(loanOptions.terms3.totalInterest)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="font-medium">{formatCurrency(loanOptions.terms3.totalAmount)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 6 Payment Option */}
                <Card
                  className={`cursor-pointer transition-all hover:bg-muted/50 ${
                    selectedPlan?.totalPayments === 6 
                      ? "ring-2 ring-purple-600 bg-purple-50 dark:bg-purple-950/30" 
                      : ""
                  }`}
                  onClick={() => setSelectedPlan(loanOptions.terms6)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedPlan?.totalPayments === 6}
                  aria-label={`6 payment plan: ${formatCurrency(loanOptions.terms6.monthlyPayment)} per month, ${loanOptions.terms6.apr}% APR`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedPlan(loanOptions.terms6)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-2xl font-bold">{formatCurrency(loanOptions.terms6.monthlyPayment)}</div>
                        <div className="text-sm text-muted-foreground">Every month</div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {loanOptions.terms6.totalPayments} payments
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ml-3 ${
                            selectedPlan?.totalPayments === 6
                              ? "bg-purple-600 border-purple-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPlan?.totalPayments === 6 && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">APR</div>
                        <div className="font-medium">{loanOptions.terms6.apr}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Interest</div>
                        <div className="font-medium">{formatCurrency(loanOptions.terms6.totalInterest)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total</div>
                        <div className="font-medium">{formatCurrency(loanOptions.terms6.totalAmount)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </div>
              )}
              
              {!loanOptions && !initiating && (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">Adjust the loan amount to see payment options</div>
                </div>
              )}
              </fieldset>
            </div>

            <Button 
              onClick={handleContinue}
              disabled={initiating || !selectedPlan}
              className="w-full h-12 text-white font-medium bg-black hover:bg-gray-800 disabled:opacity-50"
            >
              {initiating ? "Getting loan terms..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // No need for this line anymore since we have selectedPlan directly

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-lg font-semibold">Confirm</DialogTitle>
          <div className="w-10"></div> {/* Spacer to maintain layout balance */}
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#7EE4B8] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="text-3xl font-bold">{formatCurrency(selectedPlan?.monthlyPayment || 0)}</div>
            <div className="text-sm text-muted-foreground">Every month</div>
            <div className="flex justify-center">
              <div className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                {selectedPlan?.totalPayments} payments
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center px-8">
            <div className="relative flex items-center">
              {/* Background line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
              
              {/* Progress line (partial) */}
              <div className="absolute top-1/2 left-0 h-0.5 bg-[#7EE4B8] -translate-y-1/2" style={{ width: '20%' }}></div>
              
              {/* Payment circles */}
              {Array.from({ length: selectedPlan?.totalPayments || 0 }, (_, index) => (
                <div key={index} className="relative flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    index === 0 
                      ? 'bg-[#7EE4B8] border-[#7EE4B8]' 
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                  } z-10`}></div>
                  {index < (selectedPlan?.totalPayments || 0) - 1 && (
                    <div className="w-16 h-0.5"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Loan amount</span>
              <span className="text-sm font-medium">{formatCurrency(loanAmount)}</span>
            </div>
          </div>

          <Button
            onClick={handleConfirmLoan}
            disabled={approving}
            className="w-full h-12 text-white font-medium bg-black hover:bg-gray-800 disabled:opacity-50"
          >
            {approving ? "Creating loan..." : "Get Loan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
