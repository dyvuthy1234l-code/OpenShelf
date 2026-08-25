import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Lock, CheckCircle2, AlertCircle, 
  Camera, Trash2, X, RefreshCw, Upload 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import { PAGE_MOTION_VARIANTS } from '../../constants/motionTokens';

export default function MemberProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

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

    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setProfileError('Invalid file type. Please select a JPG, PNG, or WEBP image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (5MB = 5 * 1024 * 1024)
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
    <motion.div {...PAGE_MOTION_VARIANTS} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-16">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="pb-4 border-b border-brand-border">
        <div className="flex items-center gap-2 text-gold-600 text-xs font-bold uppercase tracking-wider mb-1">
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </div>
        <h1 className="os-section-title">Member Profile</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage your profile picture, personal information, and security</p>
      </div>

      {/* User Card Overview + Avatar Upload */}
      <div className="os-panel p-6 flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar Container with Camera Button */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-full sm:rounded-3xl bg-gold-500 text-navy-950 font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-gold-500/20 overflow-hidden border-4 border-white ring-4 ring-gold-500/40">
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
            onClick={() => fileInputRef.current?.click()}
            title="Upload Profile Picture"
            aria-label="Upload profile picture"
            className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-navy-900 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-gold-500 hover:text-navy-950 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Details & Photo Actions */}
        <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 truncate">{user?.name || 'Member Name'}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>

            {/* Remove Avatar Button if Avatar exists */}
            {user?.avatar_url && (
              <button
                onClick={() => setShowRemoveModal(true)}
                className="os-btn-danger min-h-11 px-3 py-1.5 text-xs shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="os-badge-info uppercase tracking-wider">
              Role: {user?.role || 'member'}
            </span>
            <span className={`inline-flex items-center gap-1 capitalize ${
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
      </div>

      {/* Profile Form */}
      <div className="os-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-gold-600" />
          Personal Details
        </h3>

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

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="space-y-1.5">
              <label htmlFor="member-email" className="os-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  id="member-email"
                  value={user?.email || ''}
                  readOnly
                  aria-describedby="member-email-help"
                  className="w-full h-11 rounded-xl border border-brand-border bg-navy-50 py-2.5 pl-10 pr-4 text-sm text-slate-500 cursor-not-allowed focus:outline-none"
                />
              </div>
              <p id="member-email-help" className="text-[11px] text-slate-500">Email changes are not available from this profile form.</p>
            </div>
          </div>

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

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingProfile}
              className="os-btn-primary w-full sm:w-auto"
            >
              {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security Section */}
      <div className="os-panel p-6 space-y-4">
        <h3 className="text-base font-bold text-navy-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="w-4 h-4 text-gold-600" />
          Change Password
        </h3>

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

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-1.5">
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

          <div className="pt-2">
            <button
              type="submit"
              disabled={updatingPassword}
              className="os-btn-primary w-full sm:w-auto"
            >
              {updatingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
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
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  aria-label="Close photo preview"
                  className="flex h-11 w-11 items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {previewUrl && (
                <div className="w-36 h-36 rounded-full bg-slate-100 mx-auto overflow-hidden border-4 border-white shadow-xl relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs text-slate-500">
                Confirm your new profile picture upload for your OpenShelf account.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={uploadingAvatar}
                  className="os-btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSavePhoto}
                  disabled={uploadingAvatar}
                  className="os-btn-gold"
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
                <p className="text-xs text-slate-500">
                  Your profile will revert to the letter-initial avatar fallback.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  disabled={removingAvatar}
                  className="os-btn-secondary w-full sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  onClick={handleRemovePhoto}
                  disabled={removingAvatar}
                  className="os-btn-danger"
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
