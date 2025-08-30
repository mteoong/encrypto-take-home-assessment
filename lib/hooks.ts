"use client"

import { useState, useEffect } from 'react'
import { 
  CreditInfo, 
  Balance, 
  Loan, 
  Transaction, 
  LoanTerms, 
  DepositAddress,
  ApiResponse 
} from './types'
import * as api from './api'

// Generic hook for API calls with loading, error, and success states
function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      setData(response.data)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, dependencies)

  return { data, loading, error, success, refetch: fetchData }
}

// Hook for credit information
export function useCreditInfo() {
  return useApiCall(() => api.getCreditInfo())
}

// Hook for balance
export function useBalance() {
  return useApiCall(() => api.getBalance())
}

// Hook for loans list
export function useLoans() {
  return useApiCall(() => api.getLoans())
}

// Hook for specific loan info
export function useLoanInfo(loanId: string | null) {
  return useApiCall(
    () => loanId ? api.getLoanInfo(loanId) : Promise.reject(new Error('No loan ID provided')),
    [loanId]
  )
}

// Hook for transactions
export function useTransactions(limit = 50, offset = 0) {
  return useApiCall(() => api.getTransactions(limit, offset), [limit, offset])
}

// Hook for loan-specific transactions
export function useLoanTransactions(loanId: string | null) {
  return useApiCall(
    () => loanId ? api.getLoanTransactions(loanId) : Promise.reject(new Error('No loan ID provided')),
    [loanId]
  )
}

// Hook for loan initiation (mutation)
export function useLoanInitiation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<{ terms3: LoanTerms; terms6: LoanTerms } | null>(null)

  const initiateLoan = async (amount: number, name: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const response = await api.initiateLoan(amount, name)
      setData(response.data)
      setSuccess(true)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate loan'
      setError(errorMessage)
      setSuccess(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return { initiateLoan, loading, error, success, data, reset }
}

// Hook for loan approval (mutation)
export function useLoanApproval() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<{ loanId: string; newBalance: number } | null>(null)

  const approveLoan = async (termsId: string, amount: number, name: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const response = await api.approveLoan(termsId, amount, name)
      setData(response.data)
      setSuccess(true)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve loan'
      setError(errorMessage)
      setSuccess(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return { approveLoan, loading, error, success, data, reset }
}

// Hook for loan payment (mutation)
export function useLoanPayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [data, setData] = useState<{ transactionId: string; remainingBalance: number } | null>(null)

  const makePayment = async (loanId: string, amount: number, paymentId: string) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const response = await api.makeLoanPayment(loanId, amount, paymentId)
      setData(response.data)
      setSuccess(true)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed'
      setError(errorMessage)
      setSuccess(false)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return { makePayment, loading, error, success, data, reset }
}

// Hook for deposit address
export function useDepositAddress(loanId: string | null, currency: 'BTC' | 'ETH' | 'USDC' = 'USDC') {
  return useApiCall(
    () => loanId ? api.getDepositAddress(loanId, currency) : Promise.reject(new Error('No loan ID provided')),
    [loanId, currency]
  )
}

// Combined hook for dashboard data (credit info + balance + loans)
export function useDashboardData() {
  const creditInfo = useCreditInfo()
  const balance = useBalance()
  const loans = useLoans()

  return {
    creditInfo: creditInfo.data,
    balance: balance.data,
    loans: loans.data,
    loading: creditInfo.loading || balance.loading || loans.loading,
    error: creditInfo.error || balance.error || loans.error,
    success: creditInfo.success && balance.success && loans.success,
    refetch: () => {
      creditInfo.refetch()
      balance.refetch()
      loans.refetch()
    }
  }
}