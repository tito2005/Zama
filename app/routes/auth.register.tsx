import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/cloudflare';
import { RegisterForm } from '~/components/auth/RegisterForm';
import { createUser, createEmailVerificationToken, getUserSession, sendVerificationEmail } from '~/lib/.server/auth/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getUserSession(request);
  if (session) {
    return redirect('/dashboard');
  }
  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const terms = formData.get('terms') as string;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return json({ error: 'All fields are required' }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
  }

  if (!terms) {
    return json({ error: 'You must agree to the Terms of Service and Privacy Policy' }, { status: 400 });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ error: 'Please enter a valid email address' }, { status: 400 });
  }

  try {
    const user = await createUser(email, password, name);
    const verificationToken = await createEmailVerificationToken(email);
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return json({ success: true });
  } catch (error: any) {
    if (error.message === 'User already exists') {
      return json({ error: 'An account with this email already exists' }, { status: 400 });
    }
    
    console.error('Registration error:', error);
    return json({ error: 'An error occurred during registration' }, { status: 500 });
  }
}

export default function Register() {
  return <RegisterForm />;
}