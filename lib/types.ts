export interface CreditInfo {
  limit: number
  used: number
  available: number
}

export interface Balance {
  amount: number
  currency: string
}

export interface LoanTerms {
  id: string
  amount: number
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  totalAmount: number
  apr: number
  paymentSchedule: PaymentSchedule[]
}

export interface PaymentSchedule {
  id: string
  paymentNumber: number
  dueDate: string
  principalAmount: number
  interestAmount: number
  totalAmount: number
  status: 'pending' | 'paid' | 'overdue'
}

export interface Loan {
  id: string
  name: string
  amount: number
  terms: LoanTerms
  status: 'pending' | 'active' | 'completed' | 'defaulted'
  createdAt: string
  nextPaymentDue?: PaymentSchedule
  progress: number
}

export interface Transaction {
  id: string
  type: 'loan_disbursement' | 'loan_payment' | 'card_load' | 'purchase'
  amount: number
  description: string
  date: string
  status: 'pending' | 'completed' | 'failed'
  loanId?: string
}

export interface DepositAddress {
  address: string
  network: string
  currency: string
  qrCode: string
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}