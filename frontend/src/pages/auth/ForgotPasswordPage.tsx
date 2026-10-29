import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/branding/Logo';
import { Button } from '../../components/common/Button';
import { api } from '../../api/endpoints';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToken, setSuccessToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(email);
      setSubmitted(true);
      if (res.reset_token) {
        setSuccessToken(res.reset_token);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request.');
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
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-txt-secondary">
          Enter your registered fleet email to receive password reset instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-elevated rounded-2xl border border-stone sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sand-light border border-sand/40 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-golden-dark shrink-0 mt-0.5" />
                <div className="text-xs text-txt-primary">
                  <p className="font-bold text-golden-dark">Password reset initiated</p>
                  <p className="mt-1 text-txt-secondary">
                    If <span className="font-semibold text-txt-primary">{email}</span> is registered with Spark Radar, a recovery link has been prepared.
                  </p>
                </div>
              </div>

              {successToken && (
                <div className="p-4 rounded-xl bg-ivory border border-stone space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-golden-dark">
                    <KeyRound className="w-4 h-4 text-golden-dark" />
                    <span>Instant Recovery Link (Development / Demo Mode)</span>
                  </div>
                  <p className="text-[11px] text-txt-secondary">
                    You can proceed directly to create a new password without waiting for an email:
                  </p>
                  <Button
                    variant="primary"
                    className="w-full text-xs mt-2"
                    onClick={() => navigate(`/reset-password?token=${encodeURIComponent(successToken)}`)}
                  >
                    Proceed to Reset Password
                  </Button>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-golden-dark hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Registered Email Address
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

              <Button type="submit" isLoading={loading} className="w-full text-sm mt-2">
                Send Reset Instructions
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
