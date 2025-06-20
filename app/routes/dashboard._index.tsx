import { type LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '~/components/dashboard/DashboardLayout';
import { requireUserSession, getUserById } from '~/lib/.server/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const user = await getUserById(session.userId);
  
  if (!user) {
    throw new Response('User not found', { status: 404 });
  }

  // Calculate token usage stats
  const tokenUsagePercentage = (user.tokensUsed / user.tokensLimit) * 100;
  const remainingTokens = user.tokensLimit - user.tokensUsed;
  
  // Mock recent projects data
  const recentProjects = [
    { id: '1', name: 'E-commerce Website', lastModified: '2 hours ago', status: 'active' },
    { id: '2', name: 'Portfolio Site', lastModified: '1 day ago', status: 'completed' },
    { id: '3', name: 'Blog Platform', lastModified: '3 days ago', status: 'active' },
  ];

  return json({ 
    user, 
    tokenUsagePercentage, 
    remainingTokens,
    recentProjects 
  });
}

export default function Dashboard() {
  const { user, tokenUsagePercentage, remainingTokens, recentProjects } = useLoaderData<typeof loader>();

  const stats = [
    {
      name: 'Tokens Used Today',
      value: user.tokensUsed.toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: 'i-ph:lightning',
    },
    {
      name: 'Remaining Tokens',
      value: remainingTokens.toLocaleString(),
      change: `${(100 - tokenUsagePercentage).toFixed(1)}%`,
      changeType: 'neutral' as const,
      icon: 'i-ph:battery-charging',
    },
    {
      name: 'Active Projects',
      value: '3',
      change: '+1',
      changeType: 'increase' as const,
      icon: 'i-ph:folder',
    },
    {
      name: 'Plan',
      value: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
      change: user.plan === 'free' ? 'Upgrade' : 'Active',
      changeType: user.plan === 'free' ? 'neutral' : 'increase' as const,
      icon: 'i-ph:crown',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-zama-text-primary">
            Welcome back, {user.name}!
          </h1>
          <p className="text-zama-text-secondary mt-2">
            Here's what's happening with your ZAMA projects today.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zama-surface rounded-xl border border-zama-border p-6 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zama-text-secondary">{stat.name}</p>
                  <p className="text-2xl font-bold text-zama-text-primary mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.icon} w-8 h-8 text-zama-primary`} />
              </div>
              <div className="mt-4 flex items-center">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase'
                      ? 'text-zama-success'
                      : stat.changeType === 'decrease'
                      ? 'text-zama-error'
                      : 'text-zama-text-secondary'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-zama-text-secondary ml-1">from yesterday</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Token usage chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zama-surface rounded-xl border border-zama-border p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zama-text-primary">Token Usage</h2>
            <span className="text-sm text-zama-text-secondary">
              Resets in {24 - new Date().getHours()} hours
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zama-text-secondary">Daily Usage</span>
              <span className="text-zama-text-primary font-medium">
                {user.tokensUsed.toLocaleString()} / {user.tokensLimit.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-zama-border rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tokenUsagePercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-3 rounded-full ${
                  tokenUsagePercentage > 80 
                    ? 'bg-zama-error' 
                    : tokenUsagePercentage > 60 
                      ? 'bg-zama-warning' 
                      : 'bg-gradient-to-r from-zama-primary to-zama-accent'
                }`}
              />
            </div>
            
            <div className="flex justify-between text-xs text-zama-text-secondary">
              <span>0</span>
              <span>{(user.tokensLimit / 2).toLocaleString()}</span>
              <span>{user.tokensLimit.toLocaleString()}</span>
            </div>
          </div>

          {tokenUsagePercentage > 80 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg"
            >
              <div className="flex items-center">
                <div className="i-ph:warning w-5 h-5 text-orange-500 mr-2" />
                <span className="text-sm text-orange-700">
                  You're running low on tokens. Consider upgrading your plan.
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Recent projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zama-surface rounded-xl border border-zama-border p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-zama-text-primary">Recent Projects</h2>
            <a
              href="/dashboard/projects"
              className="text-sm text-zama-primary hover:text-zama-primary-dark font-medium"
            >
              View all →
            </a>
          </div>

          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-zama-surface-secondary rounded-lg hover:bg-zama-border transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="i-ph:folder w-8 h-8 text-zama-primary" />
                  <div>
                    <h3 className="font-medium text-zama-text-primary">{project.name}</h3>
                    <p className="text-sm text-zama-text-secondary">Modified {project.lastModified}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {project.status}
                  </span>
                  <button className="text-zama-text-secondary hover:text-zama-text-primary">
                    <div className="i-ph:arrow-right w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {recentProjects.length === 0 && (
            <div className="text-center py-8">
              <div className="i-ph:folder-plus w-12 h-12 text-zama-text-tertiary mx-auto mb-4" />
              <p className="text-zama-text-secondary">No projects yet. Start building something amazing!</p>
              <button className="mt-4 bg-gradient-to-r from-zama-primary to-zama-accent text-white px-6 py-2 rounded-lg font-medium hover:from-zama-primary-dark hover:to-zama-accent transition-all duration-200">
                Create Project
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}