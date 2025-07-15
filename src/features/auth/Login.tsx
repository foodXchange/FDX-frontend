import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Toast } from '@components/ui/Toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Top Navigation Bar */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{ backgroundColor: '#FF6B35' }}>
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">FoodXchange</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white px-4 py-2 rounded-md text-sm font-medium transition-colors" style={{ backgroundColor: '#1E4C8A' }} onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#16365F'} onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1E4C8A'}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex pt-16">
        {/* Left Column - Login Form */}
        <div className="w-2/5 bg-white flex flex-col justify-center px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Enterprise Login</h2>
              <p className="text-lg text-gray-600 mb-4">Access your partner portal</p>
              <p className="text-sm text-gray-500">Transforming Global Food Sourcing</p>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-4 h-4 mr-2 flex-shrink-0 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm text-gray-700 font-medium">Your data is encrypted with 256-bit SSL</span>
              </div>
              <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
                <span>GDPR Compliant</span>
                <span>•</span>
                <span>SOC 2 Type II Certified</span>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Join 5,000+ food businesses</p>
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="text-center mb-3">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Demo Credentials</h3>
                <p className="text-xs text-blue-600">Copy and paste to test the login</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white rounded px-3 py-2 border">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Company:</p>
                    <p className="text-sm font-mono text-gray-900">Demo Foods Inc.</p>
                  </div>
                  <button 
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      const companyInput = document.getElementById('company') as HTMLInputElement;
                      if (companyInput) companyInput.value = 'Demo Foods Inc.';
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2 border">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Email:</p>
                    <p className="text-sm font-mono text-gray-900">demo@foodsupply.com</p>
                  </div>
                  <button 
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      const emailInput = document.getElementById('email') as HTMLInputElement;
                      if (emailInput) emailInput.value = 'demo@foodsupply.com';
                    }}
                  >
                    Copy
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white rounded px-3 py-2 border">
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Password:</p>
                    <p className="text-sm font-mono text-gray-900">Demo123!</p>
                  </div>
                  <button 
                    type="button"
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      const passwordInput = document.getElementById('password') as HTMLInputElement;
                      if (passwordInput) passwordInput.value = 'Demo123!';
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="mt-3 text-center">
                <button 
                  type="button"
                  className="text-xs font-medium text-white px-4 py-2 rounded-md transition-colors"
                  style={{ backgroundColor: '#1E4C8A' }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#16365F'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1E4C8A'}
                  onClick={() => {
                    const companyInput = document.getElementById('company') as HTMLInputElement;
                    const emailInput = document.getElementById('email') as HTMLInputElement;
                    const passwordInput = document.getElementById('password') as HTMLInputElement;
                    if (companyInput) companyInput.value = 'Demo Foods Inc.';
                    if (emailInput) emailInput.value = 'demo@foodsupply.com';
                    if (passwordInput) passwordInput.value = 'Demo123!';
                  }}
                >
                  Fill All Demo Data
                </button>
              </div>
            </div>

            {/* Login Form Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Company/Organization Field */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                    Company/Organization
                  </label>
                  <input
                    id="company"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 text-base focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#1E4C8A';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(30, 76, 138, 0.2)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                    placeholder="Enter your company name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-gray-900 text-base focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                    onFocus={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#1E4C8A';
                      (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(30, 76, 138, 0.2)';
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                      (e.target as HTMLInputElement).style.boxShadow = 'none';
                    }}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-md text-gray-900 text-base focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                      onFocus={(e) => {
                        e.target.style.borderColor = '#1E4C8A';
                        e.target.style.boxShadow = '0 0 0 2px rgba(30, 76, 138, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <EyeIcon className="h-4 w-4 flex-shrink-0" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 transition-colors"
                      style={{
                        accentColor: '#1E4C8A'
                      } as React.CSSProperties}
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium transition-colors"
                    style={{ color: '#1E4C8A' }}
                    onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#16365F'}
                    onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#1E4C8A'}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white py-3 px-4 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ backgroundColor: '#1E4C8A' }}
                  onMouseEnter={(e) => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = '#16365F')}
                  onMouseLeave={(e) => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = '#1E4C8A')}
                  onFocus={(e) => (e.target as HTMLButtonElement).style.boxShadow = '0 0 0 2px rgba(30, 76, 138, 0.2)'}
                  onBlur={(e) => (e.target as HTMLButtonElement).style.boxShadow = 'none'}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </button>

                {/* Request Demo Link */}
                <div className="text-center">
                  <Link
                    to="/request-demo"
                    className="text-sm font-medium transition-colors"
                    style={{ color: '#FF6B35' }}
                    onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#E55100'}
                    onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#FF6B35'}
                  >
                    Request Demo
                  </Link>
                </div>
              </form>
            </div>

            {/* Additional Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex justify-center space-x-6 text-sm">
                <Link to="/compliance" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Compliance Standards
                </Link>
                <Link to="/security" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Security
                </Link>
              </div>
              <p className="text-xs text-gray-500">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-medium transition-colors"
                  style={{ color: '#1E4C8A' }}
                  onMouseEnter={(e) => (e.target as HTMLAnchorElement).style.color = '#16365F'}
                  onMouseLeave={(e) => (e.target as HTMLAnchorElement).style.color = '#1E4C8A'}
                >
                  Create a new account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Image */}
        <div className="w-3/5 flex items-center justify-center p-8" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #fef3f2 100%)' }}>
          <div className="max-w-lg text-center">
            <div className="mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #1E4C8A 0%, #FF6B35 100%)' }}>
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">F</span>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Global Food Sourcing Platform
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Connect with verified suppliers, streamline procurement, and ensure compliance across your supply chain.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#52B788' }}></div>
                  <span className="text-gray-700">500+ Verified Suppliers</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#1E4C8A' }}></div>
                  <span className="text-gray-700">Global Compliance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#FF6B35' }}></div>
                  <span className="text-gray-700">Real-time Tracking</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#B08D57' }}></div>
                  <span className="text-gray-700">Secure Transactions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/support" className="hover:text-gray-900 transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          id="login-error"
          title="Login Failed"
          message={error || 'Login failed'}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};