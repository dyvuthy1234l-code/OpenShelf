import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, CheckCircle2, AlertCircle, 
  Camera, Trash2, X, RefreshCw, Upload, Sparkles 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';

export default function MemberProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security'

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  // Avatar State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [removingAvatar, setRemovingAvatar] = useState(false);

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [avatarErrored, setAvatarErrored] = useState(false);

  useEffect(() => {
    setAvatarErrored(false);
  }, [user?.avatar_url]);

  // Handle File Selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileError('');
    setProfileSuccess('');

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setProfileError('Invalid file type. Please select a JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image file is too large. Maximum allowed size is 5MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setShowPreviewModal(true);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;

    try {
      setUploadingAvatar(true);
      setProfileError('');
      setProfileSuccess('');

      const formData = new FormData();
      formData.append('avatar', selectedFile);
      formData.append('name', profileForm.name || user?.name || '');
      if (profileForm.phone) formData.append('phone', profileForm.phone);

      const res = await memberService.updateProfileWithAvatar(formData);
      const updatedUser = res.user || res.data;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setProfileSuccess('Profile picture updated successfully.');
      setShowPreviewModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.avatar?.[0] || 'Failed to upload profile picture.';
      setProfileError(msg);
      setShowPreviewModal(false);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setRemovingAvatar(true);
      setProfileError('');
      setProfileSuccess('');

      const res = await memberService.removeAvatar();
      const updatedUser = res.user || res.data;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setProfileSuccess('Profile picture removed successfully.');
      setShowRemoveModal(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to remove profile picture.');
      setShowRemoveModal(false);
    } finally {
      setRemovingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      setProfileError('');
      setProfileSuccess('');
      const res = await memberService.updateProfile(profileForm);
      if (res.user || res.data) {
        const updated = res.user || res.data;
        updateUser(updated);
      }
      setProfileSuccess('Profile details updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.password_confirmation) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setUpdatingPassword(true);
      setPasswordError('');
      setPasswordSuccess('');
      await memberService.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.password,
        new_password_confirmation: passwordForm.password_confirmation,
      });
      setPasswordSuccess('Password changed successfully.');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 min-h-screen lg:min-h-0 lg:h-[calc(100vh-70px)] flex flex-col justify-between overflow-y-auto lg:overflow-hidden pb-16 lg:pb-0">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-200/80 shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-gold-600 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACCOUNT SETTINGS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">Member Profile</h1>
        </div>

        {/* Tab Switcher Pills */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-navy-950 shadow-xs border border-slate-200/90'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-gold-600" />
            <span>Personal Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-navy-950 shadow-xs border border-slate-200/90'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-gold-600" />
            <span>Security & Password</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Avatar Card + Right Tabbed Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1 min-h-0 items-stretch overflow-visible lg:overflow-hidden">
        
        {/* Left Column: Avatar & Identity Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col items-center justify-between text-center relative overflow-hidden">
          {/* Top Decorative Ambient Gold Backdrop */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-amber-500/15 via-gold-500/25 to-amber-500/15 pointer-events-none" />

          <div className="relative z-10 space-y-3.5 w-full flex flex-col items-center pt-2">
            {/* Avatar Circle with Camera Overlay */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-full bg-gold-500 text-navy-950 font-black text-4xl flex items-center justify-center shadow-xl shadow-amber-500/20 overflow-hidden border-4 border-white ring-4 ring-gold-500/30">
                {user?.avatar_url && !avatarErrored ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarErrored(true)}
                  />
                ) : (
                  <span>{user?.name ? user.name[0].toUpperCase() : 'M'}</span>
                )}
              </div>

              {/* Camera Upload Button Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Profile Picture"
                aria-label="Upload profile picture"
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-navy-900 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-gold-500 hover:text-navy-950 transition-all cursor-pointer group-hover:scale-105"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* Identity Text Info */}
            <div className="space-y-1 w-full px-2">
              <h2 className="text-lg font-black text-navy-950 truncate">{user?.name || 'Member Name'}</h2>
              <p className="text-xs text-slate-500 font-semibold truncate">{user?.email}</p>
            </div>

            {/* Role & Status Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="os-badge-info uppercase tracking-wider text-[10px] font-extrabold">
                Role: {user?.role || 'member'}
              </span>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold capitalize ${
                (user?.status || 'active') === 'active'
                  ? 'os-badge-success'
                  : 'os-badge-warning'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  (user?.status || 'active') === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gold-500'
                }`} />
                Status: {user?.status || 'active'}
              </span>
            </div>
          </div>

          {/* Remove Photo Action */}
          {user?.avatar_url && (
            <div className="w-full pt-4 border-t border-slate-100 mt-3">
              <button
                type="button"
                onClick={() => setShowRemoveModal(true)}
                className="os-btn-danger w-full justify-center min-h-9 text-xs py-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Form Container */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div
                key="details-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-navy-950 flex items-center gap-2">
                      <User className="w-4 h-4 text-gold-600" />
                      Personal Information
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">Keep your details up to date</span>
                  </div>

                  {profileSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200/70 text-emerald-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="bg-rose-50 border border-rose-200/70 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label htmlFor="member-name" className="os-label">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            id="member-name"
                            required
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="os-input pl-10"
                          />
                        </div>
                      </div>

                      {/* Email Address (Read-only) */}
                      <div className="space-y-1.5">
                        <label htmlFor="member-email" className="os-label">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="email"
                            id="member-email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full h-11 rounded-xl border border-brand-border bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-500 font-semibold cursor-not-allowed focus:outline-none"
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Email changes are managed by OpenShelf admin.</p>
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5 max-w-sm">
                      <label htmlFor="member-phone" className="os-label">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          id="member-phone"
                          placeholder="012 345 678"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="os-input pl-10"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={updatingProfile}
                    className="os-btn-primary px-6 py-2 text-xs font-black shadow-sm"
                  >
                    {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="security-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 flex-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-navy-950 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gold-600" />
                      Security & Password
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400">Ensure your account remains safe</span>
                  </div>

                  {passwordSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200/70 text-emerald-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="bg-rose-50 border border-rose-200/70 text-rose-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-1.5 max-w-md">
                      <label htmlFor="member-current-password" className="os-label">Current Password</label>
                      <input
                        type="password"
                        id="member-current-password"
                        required
                        placeholder="••••••••"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        className="os-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* New Password */}
                      <div className="space-y-1.5">
                        <label htmlFor="member-new-password" className="os-label">New Password</label>
                        <input
                          type="password"
                          id="member-new-password"
                          required
                          placeholder="••••••••"
                          value={passwordForm.password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                          className="os-input"
                        />
                      </div>

                      {/* Confirm New Password */}
                      <div className="space-y-1.5">
                        <label htmlFor="member-confirm-password" className="os-label">Confirm New Password</label>
                        <input
                          type="password"
                          id="member-confirm-password"
                          required
                          placeholder="••••••••"
                          value={passwordForm.password_confirmation}
                          onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                          className="os-input"
                        />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
                  <button
                    type="submit"
                    form="password-form"
                    disabled={updatingPassword}
                    className="os-btn-primary px-6 py-2 text-xs font-black shadow-sm"
                  >
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* AVATAR PREVIEW MODAL */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto os-panel p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-navy-900 text-base">Preview Profile Photo</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  aria-label="Close photo preview"
                  className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewUrl && (
                <div className="w-36 h-36 rounded-full bg-slate-100 mx-auto overflow-hidden border-4 border-white shadow-xl relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs text-slate-500 font-semibold">
                Confirm your new profile picture upload for your OpenShelf account.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={uploadingAvatar}
                  className="os-btn-secondary w-full sm:w-auto text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={uploadingAvatar}
                  className="os-btn-gold text-xs"
                >
                  {uploadingAvatar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Save Photo</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REMOVE AVATAR CONFIRMATION MODAL */}
      <AnimatePresence>
        {showRemoveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto os-panel p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="w-12 h-12 bg-rose-50 border border-rose-200/70 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-navy-900 text-lg">Remove Profile Picture?</h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Your profile will revert to the letter-initial avatar fallback.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRemoveModal(false)}
                  disabled={removingAvatar}
                  className="os-btn-secondary w-full sm:w-auto text-xs"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={removingAvatar}
                  className="os-btn-danger text-xs"
                >
                  {removingAvatar ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <span>Remove Photo</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
