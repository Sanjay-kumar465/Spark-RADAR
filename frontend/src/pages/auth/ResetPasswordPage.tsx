import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../components/branding/Logo';
import { Button } from '../../components/common/Button';
import { api } from '../../api/endpoints';
import { Lock, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token') || '';

  const [token, setToken] = useState(urlToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('A reset token is required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword(token.trim(), newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-block mb-4">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-txt-primary">
          Set new password
        </h2>
        <p className="mt-1 text-sm text-txt-secondary">
          Enter your reset token and choose a strong new password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-elevated rounded-2xl border border-stone sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sand-light border border-sand/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-golden-dark shrink-0 mt-0.5" />
                <div className="text-xs text-txt-primary">
                  <p className="font-bold text-golden-dark">Password reset successfully!</p>
                  <p className="mt-1 text-txt-secondary">
                    Your password has been updated. You can now log into your fleet workspace using your new password.
                  </p>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full text-sm mt-3"
                onClick={() => navigate('/login')}
              >
                Sign In with New Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Reset Token *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Enter reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  New Password (min 8 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full text-sm mt-2">
                Update Password
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-golden-dark hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
