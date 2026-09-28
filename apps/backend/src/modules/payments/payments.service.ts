import { UserModel } from '../users/user.model.js';
import { PaymentModel } from './payment.model.js';

export class PaymentsService {
  public static async createOrder(userId: string, plan: 'PRO' | 'ENTERPRISE') {
    const amountMap = {
      PRO: 999, // INR 999
      ENTERPRISE: 2999, // INR 2999
    };

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amount = amountMap[plan] || 999;

    await PaymentModel.create({
      userId,
      orderId,
      amount,
      currency: 'INR',
      plan,
      status: 'PENDING',
    });

    return {
      orderId,
      amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
    };
  }

  public static async verifyPayment(userId: string, orderId: string, paymentId: string, plan: 'PRO' | 'ENTERPRISE') {
    await PaymentModel.findOneAndUpdate(
      { orderId },
      { paymentId, status: 'SUCCESS' },
      { new: true }
    );
    await UserModel.findByIdAndUpdate(userId, { subscriptionPlan: plan });
    return { status: 'SUCCESS', message: `Subscription upgraded to ${plan}`, orderId, paymentId };
  }
}

