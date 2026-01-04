import React from 'react';
import { Button } from '../components/ui/button';
import { Shield, Lock, FileCheck } from 'lucide-react';

function Login() {
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen govt-gradient flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="text-white space-y-6">
          <div className="flex items-center space-x-3">
            <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center">
              <Shield className="h-10 w-10 text-[hsl(var(--navy))]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Governance Portal</h1>
              <p className="text-base sm:text-lg opacity-90">Census Intelligence System</p>
            </div>
          </div>
          
          <p className="text-base sm:text-lg opacity-95 leading-relaxed">
            Secure platform for census data review, analytics, and policy simulation.
            Role-based access ensures data integrity and compliance.
          </p>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">Secure Authentication</h3>
                <p className="text-sm opacity-90">Government-grade OAuth2 authentication</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileCheck className="h-5 w-5 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm">Audit Trail</h3>
                <p className="text-sm opacity-90">Complete tracking of all actions and reviews</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Official Access</h2>
            <p className="text-sm text-gray-600">Sign in with your government credentials</p>
          </div>

          <Button
            data-testid="google-login-btn"
            onClick={handleLogin}
            className="w-full h-12 text-base font-semibold bg-[hsl(var(--navy))] hover:bg-[hsl(var(--navy))]/90"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              By signing in, you agree to comply with government data protection policies.
              All actions are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;