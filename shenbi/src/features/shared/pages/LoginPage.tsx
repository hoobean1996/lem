/**
 * Login Page with Google Sign-In
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { Paintbrush, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, GOOGLE_CLIENT_ID } from '../contexts/AuthContext';
import { SEO } from '../components/SEO';

function LoginContent() {
  const navigate = useNavigate();
  const { loginWithGoogle, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    if (!credentialResponse.credential) {
      setError('No credential received from Google');
      return;
    }

    setIsLoggingIn(true);
    setError(null);

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f5e0] via-white to-[#f0f9eb]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Sign In"
        description="Sign in to Shenbi to continue your coding adventure. Track your progress, earn badges, and compete with friends."
        url="/login"
      />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e8f5e0] via-white to-[#f0f9eb]">
        {/* Header */}
        <header className="p-4">
          <Link to="/landing" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4a7a2a] rounded-xl flex items-center justify-center">
              <Paintbrush className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-800">Shenbi</span>
          </Link>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Shenbi</h1>
                <p className="text-gray-600">Sign in to start your coding adventure</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Google Sign-In */}
              <div className="flex flex-col items-center gap-4">
                {isLoggingIn ? (
                  <div className="flex items-center gap-3 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#4a7a2a]" />
                    <span className="text-gray-600">Signing in...</span>
                  </div>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="300"
                  />
                )}
              </div>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Back to landing */}
              <div className="text-center">
                <Link to="/landing" className="text-sm text-[#4a7a2a] hover:underline">
                  Learn more about Shenbi
                </Link>
              </div>
            </div>

            {/* Footer text */}
            <p className="mt-6 text-center text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </main>
      </div>
    </>
  );
}

export default function LoginPage() {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f5e0] via-white to-[#f0f9eb]">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Configuration Required</h1>
          <p className="text-gray-600">
            Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
