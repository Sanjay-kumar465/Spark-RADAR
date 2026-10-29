import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/branding/Logo';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { Building2, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useGSAP, gsap, isReducedMotion } from '../../animations/gsap';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    workspace_name: '',
    business_type: 'goods_transport',
    state_jurisdiction: 'TN',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (isReducedMotion()) return;
      gsap.fromTo(
        '.register-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    },
    { scope: containerRef }
  );

  const states = [
    { code: 'TN', name: 'Tamil Nadu' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'KA', name: 'Karnataka' },
    { code: 'DL', name: 'Delhi' },
    { code: 'GJ', name: 'Gujarat' },
    { code: 'RJ', name: 'Rajasthan' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'HR', name: 'Haryana' },
    { code: 'WB', name: 'West Bengal' },
    { code: 'TS', name: 'Telangana' },
    { code: 'AP', name: 'Andhra Pradesh' },
    { code: 'KL', name: 'Kerala' },
    { code: 'GA', name: 'Goa' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-ivory flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="inline-block mb-3">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-txt-primary font-heading">
          Create your fleet workspace
        </h2>
        <p className="mt-1 text-sm text-txt-secondary">
          Get complete visibility into vehicle validity, renewals, and compliance tasks
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="register-card bg-white py-8 px-6 shadow-elevated rounded-2xl border border-stone sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-racing-light border border-racing/30 text-racing-dark text-xs font-medium">
              {error}
            </div>
          )}

          {/* Quick Sign-Up via Google */}
          <div className="mb-6">
            <GoogleSignInButton
              text="signup_with"
              workspaceName={formData.workspace_name.trim() || undefined}
              onError={(msg) => setError(msg)}
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-txt-secondary font-mono tracking-wider">
                Or configure manual fleet registration
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Information Section */}
            <div className="border-b border-stone pb-2 mb-2">
              <span className="text-xs font-bold text-golden-dark uppercase tracking-wider">
                1. Business Details
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                Transport Business / Fleet Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sahyadri Tourist Transports"
                  value={formData.workspace_name}
                  onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Primary Operation Type *
                </label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
                >
                  <option value="goods_transport">Goods Transport / Lorry Fleet</option>
                  <option value="travel_agency">Travel Agency / Tourist Transport</option>
                  <option value="mixed_fleet">Mixed Commercial Fleet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Primary State Jurisdiction *
                </label>
                <select
                  value={formData.state_jurisdiction}
                  onChange={(e) => setFormData({ ...formData, state_jurisdiction: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden"
                >
                  {states.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Operator Account Details */}
            <div className="border-b border-stone pb-2 mb-2 pt-2">
              <span className="text-xs font-bold text-golden-dark uppercase tracking-wider">
                2. Operator Account
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Jadhav"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98220 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Business Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="vikram@sahyadritrans.in"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-ivory/30 border border-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-golden focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-txt-primary uppercase tracking-wider mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-txt-muted absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>

            <Button type="submit" isLoading={loading} className="w-full text-sm mt-4">
              Create Fleet Workspace
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-txt-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-golden-dark hover:underline">
              Sign in to your workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
