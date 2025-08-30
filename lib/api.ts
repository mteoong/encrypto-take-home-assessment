import { 
  CreditInfo, 
  Balance, 
  LoanTerms, 
  Loan, 
  Transaction, 
  DepositAddress, 
  ApiResponse 
} from './types'
import { 
  mockCreditInfo, 
  mockBalance, 
  mockLoans, 
  mockTransactions, 
  mockDepositAddresses,
  generateLoanTerms,
  simulateNetworkDelay,
  simulateRandomError
} from './mock-data'

// Borrowing info: GET credit limit and amount borrowed
export async function getCreditInfo(): Promise<ApiResponse<CreditInfo>> {
  await simulateNetworkDelay(400, 800)
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to fetch credit information')
  }
  
  return {
    data: mockCreditInfo,
    success: true,
    message: 'Credit information retrieved successfully'
  }
}

// Balance: GET current balance
export async function getBalance(): Promise<ApiResponse<Balance>> {
  await simulateNetworkDelay(300, 600)
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to fetch balance')
  }
  
  return {
    data: mockBalance,
    success: true,
    message: 'Balance retrieved successfully'
  }
}

// Loan creation: POST initiate (returns terms for both 3 and 6 payments)
export async function initiateLoan(
  amount: number, 
  name: string
): Promise<ApiResponse<{ terms3: LoanTerms; terms6: LoanTerms }>> {
  await simulateNetworkDelay(800, 1500)
  
  // Validation
  if (amount < 100 || amount > 5000) {
    throw new Error('Loan amount must be between $100 and $5,000')
  }
  
  if (!name?.trim()) {
    throw new Error('Loan name is required')
  }
  
  if (amount > mockCreditInfo.available) {
    throw new Error('Insufficient credit limit available')
  }
  
  if (simulateRandomError(0.1)) {
    throw new Error('Unable to generate loan terms at this time')
  }
  
  // Generate both 3 and 6 payment options
  const terms3 = generateLoanTerms(amount, 3)
  const terms6 = generateLoanTerms(amount, 6)
  
  return {
    data: { terms3, terms6 },
    success: true,
    message: 'Loan terms generated successfully'
  }
}

// Loan creation: POST approve (takes out loan, updates balance and borrowed amount)
export async function approveLoan(
  termsId: string,
  amount: number,
  name: string
): Promise<ApiResponse<{ loanId: string; newBalance: number }>> {
  await simulateNetworkDelay(1000, 2000)
  
  if (simulateRandomError(0.08)) {
    throw new Error('Loan approval failed. Please try again.')
  }
  
  // Simulate updating balance and creating loan
  const newLoanId = `loan-${Date.now()}`
  const newBalance = mockBalance.amount + amount
  
  // Extract payment plan from termsId (format: "terms3-..." or "terms6-...")
  const paymentCount = termsId.startsWith('terms3-') ? 3 : 6
  const loanTerms = generateLoanTerms(amount, paymentCount)
  
  // Create the new loan object
  const newLoan: Loan = {
    id: newLoanId,
    name: name,
    amount: amount,
    terms: loanTerms,
    status: 'active',
    createdAt: new Date().toISOString(),
    progress: 0, // Just started, no payments made yet
    nextPaymentDue: loanTerms.paymentSchedule[0] // First payment due
  }
  
  // Add the new loan to the loans array
  mockLoans.push(newLoan)
  
  // Update balance and credit info
  mockBalance.amount = newBalance
  mockCreditInfo.used += amount
  mockCreditInfo.available -= amount
  
  // Add single transaction record for loan
  mockTransactions.push({
    id: `tx-${Date.now()}`,
    type: 'loan_disbursement',
    amount: amount,
    description: `${name} - Loan added to card`,
    date: new Date().toISOString(),
    status: 'completed',
    loanId: newLoanId
  })
  
  return {
    data: { 
      loanId: newLoanId, 
      newBalance 
    },
    success: true,
    message: `Loan approved! $${amount.toFixed(2)} has been added to your card balance.`
  }
}

// Loan info: GET payment schedule and terms
export async function getLoanInfo(loanId: string): Promise<ApiResponse<Loan>> {
  await simulateNetworkDelay(400, 700)
  
  const loan = mockLoans.find(l => l.id === loanId)
  
  if (!loan) {
    throw new Error('Loan not found')
  }
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to fetch loan information')
  }
  
  return {
    data: loan,
    success: true,
    message: 'Loan information retrieved successfully'
  }
}

// Get all loans
export async function getLoans(): Promise<ApiResponse<Loan[]>> {
  await simulateNetworkDelay(500, 900)
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to fetch loans')
  }
  
  return {
    data: mockLoans,
    success: true,
    message: 'Loans retrieved successfully'
  }
}

// Loan payment: GET deposit address
export async function getDepositAddress(
  loanId: string, 
  currency: 'BTC' | 'ETH' | 'USDC' = 'USDC'
): Promise<ApiResponse<DepositAddress>> {
  await simulateNetworkDelay(600, 1000)
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to generate deposit address')
  }
  
  const address = mockDepositAddresses.find(addr => 
    addr.currency === currency || 
    (currency === 'ETH' && addr.currency === 'USDC')
  )
  
  if (!address) {
    throw new Error('Unsupported currency')
  }
  
  return {
    data: address,
    success: true,
    message: 'Deposit address generated successfully'
  }
}

// Make loan payment
export async function makeLoanPayment(
  loanId: string,
  amount: number,
  paymentId: string
): Promise<ApiResponse<{ transactionId: string; remainingBalance: number }>> {
  await simulateNetworkDelay(1500, 3000) // Longer delay for payment processing
  
  if (simulateRandomError(0.1)) {
    throw new Error('Payment processing failed. Please try again.')
  }
  
  const transactionId = `tx-${Date.now()}`
  
  // In a real app, this would update loan payment status
  const loan = mockLoans.find(l => l.id === loanId)
  if (loan) {
    loan.progress += 100 / loan.terms.totalPayments // Update progress
  }
  
  return {
    data: {
      transactionId,
      remainingBalance: amount // Simplified - would calculate actual remaining balance
    },
    success: true,
    message: `Payment of $${amount.toFixed(2)} processed successfully`
  }
}

// Transactions: GET transaction history
export async function getTransactions(
  limit = 50,
  offset = 0
): Promise<ApiResponse<Transaction[]>> {
  await simulateNetworkDelay(400, 800)
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to fetch transactions')
  }
  
  // Simulate pagination
  const paginatedTransactions = mockTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(offset, offset + limit)
  
  return {
    data: paginatedTransactions,
    success: true,
    message: 'Transactions retrieved successfully'
  }
}

// Get transactions for a specific loan
export async function getLoanTransactions(loanId: string): Promise<ApiResponse<Transaction[]>> {
  await simulateNetworkDelay(400, 700)
  
  if (simulateRandomError(0.05)) {
    throw new Error('Failed to fetch loan transactions')
  }
  
  const loanTransactions = mockTransactions.filter(tx => tx.loanId === loanId)
  
  return {
    data: loanTransactions,
    success: true,
    message: 'Loan transactions retrieved successfully'
  }
}