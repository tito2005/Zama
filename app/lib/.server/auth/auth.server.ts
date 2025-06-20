import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  tokensUsed: number;
  tokensLimit: number;
  resetDate: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  email: string;
  plan: string;
}

// Session storage configuration
const sessionSecret = process.env.SESSION_SECRET || 'default-secret-change-in-production';

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__zama_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

// Mock database - In production, replace with actual database
const users: Map<string, User> = new Map();
const usersByEmail: Map<string, User> = new Map();
const verificationTokens: Map<string, { email: string; expires: Date }> = new Map();
const resetTokens: Map<string, { email: string; expires: Date }> = new Map();

export async function createUser(email: string, password: string, name: string): Promise<User> {
  if (usersByEmail.has(email)) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user: User = {
    id: uuidv4(),
    email,
    name,
    plan: 'free',
    tokensUsed: 0,
    tokensLimit: 500000, // 500k tokens for free plan
    resetDate: new Date().toISOString(),
    emailVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  usersByEmail.set(email, user);

  // Store password separately (in production, use proper database)
  const passwords: Map<string, string> = new Map();
  passwords.set(user.id, hashedPassword);

  return user;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const user = usersByEmail.get(email);
  if (!user) return null;

  // In production, retrieve password from database
  const passwords: Map<string, string> = new Map();
  const hashedPassword = passwords.get(user.id);
  if (!hashedPassword) return null;

  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid ? user : null;
}

export async function getUserById(id: string): Promise<User | null> {
  return users.get(id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return usersByEmail.get(email) || null;
}

export async function updateUserPlan(userId: string, plan: 'free' | 'pro' | 'enterprise'): Promise<void> {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const tokenLimits = {
    free: 500000,
    pro: 1500000,
    enterprise: 5000000,
  };

  user.plan = plan;
  user.tokensLimit = tokenLimits[plan];
  user.updatedAt = new Date().toISOString();
  
  users.set(userId, user);
  usersByEmail.set(user.email, user);
}

export async function updateTokenUsage(userId: string, tokensUsed: number): Promise<void> {
  const user = users.get(userId);
  if (!user) throw new Error('User not found');

  const today = new Date().toDateString();
  const resetDate = new Date(user.resetDate).toDateString();

  // Reset daily usage if it's a new day
  if (today !== resetDate) {
    user.tokensUsed = 0;
    user.resetDate = new Date().toISOString();
  }

  user.tokensUsed += tokensUsed;
  user.updatedAt = new Date().toISOString();
  
  users.set(userId, user);
  usersByEmail.set(user.email, user);
}

export async function canUseTokens(userId: string, requestedTokens: number): Promise<boolean> {
  const user = users.get(userId);
  if (!user) return false;

  const today = new Date().toDateString();
  const resetDate = new Date(user.resetDate).toDateString();

  // Reset daily usage if it's a new day
  if (today !== resetDate) {
    user.tokensUsed = 0;
    user.resetDate = new Date().toISOString();
    users.set(userId, user);
    usersByEmail.set(user.email, user);
  }

  return (user.tokensUsed + requestedTokens) <= user.tokensLimit;
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = uuidv4();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  verificationTokens.set(token, { email, expires });
  return token;
}

export async function verifyEmailToken(token: string): Promise<string | null> {
  const tokenData = verificationTokens.get(token);
  if (!tokenData || tokenData.expires < new Date()) {
    verificationTokens.delete(token);
    return null;
  }

  const user = usersByEmail.get(tokenData.email);
  if (user) {
    user.emailVerified = true;
    user.updatedAt = new Date().toISOString();
    users.set(user.id, user);
    usersByEmail.set(user.email, user);
  }

  verificationTokens.delete(token);
  return tokenData.email;
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  resetTokens.set(token, { email, expires });
  return token;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const tokenData = resetTokens.get(token);
  if (!tokenData || tokenData.expires < new Date()) {
    resetTokens.delete(token);
    return null;
  }

  return tokenData.email;
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const email = await verifyResetToken(token);
  if (!email) return false;

  const user = usersByEmail.get(email);
  if (!user) return false;

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // In production, update password in database
  const passwords: Map<string, string> = new Map();
  passwords.set(user.id, hashedPassword);

  resetTokens.delete(token);
  return true;
}

export async function createUserSession(user: User, redirectTo: string = '/dashboard') {
  const session = await getSession();
  session.set('userId', user.id);
  session.set('email', user.email);
  session.set('plan', user.plan);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function getUserSession(request: Request): Promise<Session | null> {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  
  if (!userId) return null;

  return {
    userId,
    email: session.get('email'),
    plan: session.get('plan'),
  };
}

export async function requireUserSession(request: Request): Promise<Session> {
  const session = await getUserSession(request);
  if (!session) {
    throw redirect('/auth/login');
  }
  return session;
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  
  return redirect('/auth/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

// Email service (mock implementation)
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  // In production, integrate with email service like SendGrid, Mailgun, etc.
  console.log(`Verification email sent to ${email} with token: ${token}`);
  console.log(`Verification URL: ${process.env.APP_URL}/auth/verify-email?token=${token}`);
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  // In production, integrate with email service
  console.log(`Password reset email sent to ${email} with token: ${token}`);
  console.log(`Reset URL: ${process.env.APP_URL}/auth/reset-password?token=${token}`);
}