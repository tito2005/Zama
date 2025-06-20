import { Form, useActionData, useNavigation } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Plan {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  tokens: number;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    tokens: 500000,
    features: [
      '500K tokens per day',
      'Basic project templates',
      'Community support',
      'Public projects only'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 29.99, yearly: 299.99 },
    tokens: 1500000,
    features: [
      '1.5M tokens per day',
      'All project templates',
      'Priority support',
      'Private projects',
      'Advanced AI models',
      'Export capabilities'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 99.99, yearly: 999.99 },
    tokens: 5000000,
    features: [
      '5M tokens per day',
      'Custom templates',
      'Dedicated support',
      'Team collaboration',
      'API access',
      'Custom integrations',
      'SLA guarantee'
    ]
  }
];

interface PlanSelectorProps {
  currentPlan: string;
  onPlanSelect?: (planId: string, billing: 'monthly' | 'yearly') => void;
}

export function PlanSelector({ currentPlan, onPlanSelect }: PlanSelectorProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const isProcessing = navigation.state === 'submitting';

  const handlePlanSelect = (planId: string) => {
    if (planId === 'free') {
      // Handle free plan selection directly
      onPlanSelect?.(planId, billingCycle);
    } else {
      setSelectedPlan(planId);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getYearlySavings = (plan: Plan) => {
    const monthlyTotal = plan.price.monthly * 12;
    const savings = monthlyTotal - plan.price.yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-zama-text-primary mb-4">Choose Your Plan</h2>
        <p className="text-zama-text-secondary text-lg">
          Unlock the full potential of ZAMA with our flexible pricing plans
        </p>
      </div>

      {actionData?.error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center"
        >
          {actionData.error}
        </motion.div>
      )}

      {/* Billing cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-zama-surface-secondary rounded-lg p-1 flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              billingCycle === 'monthly'
                ? 'bg-zama-surface text-zama-text-primary shadow-sm'
                : 'text-zama-text-secondary hover:text-zama-text-primary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
              billingCycle === 'yearly'
                ? 'bg-zama-surface text-zama-text-primary shadow-sm'
                : 'text-zama-text-secondary hover:text-zama-text-primary'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-zama-success text-white text-xs px-2 py-1 rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-zama-surface rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
              plan.popular
                ? 'border-zama-primary scale-105'
                : currentPlan === plan.id
                ? 'border-zama-success'
                : 'border-zama-border hover:border-zama-primary'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-zama-primary to-zama-accent text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            {currentPlan === plan.id && (
              <div className="absolute -top-4 right-4">
                <span className="bg-zama-success text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Current Plan
                </span>
              </div>
            )}

            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-zama-text-primary mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-zama-text-primary">
                    {formatPrice(plan.price[billingCycle])}
                  </span>
                  {plan.price[billingCycle] > 0 && (
                    <span className="text-zama-text-secondary">
                      /{billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                  <div className="text-sm text-zama-success font-semibold">
                    Save {getYearlySavings(plan)}% annually
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="text-center mb-4">
                  <span className="text-2xl font-bold text-zama-primary">
                    {(plan.tokens / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-zama-text-secondary"> tokens/day</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <div className="i-ph:check w-5 h-5 text-zama-success mr-3 flex-shrink-0" />
                    <span className="text-zama-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePlanSelect(plan.id)}
                disabled={currentPlan === plan.id || isProcessing}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                  currentPlan === plan.id
                    ? 'bg-zama-surface-secondary text-zama-text-secondary cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-zama-primary to-zama-accent text-white hover:from-zama-primary-dark hover:to-zama-accent'
                    : 'border-2 border-zama-primary text-zama-primary hover:bg-zama-primary hover:text-white'
                }`}
              >
                {currentPlan === plan.id
                  ? 'Current Plan'
                  : plan.id === 'free'
                  ? 'Get Started'
                  : `Upgrade to ${plan.name}`}
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Payment methods */}
      {selectedPlan && selectedPlan !== 'free' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zama-surface rounded-2xl shadow-xl border border-zama-border p-8"
        >
          <h3 className="text-xl font-bold text-zama-text-primary mb-6 text-center">
            Choose Payment Method
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { id: 'moncash', name: 'MonCash', icon: 'i-ph:device-mobile' },
              { id: 'paypal', name: 'PayPal', icon: 'i-ph:paypal-logo' },
              { id: 'card', name: 'Card', icon: 'i-ph:credit-card' },
              { id: 'coinbase', name: 'Coinbase', icon: 'i-ph:currency-btc' },
              { id: 'binance', name: 'Binance', icon: 'i-ph:currency-eth' },
            ].map((method) => (
              <Form key={method.id} method="post">
                <input type="hidden" name="planId" value={selectedPlan} />
                <input type="hidden" name="billing" value={billingCycle} />
                <input type="hidden" name="paymentMethod" value={method.id} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isProcessing}
                  className="w-full p-4 border-2 border-zama-border rounded-lg hover:border-zama-primary hover:bg-zama-surface-secondary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`${method.icon} w-8 h-8 mx-auto mb-2 text-zama-text-primary`} />
                  <div className="text-sm font-medium text-zama-text-primary">{method.name}</div>
                </motion.button>
              </Form>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setSelectedPlan(null)}
              className="text-zama-text-secondary hover:text-zama-text-primary transition-colors"
            >
              ← Back to plans
            </button>
          </div>
        </motion.div>
      )}

      {/* FAQ */}
      <div className="mt-12 bg-zama-surface-secondary rounded-2xl p-8">
        <h3 className="text-xl font-bold text-zama-text-primary mb-6 text-center">
          Frequently Asked Questions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-zama-text-primary mb-2">What are tokens?</h4>
            <p className="text-zama-text-secondary text-sm">
              Tokens are units of AI computation. Each request to our AI models consumes tokens based on the complexity and length of the response.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zama-text-primary mb-2">Can I change plans anytime?</h4>
            <p className="text-zama-text-secondary text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zama-text-primary mb-2">Do tokens roll over?</h4>
            <p className="text-zama-text-secondary text-sm">
              No, tokens reset daily. Unused tokens don't carry over to the next day.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-zama-text-primary mb-2">What payment methods do you accept?</h4>
            <p className="text-zama-text-secondary text-sm">
              We accept MonCash, PayPal, credit/debit cards, Coinbase, and Binance Pay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}