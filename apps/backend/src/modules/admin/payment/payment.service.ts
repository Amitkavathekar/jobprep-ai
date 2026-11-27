import { TransactionModel } from "./payment.model";
import { logAdminActivity } from "../activity-log/activity-log.service";

export const DEFAULT_TRANSACTIONS = [
  {
    transactionId: "TXN-809214",
    gatewayTransactionId: "razorpay_pay_P102941",
    amount: 2299,
    planName: "Pro (6 Months)",
    userName: "Aditya Nair",
    userEmail: "aditya.n@example.com",
    gatewayName: "Razorpay UPI",
    status: "Success",
    attemptNumber: 1,
    completedAt: new Date(Date.now() - 2 * 3600000),
  },
  {
    transactionId: "TXN-809188",
    gatewayTransactionId: "razorpay_pay_P102877",
    amount: 1299,
    planName: "Plus (3 Months)",
    userName: "Pooja Hegde",
    userEmail: "pooja.h@example.com",
    gatewayName: "Credit Card (Visa)",
    status: "Success",
    attemptNumber: 1,
    completedAt: new Date(Date.now() - 5 * 3600000),
  },
  {
    transactionId: "TXN-809120",
    gatewayTransactionId: "razorpay_pay_P102711",
    amount: 3999,
    planName: "Elite (1 Year)",
    userName: "Karan Mehta",
    userEmail: "karan.m@example.com",
    gatewayName: "Net Banking (HDFC)",
    status: "Success",
    attemptNumber: 1,
    completedAt: new Date(Date.now() - 14 * 3600000),
  },
  {
    transactionId: "TXN-808940",
    gatewayTransactionId: "razorpay_pay_P102430",
    amount: 499,
    planName: "Basic (1 Month)",
    userName: "Suresh Iyer",
    userEmail: "suresh.i@example.com",
    gatewayName: "UPI (Google Pay)",
    status: "Failed",
    failureReason: "Payment timed out by customer bank",
    attemptNumber: 2,
    completedAt: new Date(Date.now() - 26 * 3600000),
  },
  {
    transactionId: "TXN-808810",
    gatewayTransactionId: "razorpay_pay_P102201",
    amount: 2299,
    planName: "Pro (6 Months)",
    userName: "Divya Rao",
    userEmail: "divya.r@example.com",
    gatewayName: "Razorpay UPI",
    status: "Refunded",
    reason: "Requested accidental double charge refund",
    attemptNumber: 1,
    completedAt: new Date(Date.now() - 48 * 3600000),
  },
];

export async function getAdminPaymentsService() {
  let txns = await TransactionModel.find().sort({ createdAt: -1 });

  if (txns.length === 0) {
    // Seed default transactions into MongoDB
    txns = (await TransactionModel.insertMany(DEFAULT_TRANSACTIONS as any)) as any;
  }

  const totalRevenue = txns
    .filter((t: any) => t.status === "Success")
    .reduce((acc, t: any) => acc + (t.amount || 0), 0);

  const successfulCount = txns.filter((t: any) => t.status === "Success").length;
  const refundedCount = txns.filter((t: any) => t.status === "Refunded").length;
  const failedCount = txns.filter((t: any) => t.status === "Failed").length;

  const formatted = txns.map((t: any) => ({
    id: t.transactionId || (t._id ? t._id.toString() : ""),
    _id: t._id,
    transactionId: t.transactionId,
    gatewayTransactionId: t.gatewayTransactionId || "N/A",
    amount: t.amount,
    planName: t.planName || "Membership Plan",
    userName: t.userName || "Candidate",
    userEmail: t.userEmail || "user@example.com",
    gatewayName: t.gatewayName || "UPI / Card",
    status: t.status || "Success",
    reason: t.reason || "",
    failureReason: t.failureReason || "",
    date: t.completedAt ? new Date(t.completedAt).toLocaleString() : new Date().toLocaleString(),
  }));

  return {
    summary: {
      totalRevenue,
      totalTransactions: txns.length,
      successfulCount,
      refundedCount,
      failedCount,
    },
    transactions: formatted,
  };
}

export async function refundPaymentService(id: string, reason: string = "Admin processed refund") {
  const txn = await TransactionModel.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { transactionId: id }],
  });

  if (!txn) {
    return null;
  }

  (txn as any).status = "Refunded";
  (txn as any).reason = reason;
  await txn.save();

  await logAdminActivity(
    `Processed refund of ₹${txn.amount} for transaction ${(txn as any).transactionId}`,
    `Payment: ${(txn as any).transactionId}`,
    "Pricing"
  );

  return txn;
}
