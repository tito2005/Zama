import { v4 as uuidv4 } from 'uuid';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'moncash' | 'paypal' | 'card' | 'coinbase' | 'binance';
  enabled: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  planType: 'pro' | 'enterprise';
  createdAt: string;
  completedAt?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}

// Mock payment storage
const transactions: Map<string, PaymentTransaction> = new Map();
const paymentMethods: PaymentMethod[] = [
  { id: 'moncash', name: 'MonCash', type: 'moncash', enabled: true },
  { id: 'paypal', name: 'PayPal', type: 'paypal', enabled: true },
  { id: 'card', name: 'Credit/Debit Card', type: 'card', enabled: true },
  { id: 'coinbase', name: 'Coinbase', type: 'coinbase', enabled: true },
  { id: 'binance', name: 'Binance Pay', type: 'binance', enabled: true },
];

export function getPaymentMethods(): PaymentMethod[] {
  return paymentMethods.filter(method => method.enabled);
}

export async function createPaymentTransaction(
  userId: string,
  planType: 'pro' | 'enterprise',
  method: string,
  amount: number,
  currency: string = 'USD'
): Promise<PaymentTransaction> {
  const transaction: PaymentTransaction = {
    id: uuidv4(),
    userId,
    amount,
    currency,
    method,
    status: 'pending',
    planType,
    createdAt: new Date().toISOString(),
  };

  transactions.set(transaction.id, transaction);
  return transaction;
}

export async function getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
  return transactions.get(transactionId) || null;
}

export async function updateTransactionStatus(
  transactionId: string,
  status: PaymentTransaction['status'],
  externalId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const transaction = transactions.get(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  transaction.status = status;
  if (externalId) transaction.externalId = externalId;
  if (metadata) transaction.metadata = { ...transaction.metadata, ...metadata };
  
  if (status === 'completed') {
    transaction.completedAt = new Date().toISOString();
  }

  transactions.set(transactionId, transaction);
}

export async function getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
  return Array.from(transactions.values()).filter(t => t.userId === userId);
}

// Payment method specific implementations

export async function processMonCashPayment(
  transaction: PaymentTransaction,
  phoneNumber: string
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    // Mock MonCash API integration
    // In production, integrate with actual MonCash API
    const externalId = `MC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success response (90% success rate for demo)
    const success = Math.random() > 0.1;
    
    if (success) {
      await updateTransactionStatus(transaction.id, 'completed', externalId);
      return { success: true, externalId };
    } else {
      await updateTransactionStatus(transaction.id, 'failed');
      return { success: false, error: 'MonCash payment failed' };
    }
  } catch (error) {
    await updateTransactionStatus(transaction.id, 'failed');
    return { success: false, error: 'MonCash service unavailable' };
  }
}

export async function processPayPalPayment(
  transaction: PaymentTransaction
): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    // Mock PayPal API integration
    const paymentUrl = `https://www.paypal.com/checkoutnow?token=EC-${Math.random().toString(36).substr(2, 17)}`;
    
    return { success: true, paymentUrl };
  } catch (error) {
    return { success: false, error: 'PayPal service unavailable' };
  }
}

export async function processCardPayment(
  transaction: PaymentTransaction,
  cardDetails: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  }
): Promise<{ success: boolean; externalId?: string; error?: string }> {
  try {
    // Mock Stripe/card processing
    const externalId = `CARD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock success response
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      await updateTransactionStatus(transaction.id, 'completed', externalId);
      return { success: true, externalId };
    } else {
      await updateTransactionStatus(transaction.id, 'failed');
      return { success: false, error: 'Card payment declined' };
    }
  } catch (error) {
    await updateTransactionStatus(transaction.id, 'failed');
    return { success: false, error: 'Card processing service unavailable' };
  }
}

export async function processCoinbasePayment(
  transaction: PaymentTransaction
): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    // Mock Coinbase Commerce API
    const paymentUrl = `https://commerce.coinbase.com/checkout/${Math.random().toString(36).substr(2, 17)}`;
    
    return { success: true, paymentUrl };
  } catch (error) {
    return { success: false, error: 'Coinbase service unavailable' };
  }
}

export async function processBinancePayment(
  transaction: PaymentTransaction
): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    // Mock Binance Pay API
    const paymentUrl = `https://pay.binance.com/checkout/${Math.random().toString(36).substr(2, 17)}`;
    
    return { success: true, paymentUrl };
  } catch (error) {
    return { success: false, error: 'Binance Pay service unavailable' };
  }
}

// Webhook handlers for payment verification

export async function handleMonCashCallback(
  transactionId: string,
  status: string,
  externalId: string
): Promise<void> {
  const transaction = await getTransaction(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const newStatus = status === 'success' ? 'completed' : 'failed';
  await updateTransactionStatus(transactionId, newStatus, externalId);
}

export async function handlePayPalCallback(
  transactionId: string,
  paypalTransactionId: string,
  status: string
): Promise<void> {
  const transaction = await getTransaction(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const newStatus = status === 'COMPLETED' ? 'completed' : 'failed';
  await updateTransactionStatus(transactionId, newStatus, paypalTransactionId);
}

export async function handleCoinbaseCallback(
  transactionId: string,
  coinbaseChargeId: string,
  status: string
): Promise<void> {
  const transaction = await getTransaction(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const newStatus = status === 'COMPLETED' ? 'completed' : 'failed';
  await updateTransactionStatus(transactionId, newStatus, coinbaseChargeId);
}

export async function handleBinanceCallback(
  transactionId: string,
  binanceOrderId: string,
  status: string
): Promise<void> {
  const transaction = await getTransaction(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const newStatus = status === 'SUCCESS' ? 'completed' : 'failed';
  await updateTransactionStatus(transactionId, newStatus, binanceOrderId);
}

// Plan pricing
export const PLAN_PRICING = {
  pro: {
    monthly: { amount: 29.99, currency: 'USD' },
    yearly: { amount: 299.99, currency: 'USD' },
  },
  enterprise: {
    monthly: { amount: 99.99, currency: 'USD' },
    yearly: { amount: 999.99, currency: 'USD' },
  },
};