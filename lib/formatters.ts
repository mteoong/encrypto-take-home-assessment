/**
 * Utility functions for formatting currency, dates, and other display values
 * These functions will be unit tested to meet the assessment requirements
 */

// Currency formatter
export function formatCurrency(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Compact currency formatter (e.g., $1.2K, $1.5M)
export function formatCurrencyCompact(
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

// Date formatter
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  locale: string = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, options).format(dateObj)
}

// Relative time formatter (e.g., "in 5 days", "2 months ago")
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = dateObj.getTime() - now.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (Math.abs(diffInDays) < 1) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Tomorrow'
  } else if (diffInDays === -1) {
    return 'Yesterday'
  } else if (diffInDays > 0 && diffInDays <= 30) {
    return `In ${diffInDays} day${diffInDays > 1 ? 's' : ''}`
  } else if (diffInDays < 0 && diffInDays >= -30) {
    return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} ago`
  } else {
    // For dates further out, use months
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths > 0) {
      return `In ${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`
    } else {
      return `${Math.abs(diffInMonths)} month${Math.abs(diffInMonths) > 1 ? 's' : ''} ago`
    }
  }
}

// Percentage formatter
export function formatPercentage(
  value: number,
  minimumFractionDigits: number = 1,
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100)
}

// Payment status formatter
export function formatPaymentStatus(status: 'pending' | 'paid' | 'overdue'): {
  label: string
  className: string
  variant: 'default' | 'success' | 'destructive'
} {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
        variant: 'success'
      }
    case 'overdue':
      return {
        label: 'Overdue',
        className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
        variant: 'destructive'
      }
    case 'pending':
    default:
      return {
        label: 'Pending',
        className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
        variant: 'default'
      }
  }
}

// Loan status formatter
export function formatLoanStatus(status: 'pending' | 'active' | 'completed' | 'defaulted'): {
  label: string
  className: string
  variant: 'default' | 'success' | 'destructive'
} {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        className: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/30',
        variant: 'success'
      }
    case 'defaulted':
      return {
        label: 'Defaulted',
        className: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30',
        variant: 'destructive'
      }
    case 'active':
      return {
        label: 'Active',
        className: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/30',
        variant: 'default'
      }
    case 'pending':
    default:
      return {
        label: 'Pending',
        className: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/30',
        variant: 'default'
      }
  }
}

// Transaction type formatter
export function formatTransactionType(type: 'loan_disbursement' | 'loan_payment' | 'card_load' | 'purchase'): {
  label: string
  icon: string
  className: string
} {
  switch (type) {
    case 'loan_disbursement':
      return {
        label: 'Loan Disbursement',
        icon: '💰',
        className: 'text-green-600'
      }
    case 'loan_payment':
      return {
        label: 'Loan Payment',
        icon: '💳',
        className: 'text-blue-600'
      }
    case 'card_load':
      return {
        label: 'Card Load',
        icon: '⬆️',
        className: 'text-purple-600'
      }
    case 'purchase':
      return {
        label: 'Purchase',
        icon: '🛒',
        className: 'text-orange-600'
      }
    default:
      return {
        label: 'Transaction',
        icon: '💱',
        className: 'text-gray-600'
      }
  }
}

// Format loan progress as a readable string
export function formatLoanProgress(progress: number): string {
  if (progress >= 100) {
    return 'Completed'
  } else if (progress <= 0) {
    return 'Not started'
  } else {
    return `${Math.round(progress)}% complete`
  }
}

// Format payment frequency
export function formatPaymentFrequency(totalPayments: number): string {
  if (totalPayments <= 3) {
    return 'Monthly'
  } else if (totalPayments <= 12) {
    return 'Monthly'
  } else if (totalPayments <= 26) {
    return 'Bi-weekly'
  } else {
    return 'Weekly'
  }
}

// Truncate crypto addresses for display
export function formatCryptoAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`
}