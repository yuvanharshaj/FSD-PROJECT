import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Car, Lock, KeyRound, Ticket, LogOut, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  validateName,
  validateVehicleNumber,
  validatePassword,
  getPasswordStrength,
  formatVehicleNumber
} from '../utils/validators';

// User account profile and vehicle registration management page
export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth();

  useEffect(() => {
    document.title = 'My Profile — SmartPark';
  }, []);

  // Profile Form state
  const [name, setName] = useState(user?.name || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [profileErrors, setProfileErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // Refs for first invalid field focusing
  const nameRef = useRef(null);
  const vehicleRef = useRef(null);
  const currentPassRef = useRef(null);
  const newPassRef = useRef(null);
  const confirmPassRef = useRef(null);

  // Handle name change
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (profileTouched.name) {
      const check = validateName(val);
      setProfileErrors(prev => ({ ...prev, name: check.message }));
    }
  };

  // Handle vehicle change
  const handleVehicleChange = (e) => {
    const val = formatVehicleNumber(e.target.value);
    setVehicleNumber(val);
    if (profileTouched.vehicleNumber) {
      const check = validateVehicleNumber(val, false);
      setProfileErrors(prev => ({ ...prev, vehicleNumber: check.message }));
    }
  };

  // Save updated name and vehicle plate
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileTouched({ name: true, vehicleNumber: true });

    const nameCheck = validateName(name);
    const vehicleCheck = validateVehicleNumber(vehicleNumber, false);

    const newErrors = {};
    if (!nameCheck.isValid) newErrors.name = nameCheck.message;
    if (!vehicleCheck.isValid) newErrors.vehicleNumber = vehicleCheck.message;

    setProfileErrors(newErrors);

    if (newErrors.name && nameRef.current) {
      nameRef.current.focus();
      return;
    }
    if (newErrors.vehicleNumber && vehicleRef.current) {
      vehicleRef.current.focus();
      return;
    }
    if (Object.keys(newErrors).length > 0) return;

    setSavingProfile(true);
    await updateProfile({
      name: name.trim(),
      vehicleNumber: vehicleNumber.replace(/\s+/g, '').toUpperCase()
    });
    setSavingProfile(false);
  };

  // Change password verifying current password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordTouched({ current: true, new: true, confirm: true });

    const newErrors = {};
    if (!currentPassword) {
      newErrors.current = 'Current password is required';
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      newErrors.new = passCheck.message;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirm = 'New passwords do not match';
    }

    setPasswordErrors(newErrors);

    if (newErrors.current && currentPassRef.current) {
      currentPassRef.current.focus();
      return;
    }
    if (newErrors.new && newPassRef.current) {
      newPassRef.current.focus();
      return;
    }
    if (newErrors.confirm && confirmPassRef.current) {
      confirmPassRef.current.focus();
      return;
    }
    if (Object.keys(newErrors).length > 0) return;

    setSavingPassword(true);
    const res = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (res?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordTouched({});
      setPasswordErrors({});
    }
  };

  const isProfileValid = () => {
    return validateName(name).isValid && validateVehicleNumber(vehicleNumber, false).isValid;
  };

  const isPasswordValid = () => {
    return (
      !!currentPassword &&
      validatePassword(newPassword).isValid &&
      newPassword === confirmPassword
    );
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-soft flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{user?.email}</span>
          </p>
          <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Role: {user?.role}
            </span>
            <span className="text-xs text-slate-400">
              Vehicle: {user?.vehicleNumber || 'Not set'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Personal & Vehicle Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Personal & Vehicle Details</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Update your display name and default plate</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <div className="relative">
                <input
                  ref={nameRef}
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => {
                    setProfileTouched(p => ({ ...p, name: true }));
                    const check = validateName(name);
                    setProfileErrors(p => ({ ...p, name: check.message }));
                  }}
                  className={`w-full px-3.5 pr-9 py-2.5 rounded-xl border text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    profileErrors.name
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : profileTouched.name && validateName(name).isValid
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-indigo-500'
                  }`}
                />
                {profileTouched.name && validateName(name).isValid && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                )}
              </div>
              {profileErrors.name && <p className="text-[11px] text-red-500">{profileErrors.name}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Vehicle Plate Number</label>
                <span className="text-[10px] text-slate-400">e.g. KA01AB1234</span>
              </div>
              <div className="relative">
                <input
                  ref={vehicleRef}
                  type="text"
                  value={vehicleNumber}
                  onChange={handleVehicleChange}
                  onBlur={() => {
                    setProfileTouched(p => ({ ...p, vehicleNumber: true }));
                    const check = validateVehicleNumber(vehicleNumber, false);
                    setProfileErrors(p => ({ ...p, vehicleNumber: check.message }));
                  }}
                  placeholder="e.g. KA04MK5566"
                  className={`w-full px-3.5 pr-9 py-2.5 rounded-xl border uppercase font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    profileErrors.vehicleNumber
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : profileTouched.vehicleNumber && vehicleNumber && validateVehicleNumber(vehicleNumber, false).isValid
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-indigo-500'
                  }`}
                />
                {vehicleNumber && validateVehicleNumber(vehicleNumber, false).isValid && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3" />
                )}
              </div>
              {profileErrors.vehicleNumber && <p className="text-[11px] text-red-500">{profileErrors.vehicleNumber}</p>}
            </div>

            <button
              type="submit"
              disabled={savingProfile || !isProfileValid()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Section 2: Change Password */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Change Password</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Verify your old password to set a new one</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
              <div className="relative">
                <input
                  ref={currentPassRef}
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (passwordTouched.current) {
                      setPasswordErrors(p => ({ ...p, current: e.target.value ? '' : 'Current password is required' }));
                    }
                  }}
                  onBlur={() => {
                    setPasswordTouched(p => ({ ...p, current: true }));
                    setPasswordErrors(p => ({ ...p, current: currentPassword ? '' : 'Current password is required' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full px-3.5 pr-9 py-2 rounded-xl border text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    passwordErrors.current
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : passwordTouched.current && currentPassword
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-indigo-500'
                  }`}
                />
                {passwordTouched.current && currentPassword && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                )}
              </div>
              {passwordErrors.current && <p className="text-[11px] text-red-500">{passwordErrors.current}</p>}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                {newPassword && (
                  <span className={`text-[10px] font-bold ${passStrength.color}`}>
                    Strength: {passStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  ref={newPassRef}
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordTouched.new) {
                      const check = validatePassword(e.target.value);
                      setPasswordErrors(p => ({ ...p, new: check.message }));
                    }
                  }}
                  onBlur={() => {
                    setPasswordTouched(p => ({ ...p, new: true }));
                    const check = validatePassword(newPassword);
                    setPasswordErrors(p => ({ ...p, new: check.message }));
                  }}
                  placeholder="Min 8 chars with letter & number"
                  className={`w-full px-3.5 pr-9 py-2 rounded-xl border text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    passwordErrors.new
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : passwordTouched.new && validatePassword(newPassword).isValid
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-indigo-500'
                  }`}
                />
                {passwordTouched.new && validatePassword(newPassword).isValid && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                )}
              </div>
              {passwordErrors.new && <p className="text-[11px] text-red-500">{passwordErrors.new}</p>}
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <div className="relative">
                <input
                  ref={confirmPassRef}
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordTouched.confirm) {
                      setPasswordErrors(p => ({ ...p, confirm: e.target.value === newPassword ? '' : 'New passwords do not match' }));
                    }
                  }}
                  onBlur={() => {
                    setPasswordTouched(p => ({ ...p, confirm: true }));
                    setPasswordErrors(p => ({ ...p, confirm: confirmPassword === newPassword ? '' : 'New passwords do not match' }));
                  }}
                  placeholder="Repeat new password"
                  className={`w-full px-3.5 pr-9 py-2 rounded-xl border text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    passwordErrors.confirm
                      ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 focus:ring-red-500'
                      : passwordTouched.confirm && confirmPassword && confirmPassword === newPassword
                      ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 focus:ring-emerald-500'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-indigo-500'
                  }`}
                />
                {passwordTouched.confirm && confirmPassword && confirmPassword === newPassword && (
                  <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-2.5" />
                )}
              </div>
              {passwordErrors.confirm && <p className="text-[11px] text-red-500">{passwordErrors.confirm}</p>}
            </div>

            <button
              type="submit"
              disabled={savingPassword || !isPasswordValid()}
              className="w-full py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>

      {/* Quick Links Card */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/bookings"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:border-indigo-400 transition-colors flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">My Bookings</h4>
            <p className="text-[11px] text-slate-500">View passes & history</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-3 text-left text-rose-600"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Sign Out</h4>
            <p className="text-[11px] text-slate-400">Exit active session</p>
          </div>
        </button>
      </div>

    </div>
  );
}
