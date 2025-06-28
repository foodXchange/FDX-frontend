import React, { useState } from 'react';
import './App.css';

function App() {
  const [email, setEmail] = useState('demo@foodxchange.com');
  const [password, setPassword] = useState('demo123');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('foodxchange_token', data.data.token);
        localStorage.setItem('foodxchange_user', JSON.stringify(data.data.user));
        setIsLoggedIn(true);
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      alert('Backend connection failed. Make sure backend is running on port 5000.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('foodxchange_token');
    localStorage.removeItem('foodxchange_user');
    setIsLoggedIn(false);
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">🚀 FoodXchange</h1>
                <span className="ml-3 px-3 py-1 bg-blue-500 text-blue-100 rounded-full text-sm">
                  New Platform
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Your Food Trading Platform
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Connect with suppliers, create RFQs, manage orders, and grow your food business 
                with our comprehensive trading platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* RFQ Module */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">📋</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">RFQ Module</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Create and manage requests for quotations with AI-powered supplier matching.
                    </p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full">
                      Create New RFQ
                    </button>
                  </div>
                </div>
              </div>

              {/* Marketplace */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">🏪</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Marketplace</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Browse and discover food products from verified suppliers worldwide.
                    </p>
                    <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full">
                      Browse Products
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold">📦</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Track orders, manage shipments, and handle invoicing seamlessly.
                    </p>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full">
                      View Orders
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-500">Active RFQs</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">847</div>
                <div className="text-sm text-gray-500">Products Available</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-600">23</div>
                <div className="text-sm text-gray-500">Pending Orders</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-500">Verified Suppliers</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🚀 FoodXchange</h2>
          <p className="text-gray-600">Sign in to your food trading platform</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials</h3>
            <div className="text-sm text-gray-600">
              <div>Email: demo@foodxchange.com</div>
              <div>Password: demo123</div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>New to FoodXchange? <span className="text-blue-600 font-medium">Contact sales</span></p>
        </div>
      </div>
    </div>
  );
}

export default App;
