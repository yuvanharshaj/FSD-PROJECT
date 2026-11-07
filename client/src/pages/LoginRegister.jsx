import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';
import {
  validateName,
  validateEmail,
  validateVehicleNumber,
  validatePassword,
  getPasswordStrength,
  formatVehicleNumber
} from '../utils/validators';

// Unified authentication page supporting Login, Registration, and 1-Click Demo profiles
export default function LoginRegister({ initialMode = 'login' }) {
  const location = useLocation();
  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [isLogin, setIsLogin] = useState(!isRegisterRoute);

  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    vehicleNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Field input refs to focus the first invalid field on submit
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const vehicleRef = useRef(null);

  const { login, register, demoLogin } = useAuth();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    document.title = isLogin ? 'Sign In — SmartPark' : 'Register Account — SmartPark';
    // Clear errors when toggling between login and register
    setErrors({});
    setTouched({});
  }, [isLogin]);

  // Handle input change and perform live validation if field was touched
  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'vehicleNumber') {
      nextValue = formatVehicleNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: nextValue }));

    if (touched[name]) {
      validateSingleField(name, nextValue);
    }
  };

  // Validate an individual field and update error state
  const validateSingleField = (field, value) => {
    let result = { isValid: true, message: '' };

    if (field === 'name' && !isLogin) {
      result = validateName(value);
    } else if (field === 'email') {
      result = validateEmail(value);
    } else if (field === 'password') {
      if (isLogin) {
        result = { isValid: !!value.trim(), message: value.trim() ? '' : 'Password is required' };
      } else {
        result = validatePassword(value);
      }
    } else if (field === 'vehicleNumber' && !isLogin) {
      result = validateVehicleNumber(value, false);
    }

    setErrors(prev => ({ ...prev, [field]: result.message }));
    return result.isValid;
  };

  // Handle onBlur for inline validation
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateSingleField(field, formData[field]);
  };

  // Perform full form validation across all active fields
  const validateAll = () => {
    const newErrors = {};
    const newTouched = {};

    if (!isLogin) {
      const nameCheck = validateName(formData.name);
      if (!nameCheck.isValid) newErrors.name = nameCheck.message;
      newTouched.name = true;

      const vehicleCheck = validateVehicleNumber(formData.vehicleNumber, false);
      if (!vehicleCheck.isValid) newErrors.vehicleNumber = vehicleCheck.message;
      newTouched.vehicleNumber = true;

      const passCheck = validatePassword(formData.password);
      if (!passCheck.isValid) newErrors.password = passCheck.message;
      newTouched.password = true;
    } else {
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      newTouched.password = true;
    }

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) newErrors.email = emailCheck.message;
    newTouched.email = true;

    setErrors(newErrors);
    setTouched(prev => ({ ...prev, ...newTouched }));

    // Focus the first invalid field
    if (newErrors.name && nameRef.current) {
      nameRef.current.focus();
    } else if (newErrors.email && emailRef.current) {
      emailRef.current.focus();
    } else if (newErrors.password && passwordRef.current) {
      passwordRef.current.focus();
    } else if (newErrors.vehicleNumber && vehicleRef.current) {
      vehicleRef.current.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  // Form validity check for disabling submit button
  const isFormValid = () => {
    const emailValid = validateEmail(formData.email).isValid;
    if (isLogin) {
      return emailValid && !!formData.password.trim();
    }
    const nameValid = validateName(formData.name).isValid;
    const passValid = validatePassword(formData.password).isValid;
    const vehicleValid = validateVehicleNumber(formData.vehicleNumber, false).isValid;
    return nameValid && emailValid && passValid && vehicleValid;
  };

  // Submit login or registration form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    let result;
    if (isLogin) {
      result = await login(formData.email.trim().toLowerCase(), formData.password);
    } else {
      const cleanVehicle = formData.vehicleNumber.replace(/\s+/g, '').toUpperCase();
      result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        vehicleNumber: cleanVehicle
      });
    }
    setSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      // If server reports email is already registered, display inline under email field
      if (result.message && result.message.toLowerCase().includes('already registered')) {
        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        setTouched(prev => ({ ...prev, email: true }));
        if (emailRef.current) emailRef.current.focus();
      }
    }
  };

  // Quick 1-click demo login handler
  const handleDemo = async (role) => {
    setSubmitting(true);
    const result = await demoLogin(role);
    setSubmitting(false);
    if (result.success) {
      navigate(role === 'admin' ? '/admin' : from, { replace: true });
    }
  };

  const passStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Top Header Card */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isLogin ? 'Sign In to SmartPark' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isLogin ? 'Access your active reservations and tickets' : 'Join thousands of drivers enjoying zero-wait parking'}
          </p>
        </div>

        {/* 1-Click Demo Buttons Bar */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Instant Evaluator Demo</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">1-Click</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemo('user')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Try as Driver</span>
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDemo('admin')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Try as Admin</span>
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
          
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2 rounded-xl transition-all ${
                isLogin
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2 rounded-xl transition-all ${
                !isLogin
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    ref={nameRef}
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Yuvan Harsha"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                        : touched.name && validateName(formData.name).isValid
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:ring-indigo-500'
                    }`}
                  />
                  {touched.name && validateName(formData.name).isValid && (
                    <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3" />
                  )}
                </div>
                {errors.name && <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : touched.email && validateEmail(formData.email).isValid
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:ring-indigo-500'
                  }`}
                />
                {touched.email && validateEmail(formData.email).isValid && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3" />
                )}
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-medium">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                {!isLogin && formData.password && (
                  <span className={`text-[10px] font-bold ${passStrength.color}`}>
                    Strength: {passStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-16 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : touched.password && (isLogin ? formData.password.trim() : validatePassword(formData.password).isValid)
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:ring-indigo-500'
                  }`}
                />
                <div className="absolute right-3 top-3 flex items-center gap-1.5">
                  {!isLogin && touched.password && validatePassword(formData.password).isValid && (
                    <Check className="w-4 h-4 text-emerald-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 font-medium">{errors.password}</p>}
              {!isLogin && !errors.password && (
                <p className="text-[11px] text-slate-400">
                  Must be at least 8 characters with a letter and a number.
                </p>
              )}
            </div>

            {/* Vehicle Number (Register only) */}
            {!isLogin && (
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Vehicle Number (Optional)</span>
                  <span className="text-[11px] text-slate-400">e.g. KA01AB1234</span>
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    ref={vehicleRef}
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    onBlur={() => handleBlur('vehicleNumber')}
                    placeholder="KA01AB1234"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 uppercase tracking-wider font-semibold ${
                      errors.vehicleNumber
                        ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                        : touched.vehicleNumber && formData.vehicleNumber && validateVehicleNumber(formData.vehicleNumber, false).isValid
                        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 focus:ring-indigo-500'
                    }`}
                  />
                  {formData.vehicleNumber && validateVehicleNumber(formData.vehicleNumber, false).isValid && (
                    <Check className="w-4 h-4 text-emerald-500 absolute right-3.5 top-3" />
                  )}
                </div>
                {errors.vehicleNumber && <p className="text-[11px] text-red-500 font-medium">{errors.vehicleNumber}</p>}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !isFormValid()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{submitting ? 'Please wait...' : isLogin ? 'Sign In to SmartPark' : 'Create My Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
