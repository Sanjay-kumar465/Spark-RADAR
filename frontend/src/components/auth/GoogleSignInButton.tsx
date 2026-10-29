import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps {
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  workspaceName?: string;
  onError?: (err: string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = 'continue_with',
  workspaceName,
  onError,
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleConfigured, setGoogleConfigured] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (clientId && !clientId.startsWith('your-google')) {
      setGoogleConfigured(true);
      // Load Google Identity Services script if not already present
      if (!document.getElementById('google-client-script')) {
        const script = document.createElement('script');
        script.id = 'google-client-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initializeGoogleGSI();
        };
        document.body.appendChild(script);
      } else if ((window as any).google?.accounts?.id) {
        initializeGoogleGSI();
      }
    }
  }, [clientId]);

  const initializeGoogleGSI = () => {
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
      } catch (err) {
        console.warn('Google GSI initialization notice:', err);
      }
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      onError?.('No credential returned from Google.');
      return;
    }
    setLoading(true);
    try {
      await loginWithGoogle(response.credential, workspaceName);
      navigate('/dashboard');
    } catch (err: any) {
      onError?.(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (googleConfigured && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt is suppressed, fall back to dialog or standard button
          console.info('Google One-Tap suppressed or skipped.');
        }
      });
    } else {
      // Prompt user with helpful config note
      onError?.(
        'Google OAuth configuration required: Set VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env to connect your Google Cloud Console app.'
      );
    }
  };

  const buttonLabel =
    text === 'signin_with'
      ? 'Sign in with Google'
      : text === 'signup_with'
      ? 'Sign up with Google'
      : 'Continue with Google';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={buttonLabel}
      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-stone bg-white hover:bg-stone/20 active:scale-[0.99] text-txt-primary font-medium text-sm transition-all shadow-subtle hover:shadow-card focus:outline-none focus:ring-2 focus:ring-golden disabled:opacity-60"
    >
      {/* Official multi-color Google SVG icon */}
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span className="font-semibold">{loading ? 'Connecting Google...' : buttonLabel}</span>
    </button>
  );
};

export default GoogleSignInButton;

