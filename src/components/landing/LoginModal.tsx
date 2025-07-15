import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      navigate('/dashboard');
      onClose();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-6">
                  <Dialog.Title className="text-2xl font-bold text-gray-900">
                    Sign In
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Demo Credentials */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-semibold text-blue-800 mb-1">Demo Credentials</h3>
                    <p className="text-xs text-blue-600">Use these credentials to test the login</p>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-600">Email: <span className="font-mono">demo@foodsupply.com</span></p>
                    <p className="text-xs text-gray-600">Password: <span className="font-mono">Demo123!</span></p>
                  </div>
                  <div className="mt-3 text-center">
                    <button 
                      type="button"
                      className="text-xs font-medium text-white px-4 py-2 rounded-md transition-colors"
                      style={{ backgroundColor: '#1E4C8A' }}
                      onClick={() => {
                        const emailInput = document.getElementById('email') as HTMLInputElement;
                        const passwordInput = document.getElementById('password') as HTMLInputElement;
                        if (emailInput) emailInput.value = 'demo@foodsupply.com';
                        if (passwordInput) passwordInput.value = 'Demo123!';
                      }}
                    >
                      Fill Demo Data
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                          (e.target as HTMLInputElement).style.borderColor = '#1E4C8A';
                          (e.target as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(30, 76, 138, 0.2)';
                        }}
                        onBlur={(e) => {
                          (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                          (e.target as HTMLInputElement).style.boxShadow = 'none';
                        }}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
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

                  {/* Remember Me */}
                  <div className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 transition-colors"
                      style={{ accentColor: '#1E4C8A' } as React.CSSProperties}
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  {/* Sign In Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full text-white py-3 px-4 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: '#1E4C8A' }}
                    onMouseEnter={(e) => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = '#16365F')}
                    onMouseLeave={(e) => !isLoading && ((e.target as HTMLButtonElement).style.backgroundColor = '#1E4C8A')}
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

                  {error && (
                    <div className="text-red-600 text-sm text-center">
                      {error}
                    </div>
                  )}
                </form>

                <div className="mt-6 text-center space-y-4">
                  <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </a>
                  <div className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="/enterprise" className="text-blue-600 hover:text-blue-500 font-medium transition-colors">
                      Enterprise SSO Login →
                    </a>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};