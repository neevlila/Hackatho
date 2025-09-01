import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Eye, EyeOff, Mail, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { googleAuth } from '../services/googleAuth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  
  const { login, loginAsDemo, resendConfirmationEmail } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendMessage('');
    setShowResend(false);
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        if (result.errorType === 'confirmation') {
          setError('Your email address has not been confirmed. Please check your inbox.');
          setShowResend(true);
        } else { // 'credentials' or 'unknown'
          setError('Invalid email or password. Please try again.');
          setShowResend(false);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAsDemo();
    navigate('/dashboard');
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await googleAuth.signIn();
    } catch (error) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address above to resend the confirmation link.');
      return;
    }
    setLoading(true);
    setResendMessage('');
    setError('');

    const { error: resendError } = await resendConfirmationEmail(email);

    if (resendError) {
      setResendMessage(`Error: ${resendError.message}`);
    } else {
      setResendMessage('A new confirmation email has been sent. Please check your inbox (and spam folder).');
      setShowResend(false);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900'
    } flex items-center justify-center p-4`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-4"
          >
            <div className={`p-3 rounded-full shadow-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </motion.div>
          <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-white'
          }`}>EduScheduler</h1>
          <p className={`text-sm md:text-base ${
            theme === 'dark' ? 'text-gray-300' : 'text-blue-100'
          }`}>Smart Classroom & Timetable Management</p>
        </div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl shadow-xl p-6 md:p-8 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="text-center mb-6">
            <h2 className={`text-xl md:text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Welcome Back</h2>
            <p className={`text-sm md:text-base ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>Sign in to your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`border px-4 py-3 rounded-lg mb-4 text-sm ${
                theme === 'dark' 
                  ? 'bg-red-900/20 border-red-700 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="admin@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className={`flex-1 border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
            <span className={`px-4 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>or</span>
            <div className={`flex-1 border-t ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
            }`}></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all font-medium border border-gray-300 text-sm md:text-base flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Demo Login */}
          <div className="mt-4">
            <button
              onClick={handleDemoLogin}
              className={`w-full py-3 px-4 rounded-lg focus:ring-4 transition-all font-medium text-sm md:text-base ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-100'
              }`}
            >
              Sign In as Demo User
            </button>
          </div>
          
          {showResend && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className={`text-sm font-medium disabled:opacity-50 ${
                  theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                Resend confirmation email?
              </button>
            </div>
          )}
          {resendMessage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 text-center text-sm p-3 rounded-lg ${
                resendMessage.startsWith('Error:') 
                  ? theme === 'dark'
                    ? 'bg-red-900/20 text-red-300'
                    : 'bg-red-50 text-red-700'
                  : theme === 'dark'
                    ? 'bg-green-900/20 text-green-300'
                    : 'bg-green-50 text-green-700'
              }`}
            >
              {resendMessage}
            </motion.div>
          )}

          <div className={`mt-6 text-center text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Don't have an account?{' '}
            <Link to="/signup" className={`font-medium hover:underline ${
              theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}>
              Sign Up
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
