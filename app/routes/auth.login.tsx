import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { LoginForm } from '~/components/auth/LoginForm';
import { createUserSession, getUserSession, verifyUser } from '~/lib/.server/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session) {
    return redirect('/dashboard');
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const user = await verifyUser(email, password);
    if (!user) {
      return json({ error: 'Invalid email or password' }, { status: 400 });
    }

    if (!user.emailVerified) {
      return json({ error: 'Please verify your email address before signing in' }, { status: 400 });
    }

    return await createUserSession(user, '/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'An error occurred during login' }, { status: 500 });
  }
}

export default function Login() {
  return <LoginForm />;
}