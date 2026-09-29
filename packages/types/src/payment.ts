export interface CreatePayment {
  transactionId: string
  userId: string
  subscriptionId: string
  couponId: string
  gatewayName: string
  paymentMethodId: string
  statusId: string
  paidAt: Date
}

export interface CreateTransaction {
  paymentId: string
  gatewayTransactionId: string
  statusId: string
  refundId: string
  amount: number
  reason: string
  attemptNumber: number
  failureReason: string
  completedAt: Date
}

export interface CreateRefund {
  paymentId: string
  userId: string
  statusId: string
  refundAmount: number
  reason: string
  refundTransactionId: string
}

export interface CreatePaymentMethod {
  methodName: "Credit Card" | "UPI" | "NetBanking"
}

export interface CreatePaymentStatus {
  status: "Pending" | "Success" | "Failed" | "Refunded"
}
