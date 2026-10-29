import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/branding/Logo';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Lock, Mail, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion()) return;
      gsap.fromTo(
        '.auth-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    },
    { scope: containerRef }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@sparkradar.in');
    setPassword('SparkRadar2026!');
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-txt-primary font-heading">
          Sign in to your fleet workspace
        </h2>
        <p className="mt-1 text-sm text-txt-secondary">
          Manage vehicles, document renewals, and driver compliance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="auth-card bg-white py-8 px-6 shadow-elevated rounded-2xl border border-stone sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Demo Fill Button */}
          <div className="mb-6 p-3 rounded-xl bg-sand-light/60 border border-sand/40 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-golden-dark flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-golden-dark" /> Quick Demo Login
              </p>
              <p className="text-[11px] text-txt-secondary">
                Pre-populated Sahyadri Tourist Transports fleet
              </p>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="text-xs font-bold text-golden-dark hover:underline bg-white px-2.5 py-1 rounded shadow-subtle border border-stone"
            >
              Fill Credentials
            </button>
          </div>

          {/* Google Sign-In Action */}
          <div className="mb-6">
            <GoogleSignInButton text="signin_with" onError={(msg) => setError(msg)} />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-txt-secondary font-mono tracking-wider">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="operator@company.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-golden-dark hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-txt-muted hover:text-txt-primary focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={loading} className="w-full text-sm mt-2">
              Sign In to Workspace
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-txt-secondary">
            Don't have a workspace yet?{' '}
            <Link to="/register" className="font-semibold text-golden-dark hover:underline">
              Create a new fleet account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
