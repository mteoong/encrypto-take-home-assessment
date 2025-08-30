import { CreditInfo, Balance, Loan, Transaction, PaymentSchedule, LoanTerms, DepositAddress } from './types'

// Mock credit information - CLEAN SLATE
export const mockCreditInfo: CreditInfo = {
  limit: 5000,
  used: 0,
  available: 5000
}

// Mock balance - CLEAN SLATE  
export const mockBalance: Balance = {
  amount: 1000.00,
  currency: 'USD'
}

// Mock payment schedules
const createPaymentSchedule = (loanAmount: number, totalPayments: number, apr: number, startDate: Date): PaymentSchedule[] => {
  const schedule: PaymentSchedule[] = []
  const monthlyRate = apr / 100 / 12
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                        (Math.pow(1 + monthlyRate, totalPayments) - 1)
  
  let remainingBalance = loanAmount
  
  for (let i = 0; i < totalPayments; i++) {
    const interestAmount = remainingBalance * monthlyRate
    const principalAmount = monthlyPayment - interestAmount
    remainingBalance -= principalAmount
    
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + i)
    
    schedule.push({
      id: `payment-${i + 1}`,
      paymentNumber: i + 1,
      dueDate: paymentDate.toISOString().split('T')[0],
      principalAmount: Math.round(principalAmount * 100) / 100,
      interestAmount: Math.round(interestAmount * 100) / 100,
      totalAmount: Math.round(monthlyPayment * 100) / 100,
      status: i === 0 ? 'pending' : 'pending'
    })
  }
  
  return schedule
}

// Mock loan terms for different scenarios
export const generateLoanTerms = (amount: number, payments: 3 | 6 | 12): LoanTerms => {
  const aprMap = { 3: 12.5, 6: 15.2, 12: 18.9 }
  const apr = aprMap[payments]
  const startDate = new Date()
  
  const paymentSchedule = createPaymentSchedule(amount, payments, apr, startDate)
  const totalInterest = paymentSchedule.reduce((sum, payment) => sum + payment.interestAmount, 0)
  const monthlyPayment = paymentSchedule[0]?.totalAmount || 0
  
  return {
    id: `terms-${Date.now()}`,
    amount,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayments: payments,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalAmount: Math.round((amount + totalInterest) * 100) / 100,
    apr,
    paymentSchedule
  }
}

// Mock active loans - CLEAN SLATE (no loans)
export const mockLoans: Loan[] = []

// Mock transactions - CLEAN SLATE (just initial card load)
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-initial',
    type: 'card_load',
    amount: 1000,
    description: 'Initial card balance',
    date: new Date().toISOString(),
    status: 'completed'
  }
]

// Mock deposit addresses for different networks
export const mockDepositAddresses: DepositAddress[] = [
  {
    address: '0x742d35Cc9B2D8B3B8e4a8C6B7A9E3D2F1C0B9A8E',
    network: 'Ethereum',
    currency: 'USDC',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVUSCBRUjwvdGV4dD48L3N2Zz4='
  },
  {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin',
    currency: 'BTC',
    qrCode: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRkZGIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJUQyBRUjwvdGV4dD48L3N2Zz4='
  }
]

// Utility function to simulate network delays - REDUCED for testing
export const simulateNetworkDelay = (min = 100, max = 300): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise(resolve => setTimeout(resolve, delay))
}

// Utility function to simulate occasional errors - DISABLED for clean testing
export const simulateRandomError = (errorRate = 0.1): boolean => {
  return false // Disabled for now to ensure APIs work
}