import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { DashboardLayout } from '~/components/dashboard/DashboardLayout';
import { PlanSelector } from '~/components/billing/PlanSelector';
import { requireUserSession, getUserById, updateUserPlan } from '~/lib/.server/auth/auth.server';
import { 
  createPaymentTransaction, 
  processMonCashPayment, 
  processPayPalPayment, 
  processCardPayment, 
  processCoinbasePayment, 
  processBinancePayment,
  PLAN_PRICING 
} from '~/lib/.server/payments/payment.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const user = await getUserById(session.userId);
  
  if (!user) {
    throw new Response('User not found', { status: 404 });
  }

  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireUserSession(request);
  const formData = await request.formData();
  
  const planId = formData.get('planId') as string;
  const billing = formData.get('billing') as 'monthly' | 'yearly';
  const paymentMethod = formData.get('paymentMethod') as string;

  if (!planId || !billing || !paymentMethod) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (planId === 'free') {
    // Handle free plan selection
    await updateUserPlan(session.userId, 'free');
    return redirect('/dashboard');
  }

  if (!['pro', 'enterprise'].includes(planId)) {
    return json({ error: 'Invalid plan selected' }, { status: 400 });
  }

  try {
    const pricing = PLAN_PRICING[planId as 'pro' | 'enterprise'][billing];
    
    // Create payment transaction
    const transaction = await createPaymentTransaction(
      session.userId,
      planId as 'pro' | 'enterprise',
      paymentMethod,
      pricing.amount,
      pricing.currency
    );

    // Process payment based on method
    let result;
    switch (paymentMethod) {
      case 'moncash':
        const phoneNumber = formData.get('phoneNumber') as string;
        if (!phoneNumber) {
          return json({ error: 'Phone number is required for MonCash' }, { status: 400 });
        }
        result = await processMonCashPayment(transaction, phoneNumber);
        break;
        
      case 'paypal':
        result = await processPayPalPayment(transaction);
        if (result.success && result.paymentUrl) {
          return redirect(result.paymentUrl);
        }
        break;
        
      case 'card':
        // In a real implementation, this would handle card details securely
        result = await processCardPayment(transaction, {
          number: '4111111111111111',
          expiry: '12/25',
          cvv: '123',
          name: 'Test User'
        });
        break;
        
      case 'coinbase':
        result = await processCoinbasePayment(transaction);
        if (result.success && result.paymentUrl) {
          return redirect(result.paymentUrl);
        }
        break;
        
      case 'binance':
        result = await processBinancePayment(transaction);
        if (result.success && result.paymentUrl) {
          return redirect(result.paymentUrl);
        }
        break;
        
      default:
        return json({ error: 'Unsupported payment method' }, { status: 400 });
    }

    if (result.success) {
      // Update user plan
      await updateUserPlan(session.userId, planId as 'pro' | 'enterprise');
      return redirect('/dashboard?payment=success');
    } else {
      return json({ error: result.error || 'Payment failed' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    return json({ error: 'Payment processing failed' }, { status: 500 });
  }
}

export default function Billing() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zama-text-primary">Billing & Plans</h1>
          <p className="text-zama-text-secondary mt-2">
            Manage your subscription and billing information
          </p>
        </div>

        <PlanSelector currentPlan={user.plan} />
      </div>
    </DashboardLayout>
  );
}