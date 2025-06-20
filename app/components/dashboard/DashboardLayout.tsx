import { Link, useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { User } from '~/lib/.server/auth/auth.server';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useLoaderData<{ user: User }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'i-ph:house' },
    { name: 'Projects', href: '/dashboard/projects', icon: 'i-ph:folder' },
    { name: 'Import Project', href: '/dashboard/import', icon: 'i-ph:upload' },
    { name: 'Usage', href: '/dashboard/usage', icon: 'i-ph:chart-bar' },
    { name: 'Billing', href: '/dashboard/billing', icon: 'i-ph:credit-card' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'i-ph:gear' },
  ];

  const tokenUsagePercentage = (user.tokensUsed / user.tokensLimit) * 100;

  return (
    <div className="min-h-screen bg-zama-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          className="fixed inset-y-0 left-0 w-64 bg-zama-surface border-r border-zama-border"
        >
          <SidebarContent navigation={navigation} user={user} tokenUsagePercentage={tokenUsagePercentage} />
        </motion.div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-zama-surface border-r border-zama-border">
          <SidebarContent navigation={navigation} user={user} tokenUsagePercentage={tokenUsagePercentage} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-zama-border bg-zama-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-zama-text-secondary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <div className="i-ph:list w-6 h-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <button className="p-2.5 text-zama-text-secondary hover:text-zama-text-primary">
                <div className="i-ph:bell w-6 h-6" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button className="flex items-center gap-x-2 text-sm font-semibold text-zama-text-primary">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-zama-primary to-zama-accent flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block">{user.name}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ 
  navigation, 
  user, 
  tokenUsagePercentage 
}: { 
  navigation: any[]; 
  user: User; 
  tokenUsagePercentage: number;
}) {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-zama-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-r from-zama-primary to-zama-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">Z</span>
          </div>
          <span className="text-xl font-bold text-zama-text-primary">ZAMA</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col px-6 py-6">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-zama-text-secondary hover:text-zama-text-primary hover:bg-zama-surface-secondary transition-all duration-200"
                  >
                    <div className={`${item.icon} w-6 h-6`} />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          {/* Token usage */}
          <li className="mt-auto">
            <div className="bg-zama-surface-secondary rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zama-text-primary">Token Usage</span>
                <span className="text-xs text-zama-text-secondary">
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </span>
              </div>
              <div className="w-full bg-zama-border rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tokenUsagePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    tokenUsagePercentage > 80 
                      ? 'bg-zama-error' 
                      : tokenUsagePercentage > 60 
                        ? 'bg-zama-warning' 
                        : 'bg-gradient-to-r from-zama-primary to-zama-accent'
                  }`}
                />
              </div>
              <div className="flex justify-between text-xs text-zama-text-secondary">
                <span>{user.tokensUsed.toLocaleString()}</span>
                <span>{user.tokensLimit.toLocaleString()}</span>
              </div>
              {user.plan === 'free' && (
                <Link
                  to="/dashboard/billing"
                  className="mt-3 w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-zama-primary to-zama-accent hover:from-zama-primary-dark hover:to-zama-accent transition-all duration-200"
                >
                  Upgrade Plan
                </Link>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
}