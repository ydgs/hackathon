import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth, DEMO_ACCOUNTS } from '../hooks/useAuth';
import { login as loginService, getMe } from '../services/auth.service';
import { Button } from '../components/ui/Button';
import { FormField, inputClasses } from '../components/ui/FormField';
import { cn } from '../lib/classNames';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Default to first demo account (Alice)
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');

  const validate = (): boolean => {
    let valid = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setAuthError('');
    setLoading(true);
    try {
      // Step 1: Authenticate and store JWT
      await loginService({ email, password });

      // Step 2: Fetch full user profile (eligibility + privacy) with the new token
      const currentUser = await getMe();

      // Step 3: Persist full user in auth context + localStorage
      login(currentUser);

      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string } };
      setAuthError(e.apiError?.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (accountEmail: string, accountPassword: string) => {
    setEmail(accountEmail);
    setPassword(accountPassword);
    setEmailError('');
    setAuthError('');
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField label="Email" htmlFor="email" error={emailError} required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-required="true"
            aria-describedby={emailError ? 'email-error' : undefined}
            className={cn(inputClasses(!!emailError))}
            placeholder="you@nexlevel.mu"
          />
        </FormField>

        <FormField label="Password" htmlFor="password" required>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-required="true"
              className={cn(inputClasses(!!authError), 'pr-10')}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {authError && (
            <p id="password-error" className="text-xs text-red-400 mt-0.5" role="alert">
              {authError}
            </p>
          )}
        </FormField>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      {/* Demo quick-select */}
      <div className="mt-6 pt-5 border-t border-brand-700">
        <p className="text-xs text-gray-500 mb-3">Demo accounts (password: demo1234):</p>
        <div className="flex gap-2 flex-wrap">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.label}
              type="button"
              onClick={() => handleQuickSelect(account.email, account.password)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                email === account.email
                  ? 'bg-brand-400 text-white border-brand-400'
                  : 'border-brand-600 text-brand-300 hover:bg-brand-700',
              )}
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
