import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface LoginFormProps {
  error?: string;
}

export function LoginForm({ error }: LoginFormProps) {
  const navigation = useNavigation();
  const actionData = useActionData<{ error?: string }>();
  const [showPassword, setShowPassword] = useState(false);
  
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zama-background to-zama-surface-secondary px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mx-auto h-16 w-16 bg-gradient-to-r from-zama-primary to-zama-accent rounded-xl flex items-center justify-center mb-6"
          >
            <span className="text-2xl font-bold text-white">Z</span>
          </motion.div>
          <h2 className="text-3xl font-bold text-zama-text-primary">Welcome back to ZAMA</h2>
          <p className="mt-2 text-zama-text-secondary">Sign in to your account to continue</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-zama-surface rounded-2xl shadow-xl p-8 border border-zama-border"
        >
          <Form method="post" className="space-y-6">
            {(error || actionData?.error) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              >
                {error || actionData?.error}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zama-text-primary mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-zama-border rounded-lg focus:ring-2 focus:ring-zama-primary focus:border-transparent transition-all duration-200 bg-zama-surface text-zama-text-primary"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zama-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 border border-zama-border rounded-lg focus:ring-2 focus:ring-zama-primary focus:border-transparent transition-all duration-200 bg-zama-surface text-zama-text-primary pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zama-text-secondary hover:text-zama-text-primary"
                >
                  {showPassword ? (
                    <div className="i-ph:eye-slash w-5 h-5" />
                  ) : (
                    <div className="i-ph:eye w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-zama-primary focus:ring-zama-primary border-zama-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zama-text-secondary">
                  Remember me
                </label>
              </div>

              <Link
                to="/auth/forgot-password"
                className="text-sm text-zama-primary hover:text-zama-primary-dark transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-zama-primary to-zama-accent hover:from-zama-primary-dark hover:to-zama-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zama-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="i-svg-spinners:90-ring-with-bg w-5 h-5 mr-2" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zama-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-zama-surface text-zama-text-secondary">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-zama-border rounded-lg shadow-sm bg-zama-surface text-sm font-medium text-zama-text-primary hover:bg-zama-surface-secondary transition-all duration-200"
              >
                <div className="i-ph:google-logo w-5 h-5 mr-2" />
                Google
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-zama-border rounded-lg shadow-sm bg-zama-surface text-sm font-medium text-zama-text-primary hover:bg-zama-surface-secondary transition-all duration-200"
              >
                <div className="i-ph:facebook-logo w-5 h-5 mr-2" />
                Facebook
              </motion.button>
            </div>
          </Form>

          <div className="mt-6 text-center">
            <span className="text-zama-text-secondary">Don't have an account? </span>
            <Link
              to="/auth/register"
              className="text-zama-primary hover:text-zama-primary-dark font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}