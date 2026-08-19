import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import memberService from '../../services/memberService';
import PageHeader from '../../components/librarian/common/PageHeader';
import { 
  User, Mail, Phone, Shield, Camera, Lock, 
  Save, RefreshCw, CheckCircle2, AlertCircle, Trash2,
  CreditCard, Calendar, Activity, Key
} from 'lucide-react';

const LibrarianProfile = () => {
  const { user, subscription, updateUser } = useAuth();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  
  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Password state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Update local state if user context changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
      setAvatarPreview(user.avatar_url || '');
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('phone', profileData.phone);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await memberService.updateProfileWithAvatar(formData);
      
      const updatedUser = response.user || response.data?.user || response.data;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      setProfileSuccess('Profile updated successfully');
      setAvatarFile(null);
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.avatar_url) return;
    
    setAvatarLoading(true);
    try {
      const response = await memberService.removeAvatar();
      
      const updatedUser = response.user || response.data?.user || response.data;
      if (updatedUser) {
        updateUser(updatedUser);
      }
      
      setAvatarPreview('');
      setAvatarFile(null);
    } catch (error) {
      console.error('Error removing avatar:', error);
      setProfileError('Failed to remove avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await memberService.changePassword(passwordData);
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'L';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3 overflow-y-auto lg:overflow-hidden h-full pr-1 pb-1 font-sans">
      <PageHeader 
        eyebrow="Account Settings" 
        title="My Profile" 
        description="Manage your librarian account credentials, security settings, and active membership."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        
        {/* Left Column: Avatar & Subscription Overview (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-3 min-h-0">
          {/* Avatar & Identity Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col items-center shrink-0">
            <div className="relative mb-3 group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-3 border-amber-500/20 shadow-xs relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-slate-500">{getInitials(user?.name)}</span>
                )}
                
                <button 
                  onClick={handleAvatarClick}
                  className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white mb-0.5" />
                  <span className="text-[9px] text-white font-bold uppercase tracking-wider">Change</span>
                </button>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange}
              />
            </div>

            <div className="text-center mb-3">
              <h3 className="text-base font-black text-slate-900 leading-tight">{user?.name || 'Librarian'}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{user?.email}</p>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-600" />
                LIBRARIAN
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border ${
                user?.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                <Activity className="w-3 h-3" />
                {user?.status === 'active' ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            {(avatarPreview && avatarPreview !== user?.avatar_url) ? (
              <div className="flex gap-2 w-full">
                <button 
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(user?.avatar_url || '');
                  }}
                  className="w-full px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (user?.avatar_url && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={avatarLoading}
                className="text-xs text-rose-600 font-bold hover:text-rose-700 flex items-center gap-1 px-3 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                {avatarLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                <span>Remove Photo</span>
              </button>
            ))}
          </div>

          {/* Subscription Info Card */}
          <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl p-3.5 shadow-md border border-blue-800/70 relative overflow-hidden shrink-0 space-y-2.5">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-blue-800/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-widest text-blue-300/80 block">Workspace Pass</span>
                  <h3 className="text-xs font-black text-white">Subscription Status</h3>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {subscription?.status || 'Active'}
              </span>
            </div>
            
            <div className="space-y-1.5 pt-0.5">
              <div>
                <p className="text-[10px] uppercase font-bold text-blue-200/80 mb-0.5">Current Active Plan</p>
                <p className="text-xs sm:text-sm font-black text-amber-400 leading-tight">
                  {subscription?.plan?.name || subscription?.plan_name || 'Standard Plan'}
                </p>
              </div>

              {subscription?.end_date && (
                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-blue-800/60">
                  <span className="text-[10px] text-blue-200/80 font-bold">Expiration Date</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    {new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile & Security Forms (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3 min-h-0 lg:overflow-hidden">
          
          {/* Profile Details Form */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Personal Information</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Update your librarian name and contact details.</p>
                </div>
              </div>
            </div>

            {profileSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Address (Read Only)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-9 pr-3 h-9 bg-slate-100 border border-slate-200 text-slate-500 font-semibold rounded-xl cursor-not-allowed text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-700 block">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      placeholder="Enter contact phone number..."
                      className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex items-center gap-1.5 px-4 h-9 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Security & Password</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Update your authentication password to secure your account.</p>
                </div>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Current Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password..."
                    className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      placeholder="Minimum 8 characters..."
                      className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      name="new_password_confirmation"
                      value={passwordData.new_password_confirmation}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password..."
                      className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center gap-1.5 px-4 h-9 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LibrarianProfile;
