import { json, type MetaFunction, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Link, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { getUserSession } from '~/lib/.server/auth/auth.server';

export const meta: MetaFunction = () => {
  return [
    { title: 'ZAMA - AI-Powered Development Platform' }, 
    { name: 'description', content: 'Build amazing applications with ZAMA, the AI-powered development platform that brings your ideas to life.' }
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  return json({ isAuthenticated: !!session });
}

export default function Index() {
  const { isAuthenticated } = useLoaderData<typeof loader>();

  if (isAuthenticated) {
    return (
      <div className="flex flex-col h-full w-full bg-zama-background">
        <Header />
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zama-background via-zama-surface to-zama-surface-secondary">
      {/* Navigation */}
      <nav className="relative z-10 bg-zama-surface/80 backdrop-blur-sm border-b border-zama-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-r from-zama-primary to-zama-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">Z</span>
              </div>
              <span className="text-2xl font-bold text-zama-text-primary">ZAMA</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="text-zama-text-secondary hover:text-zama-text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="bg-gradient-to-r from-zama-primary to-zama-accent text-white px-6 py-2 rounded-lg font-semibold hover:from-zama-primary-dark hover:to-zama-accent transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-zama-text-primary mb-6">
              Build with{' '}
              <span className="bg-gradient-to-r from-zama-primary to-zama-accent bg-clip-text text-transparent">
                AI Power
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-zama-text-secondary mb-8 max-w-3xl mx-auto">
              Transform your ideas into reality with ZAMA's AI-powered development platform. 
              Create, deploy, and scale applications faster than ever before.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/auth/register"
                className="bg-gradient-to-r from-zama-primary to-zama-accent text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-zama-primary-dark hover:to-zama-accent transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Building Free
              </Link>
              <Link
                to="/auth/login"
                className="border-2 border-zama-primary text-zama-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-zama-primary hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            {[
              {
                icon: 'i-ph:lightning',
                title: 'Lightning Fast',
                description: 'Build applications in minutes, not hours. Our AI understands your requirements and generates production-ready code.'
              },
              {
                icon: 'i-ph:brain',
                title: 'AI-Powered',
                description: 'Leverage advanced AI models to write, debug, and optimize your code automatically.'
              },
              {
                icon: 'i-ph:rocket',
                title: 'Deploy Instantly',
                description: 'Deploy your applications with one click to our global infrastructure.'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
                className="bg-zama-surface rounded-2xl p-8 border border-zama-border hover:border-zama-primary transition-all duration-300 hover:shadow-xl"
              >
                <div className={`${feature.icon} w-12 h-12 text-zama-primary mb-4`} />
                <h3 className="text-xl font-bold text-zama-text-primary mb-3">{feature.title}</h3>
                <p className="text-zama-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-zama-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-zama-accent/10 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-zama-surface border-t border-zama-border py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: '10K+', label: 'Projects Created' },
              { number: '50M+', label: 'Lines of Code' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-zama-primary mb-2">{stat.number}</div>
                <div className="text-zama-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="py-20"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-zama-text-primary mb-6">
            Ready to build the future?
          </h2>
          <p className="text-xl text-zama-text-secondary mb-8">
            Join thousands of developers who are already building amazing applications with ZAMA.
          </p>
          <Link
            to="/auth/register"
            className="inline-block bg-gradient-to-r from-zama-primary to-zama-accent text-white px-10 py-4 rounded-xl font-semibold text-lg hover:from-zama-primary-dark hover:to-zama-accent transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Your Free Trial
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-zama-surface border-t border-zama-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-to-r from-zama-primary to-zama-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">Z</span>
              </div>
              <span className="text-xl font-bold text-zama-text-primary">ZAMA</span>
            </div>
            <div className="flex gap-6 text-zama-text-secondary">
              <Link to="/privacy" className="hover:text-zama-text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-zama-text-primary transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-zama-text-primary transition-colors">Support</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-zama-border text-center text-zama-text-secondary">
            <p>&copy; 2024 ZAMA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}