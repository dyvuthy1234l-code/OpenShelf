import { useState, useRef, useEffect } from 'react';
import { 
  UserCircle, Mail, Phone, ShieldCheck, KeyRound, 
  Eye, EyeOff, Upload, Trash2, CheckCircle2, AlertCircle, 
  Bell, Lock, X, Save 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { memberService } from '../../services/memberService';

export default function AdminProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Messages
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Form States
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState({
    library_approvals_app: true,
    library_approvals_email: true,
    subscription_alerts_app: true,
    subscription_alerts_email: true,
    payment_alerts_app: true,
    payment_alerts_email: true,
    system_alerts_app: true,
    system_alerts_email: true,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // 1. Avatar File Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setProfileMessage({ type: 'error', text: 'Please select a JPG, PNG, or WEBP image.' });
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'Image file size must be less than 5MB.' });
      e.target.value = '';
      return;
    }

    try {
      setAvatarLoading(true);
      setProfileMessage({ type: '', text: '' });
      const formData = new FormData();
      formData.append('avatar', file);
      if (profileForm.name || user?.name) {
        formData.append('name', profileForm.name || user?.name);
      }

      const res = await memberService.updateProfileWithAvatar(formData);
      if (res.user || res.data) {
        updateUser(res.user || res.data);
        setProfileMessage({ type: 'success', text: 'Profile picture updated successfully.' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3500);
      }
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err?.response?.data?.message
          || err?.response?.data?.errors?.avatar?.[0]
          || 'Failed to upload profile picture.',
      });
    } finally {
      setAvatarLoading(false);
      e.target.value = '';
    }
  };

  // 2. Avatar Remove Handler
  const handleRemoveAvatar = async () => {
    try {
      setAvatarLoading(true);
      setProfileMessage({ type: '', text: '' });
      const res = await memberService.removeAvatar();
      if (res.user || res.data) {
        updateUser(res.user || res.data);
        setProfileMessage({ type: 'success', text: 'Profile picture removed.' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3500);
      }
    } catch {
      setProfileMessage({ type: 'error', text: 'Failed to remove profile picture.' });
    } finally {
      setAvatarLoading(false);
    }
  };

  // 3. Save Personal Information
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileMessage({ type: 'error', text: 'Full Name and Email Address are required.' });
      return;
    }

    try {
      setProfileLoading(true);
      setProfileMessage({ type: '', text: '' });
      const res = await memberService.updateProfile(profileForm);
      if (res.user || res.data) {
        updateUser(res.user || res.data);
        setProfileMessage({ type: 'success', text: 'Personal information saved successfully.' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3500);
      }
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update personal information.',
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // 4. Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.current_password || !passwordForm.new_password) {
      setPasswordMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setPasswordMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordMessage({ type: '', text: '' });
      await memberService.changePassword(passwordForm);
      setPasswordMessage({ type: 'success', text: 'Account password updated successfully.' });
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to change password. Please check your current password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto lg:overflow-hidden h-full pr-1 pb-1 font-sans">
      {/* 1. PAGE HEADER */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 border border-blue-500/20">
              ACCOUNT SETTINGS
            </span>
            <span className="text-slate-300 font-normal text-xs">•</span>
            <span className="text-xs font-bold text-slate-500">Administrator Profile</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight">My Profile</h1>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Manage your administrator account, security, and account information.
          </p>
        </div>
      </div>

      {/* 2. TWO-COLUMN BALANCED LAYOUT (FIT SINGLE SCREEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: PROFILE OVERVIEW & SECURITY SUMMARY (~35%) */}
        <div className="lg:col-span-4 space-y-3 flex flex-col justify-start min-h-0 overflow-y-auto lg:overflow-visible">
          {/* Profile Hero Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3 text-center">
            {/* Avatar Section (80-90px) */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 mx-auto">
              <div className="w-full h-full rounded-full bg-amber-500 text-slate-950 font-black text-2xl sm:text-3xl flex items-center justify-center overflow-hidden border-3 border-white shadow-sm">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name ? user.name[0].toUpperCase() : 'A'
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Avatar Action Buttons */}
            <div className="flex items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={avatarLoading}
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
              >
                <Upload className="w-3 h-3" />
                <span>{avatarLoading ? 'Uploading...' : 'Change Photo'}</span>
              </button>

              {user?.avatar_url && (
                <button
                  type="button"
                  disabled={avatarLoading}
                  onClick={handleRemoveAvatar}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Name, Email, & Badges */}
            <div className="space-y-0.5">
              <h2 className="text-base font-black text-slate-900 leading-snug">{user?.name || 'Administrator'}</h2>
              <p className="text-[11px] text-slate-500 font-medium">{user?.email || 'N/A'}</p>
              
              <div className="flex items-center justify-center gap-1.5 pt-1.5">
                <span className="inline-block text-[8px] uppercase font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  SYSTEM ADMIN
                </span>
                <span className="inline-block text-[8px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ACTIVE
                </span>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-left">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium text-[11px]">Role:</span>
                <span className="font-bold text-slate-900 uppercase text-[10px]">{user?.role || 'ADMIN'}</span>
              </div>
              <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium text-[11px]">Status:</span>
                <span className="font-bold text-emerald-700 uppercase text-[10px]">{user?.status || 'ACTIVE'}</span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-500 font-medium text-[11px]">Account Created:</span>
                <span className="font-bold text-slate-900 text-[11px]">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security Summary Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">Account Security</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Protected
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Password Status:</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Secured
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Authentication:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PERSONAL INFO & SECURITY FORMS (~65%) */}
        <div className="lg:col-span-8 space-y-2.5 min-h-0 overflow-y-auto lg:overflow-hidden pr-0.5 flex flex-col justify-start">
          {/* Card 1: Personal Information */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Personal Information</h3>
                <p className="text-[11px] text-slate-500 font-medium">Update your account name, email, and phone number.</p>
              </div>
              <div className="w-7.5 h-7.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                <UserCircle className="w-4 h-4" />
              </div>
            </div>

            {profileMessage.text && (
              <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                profileMessage.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              }`}>
                {profileMessage.type === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-0.5 sm:col-span-2">
                  <label className="font-extrabold text-slate-800 text-[11px]">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    placeholder="Administrator Name"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="font-extrabold text-slate-800 text-[11px]">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="admin@openshelf.com"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="font-extrabold text-slate-800 text-[11px]">Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+855 12 345 678"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProfileForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{profileLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Change Password */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Change Password</h3>
                <p className="text-[11px] text-slate-500 font-medium">Ensure your administrative account uses a strong password.</p>
              </div>
              <div className="w-7.5 h-7.5 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>

            {passwordMessage.text && (
              <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                passwordMessage.type === 'error'
                  ? 'bg-rose-50 border border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              }`}>
                {passwordMessage.type === 'error' ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-2.5 text-xs">
              <div className="space-y-2">
                {/* Current Password */}
                <div className="space-y-0.5">
                  <label className="font-extrabold text-slate-800 text-[11px]">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      required
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full h-9 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPasswords.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-0.5">
                    <label className="font-extrabold text-slate-800 text-[11px]">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        required
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full h-9 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPasswords.new ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="font-extrabold text-slate-800 text-[11px]">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        required
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                        placeholder="Re-type new password"
                        className="w-full h-9 pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md shadow-slate-900/10 transition-all cursor-pointer"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
