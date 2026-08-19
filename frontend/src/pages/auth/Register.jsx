import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { getErrorMessage, getValidationErrors } from '../../utils/errorHandler';

export default function Register() {
  const { register } = useAuth();
  const { redirectByRole } = useAuthRedirect();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const passwordChecks = useMemo(() => ({
    length: formData.password.length >= 8,
    match: formData.password && formData.password_confirmation && formData.password === formData.password_confirmation,
  }), [formData.password, formData.password_confirmation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const user = await register(formData);
      redirectByRole(user);
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
      } else {
        setError(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = (fieldName) => `
    w-full bg-navy-800/50 border ${
      fieldErrors[fieldName]
        ? 'border-rose-500/50 focus:border-rose-400'
        : 'border-navy-700/50 focus:border-amber-400/50'
    } rounded-xl px-4 py-3.5 pl-12 text-navy-100 placeholder-navy-500
    focus:outline-none focus:ring-2 ${
      fieldErrors[fieldName]
        ? 'focus:ring-rose-500/20'
        : 'focus:ring-amber-400/20'
    } transition-all duration-200 text-sm
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Create your account
        </h2>
        <p className="text-navy-400 text-sm">
          Join OpenShelf and start exploring libraries
        </p>
      </div>

      {/* Error Alert */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-navy-300 mb-2">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-500" />
            <input
              id="register-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className={inputClasses('name')}
              required
              autoComplete="name"
              autoFocus
            />
          </div>
          {fieldErrors.name && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-400 mt-1.5 ml-1">
              {fieldErrors.name}
            </motion.p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-navy-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-500" />
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClasses('email')}
              required
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-400 mt-1.5 ml-1">
              {fieldErrors.email}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-navy-300 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-500" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className={inputClasses('password')}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {fieldErrors.password && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-400 mt-1.5 ml-1">
              {fieldErrors.password}
            </motion.p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="register-confirm" className="block text-sm font-medium text-navy-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-500" />
            <input
              id="register-confirm"
              type={showConfirm ? 'text' : 'password'}
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={inputClasses('password_confirmation')}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-500 hover:text-navy-300 transition-colors"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
          {fieldErrors.password_confirmation && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-400 mt-1.5 ml-1">
              {fieldErrors.password_confirmation}
            </motion.p>
          )}
        </div>

        {/* Password requirements */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-x-6 gap-y-1 pt-1"
          >
            <div className={`flex items-center gap-1.5 text-xs ${passwordChecks.length ? 'text-emerald-400' : 'text-navy-500'}`}>
              <Check className={`w-3.5 h-3.5 ${passwordChecks.length ? 'opacity-100' : 'opacity-40'}`} />
              8+ characters
            </div>
            {formData.password_confirmation && (
              <div className={`flex items-center gap-1.5 text-xs ${passwordChecks.match ? 'text-emerald-400' : 'text-rose-400'}`}>
                <Check className={`w-3.5 h-3.5 ${passwordChecks.match ? 'opacity-100' : 'opacity-40'}`} />
                Passwords match
              </div>
            )}
          </motion.div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            id="register-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-navy-950 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-navy-950/30 border-t-navy-950 rounded-full"
                />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-4.5 h-4.5" />
                Create Account
              </>
            )}
          </button>
        </div>
      </form>

      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-sm text-navy-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors inline-flex items-center gap-1"
          >
            Sign in
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
