import { useState, useEffect, useCallback } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Clock, BookOpen, 
  Users, CheckCircle2, AlertCircle, RefreshCw, Edit3, Globe, Upload, Image as ImageIcon, X, Navigation,
  Calendar, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import librarianService from '../../services/librarianService';
import LibraryStatusToggle from '../../components/librarian/LibraryStatusToggle';

function format12Hour(time24) {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return '';
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function parse24Hour(timeStr) {
  if (!timeStr) return '08:00';
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return '08:00';
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  return `${String(h).padStart(2, '0')}:${m}`;
}

function parseTimeRange(openingHoursStr) {
  if (!openingHoursStr) return { openTime: '08:00', closeTime: '17:00', workDays: 'Mon - Sat' };

  let workDays = 'Mon - Sat';
  let hoursPart = openingHoursStr;

  if (openingHoursStr.includes(':')) {
    const parts = openingHoursStr.split(':');
    if (isNaN(parseInt(parts[0], 10)) && parts.length >= 2) {
      workDays = parts[0].trim();
      hoursPart = parts.slice(1).join(':').trim();
    }
  }

  const times = hoursPart.match(/\d{1,2}:\d{2}\s*(?:AM|PM)?/gi);
  let openTime = '08:00';
  let closeTime = '17:00';

  if (times && times.length >= 1) openTime = parse24Hour(times[0]);
  if (times && times.length >= 2) closeTime = parse24Hour(times[1]);

  return { openTime, closeTime, workDays };
}

export default function LibraryPage() {
  const { checkAuth } = useAuth();
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [openTime, setOpenTime] = useState('08:00');
  const [closeTime, setCloseTime] = useState('17:00');
  const [workDays, setWorkDays] = useState('Mon - Sat');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    opening_hours: '',
    borrowing_rules: '',
    description: '',
    borrowing_period_days: 14,
    fine_per_day: 0.50,
    max_books_per_member: 3,
    google_maps_url: '',
    latitude: '',
    longitude: '',
    status: 'active',
  });

  const [imageFile, setImageFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [imagePreview, setImagePreview] = useState('');
  const [coverPreview, setCoverPreview] = useState('');

  const fetchMyLibrary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await librarianService.getMyLibrary();
      const myLib = res.data || res.library || null;

      setLibrary(myLib);

      if (myLib) {
        setFormData({
          name: myLib.name || '',
          phone: myLib.phone || '',
          email: myLib.email || '',
          address: myLib.address || '',
          city: myLib.city || '',
          opening_hours: myLib.opening_hours || '',
          borrowing_rules: myLib.borrowing_rules || '',
          description: myLib.description || '',
          borrowing_period_days: myLib.borrowing_period_days ?? 14,
          fine_per_day: myLib.fine_per_day ?? 0.50,
          max_books_per_member: myLib.max_books_per_member ?? 3,
          google_maps_url: myLib.google_maps_url || '',
          latitude: myLib.latitude || '',
          longitude: myLib.longitude || '',
          status: myLib.status || 'active',
        });

        if (myLib.opening_hours) {
          const parsed = parseTimeRange(myLib.opening_hours);
          setOpenTime(parsed.openTime);
          setCloseTime(parsed.closeTime);
          setWorkDays(parsed.workDays);
        }

        setImagePreview(myLib.image_url || myLib.image || '');
        setCoverPreview(myLib.cover_image_url || myLib.cover_image || '');
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.message || 'Failed to load library data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyLibrary();
  }, [fetchMyLibrary]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = (newOpen, newClose, newDays) => {
    setOpenTime(newOpen);
    setCloseTime(newClose);
    setWorkDays(newDays);

    const formattedOpen = format12Hour(newOpen);
    const formattedClose = format12Hour(newClose);

    let summary = '';
    if (newDays) summary += `${newDays}: `;
    if (formattedOpen && formattedClose) {
      summary += `${formattedOpen} - ${formattedClose}`;
    } else if (formattedOpen) {
      summary += `From ${formattedOpen}`;
    } else if (formattedClose) {
      summary += `Until ${formattedClose}`;
    }

    setFormData((prev) => ({ ...prev, opening_hours: summary }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (formData.latitude && (Number(formData.latitude) < -90 || Number(formData.latitude) > 90)) {
        setError('Latitude must be between -90 and 90.');
        setSaving(false);
        return;
      }
      if (formData.longitude && (Number(formData.longitude) < -180 || Number(formData.longitude) > 180)) {
        setError('Longitude must be between -180 and 180.');
        setSaving(false);
        return;
      }

      // Auto-compute clean opening_hours summary from time pickers & workDays
      const formattedOpen = format12Hour(openTime);
      const formattedClose = format12Hour(closeTime);
      let computedHours = '';
      if (workDays) computedHours += `${workDays}: `;
      if (formattedOpen && formattedClose) {
        computedHours += `${formattedOpen} - ${formattedClose}`;
      }

      const updatedFormData = {
        ...formData,
        opening_hours: computedHours || formData.opening_hours,
      };

      const submitData = new FormData();
      Object.entries(updatedFormData).forEach(([key, val]) => {
        if (val !== null && val !== undefined && val !== '') {
          submitData.append(key, val);
        }
      });

      if (imageFile) {
        submitData.append('image', imageFile);
      }
      if (coverFile) {
        submitData.append('cover_image', coverFile);
      }

      if (library) {
        await librarianService.updateLibrary(submitData);
        setSuccessMessage('Library profile & media updated successfully.');
      } else {
        await librarianService.createLibrary(submitData);
        setSuccessMessage('Library created successfully. Welcome to OpenShelf!');
      }

      setEditing(false);
      setImageFile(null);
      setCoverFile(null);
      await fetchMyLibrary();
      await checkAuth();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save library profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 animate-pulse">
        <div className="h-64 bg-white rounded-3xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2 lg:overflow-hidden overflow-y-auto h-full w-full max-w-7xl mx-auto">
      {/* Success Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold text-xs cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchMyLibrary} className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!library || editing ? (
        /* BALANCED 1-SCREEN EDIT LIBRARY FORM */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs flex-1 flex flex-col justify-between min-h-0 h-full">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                {library ? 'Edit Library Profile & Media' : 'Configure Your Library'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Update your branch info, lending parameters, logo, and cover image</p>
            </div>
            {library && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-3 pt-3 min-h-0">
            {/* Top Row: Media Uploads Banner Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shrink-0">
              {/* Profile Image Input */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-xl bg-amber-500 border border-amber-300 overflow-hidden shrink-0 flex items-center justify-center text-slate-950 font-bold text-lg shadow-xs">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-950" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Library Logo</span>
                    <span className="text-[10px] text-slate-400 block">PNG, JPG or WEBP (Max 5MB)</span>
                  </div>
                </div>
                <label className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-amber-500 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>Upload Logo</span>
                  <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                </label>
              </div>

              {/* Cover Image Input */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-13 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-amber-400/60" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Cover Banner Photo</span>
                    <span className="text-[10px] text-slate-400 block">Wide background photo</span>
                  </div>
                </div>
                <label className="px-3.5 py-1.5 bg-white border border-slate-300 hover:border-amber-500 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5 text-amber-600" />
                  <span>Upload Cover</span>
                  <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="space-y-3 text-xs flex-1 flex flex-col justify-between min-h-0">
              {/* Row 1: Core Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Library Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. OpenShelf Central Library"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Phone Contact <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +855 23 123 456"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Contact</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. library@example.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Address / Location <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. #123 Preah Monivong Blvd, Phnom Penh"
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 2: Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Borrow Period (Days)</label>
                  <input
                    type="number"
                    name="borrowing_period_days"
                    value={formData.borrowing_period_days}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Fine Per Day ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="fine_per_day"
                    value={formData.fine_per_day}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Max Books / Member</label>
                  <input
                    type="number"
                    name="max_books_per_member"
                    value={formData.max_books_per_member}
                    onChange={handleChange}
                    required
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Library Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Structured Opening & Closing Time Pickers + Google Maps URL */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-end">
                  {/* Opening Time Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Opening Time</span>
                    </label>
                    <input
                      type="time"
                      value={openTime}
                      onChange={(e) => handleTimeChange(e.target.value, closeTime, workDays)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Closing Time Picker */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Closing Time</span>
                    </label>
                    <input
                      type="time"
                      value={closeTime}
                      onChange={(e) => handleTimeChange(openTime, e.target.value, workDays)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Operating Days */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Operating Days</label>
                    <input
                      type="text"
                      value={workDays}
                      onChange={(e) => handleTimeChange(openTime, closeTime, e.target.value)}
                      placeholder="e.g. Mon - Sat"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>

                  {/* Province / City (25 Cambodian Provinces Selector) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Province / City (ខេត្ត/ក្រុង) <span className="text-rose-500">*</span></span>
                    </label>
                    <select
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-amber-50/40 border border-amber-300 font-bold text-slate-900 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
                    >
                      <option value="">-- Select Province/City --</option>
                      <option value="Phnom Penh">Phnom Penh (ភ្នំពេញ)</option>
                      <option value="Banteay Meanchey">Banteay Meanchey (បន្ទាយមានជ័យ)</option>
                      <option value="Battambang">Battambang (បាត់ដំបង)</option>
                      <option value="Kampong Cham">Kampong Cham (កំពង់ចាម)</option>
                      <option value="Kampong Chhnang">Kampong Chhnang (កំពង់ឆ្នាំង)</option>
                      <option value="Kampong Speu">Kampong Speu (កំពង់ស្ពឺ)</option>
                      <option value="Kampong Thom">Kampong Thom (កំពង់ធំ)</option>
                      <option value="Kampot">Kampot (កំពត)</option>
                      <option value="Kandal">Kandal (កណ្តាល)</option>
                      <option value="Kep">Kep (កែប)</option>
                      <option value="Koh Kong">Koh Kong (កោះកុង)</option>
                      <option value="Kratie">Kratie (ក្រចេះ)</option>
                      <option value="Mondulkiri">Mondulkiri (មណ្ឌលគិរី)</option>
                      <option value="Oddar Meanchey">Oddar Meanchey (ឧត្តរមានជ័យ)</option>
                      <option value="Pailin">Pailin (ប៉ៃលិន)</option>
                      <option value="Preah Sihanouk">Preah Sihanouk (ព្រះសីហនុ)</option>
                      <option value="Preah Vihear">Preah Vihear (ព្រះវិហារ)</option>
                      <option value="Prey Veng">Prey Veng (ព្រៃវែង)</option>
                      <option value="Pursat">Pursat (ពោធិ៍សាត់)</option>
                      <option value="Ratanakiri">Ratanakiri (រតនគិរី)</option>
                      <option value="Siem Reap">Siem Reap (សៀមរាប)</option>
                      <option value="Stung Treng">Stung Treng (ស្ទឹងត្រែង)</option>
                      <option value="Svay Rieng">Svay Rieng (ស្វាយរៀង)</option>
                      <option value="Takeo">Takeo (តាកែវ)</option>
                      <option value="Tboung Khmum">Tboung Khmum (ត្បូងឃ្មុំ)</option>
                    </select>
                  </div>
                </div>

                {/* Google Maps URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Google Maps URL</label>
                  <input
                    type="url"
                    name="google_maps_url"
                    value={formData.google_maps_url}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Row 4: Expandable Descriptions to fill vertical space smoothly */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 flex-1 min-h-0">
                <div className="space-y-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-700">About Library</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Brief overview of your library branch..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 flex-1 min-h-[90px]"
                  />
                </div>
                <div className="space-y-1 flex flex-col">
                  <label className="text-xs font-bold text-slate-700">Borrowing Rules</label>
                  <textarea
                    name="borrowing_rules"
                    value={formData.borrowing_rules}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Rules for borrowing books..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 flex-1 min-h-[90px]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 shrink-0">
              {library && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>{library ? 'Save Library Profile' : 'Create Library'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STRICT 1-SCREEN READ-ONLY PROFILE VIEW */
        <div className="flex-1 flex flex-col justify-between min-h-0 space-y-2">
          <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs flex-1 flex flex-col justify-between min-h-0">
            {/* 1. COVER IMAGE BANNER WITH FLOATING EDIT BUTTON */}
            <div className="relative h-36 sm:h-44 md:h-48 w-full bg-slate-950 overflow-hidden shrink-0">
              {library.cover_image_url || library.cover_image ? (
                <img
                  src={library.cover_image_url || library.cover_image}
                  alt={`${library.name} Cover`}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/60 flex flex-col items-center justify-center p-4">
                  <Building2 className="w-10 h-10 text-amber-500/30 mb-1" />
                  <span className="text-xs font-bold text-amber-200/60">OpenShelf Library Partner</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Floating Edit Button Top Right */}
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all border border-amber-300/60 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-950" />
                  <span>Edit Info & Images</span>
                </button>
              </div>
            </div>

            {/* 2. CENTERED LOGO AVATAR & CENTERED IDENTITY HEADER */}
            <div className="px-5 pb-2 pt-0 relative space-y-1.5 text-center shrink-0">
              {/* Overlapping Centered Profile Logo Avatar */}
              <div className="flex justify-center -mt-10 sm:-mt-12 relative z-10">
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-amber-500 border-4 border-amber-200/90 shadow-xl overflow-hidden shrink-0 flex items-center justify-center text-slate-950 font-black text-2xl">
                  {library.image_url || library.image ? (
                    <img
                      src={library.image_url || library.image}
                      alt={library.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-9 h-9 text-slate-950" />
                  )}
                </div>
              </div>

              {/* Centered Title & Metadata Subtitle */}
              <div className="space-y-0">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {library.name || 'My Library'}
                </h2>

                <p className="text-xs text-slate-500 font-bold flex items-center justify-center gap-1.5 flex-wrap">
                  <span>Managed by: <strong className="text-slate-800 font-extrabold">{library.owner?.name || 'Librarian'}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Library ID: <strong className="text-slate-800 font-mono font-bold">#{library.id || '271'}</strong></span>
                </p>
              </div>

              {/* Interactive Open / Close Status Toggle */}
              <div className="flex justify-center pt-0.5">
                <LibraryStatusToggle
                  library={library}
                  onStatusChange={(updatedLib) => setLibrary(updatedLib)}
                  compact={true}
                />
              </div>
            </div>

            {/* 3. 4 KPI STAT CARDS ROW */}
            <div className="px-5 pb-2 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {/* Catalogued Books */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">CATALOGUED BOOKS</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">{library.books_count ?? library.books?.length ?? 0}</span>
                  </div>
                </div>

                {/* Borrow Period */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">BORROW PERIOD</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">{library.borrowing_period_days ?? 14} Days</span>
                  </div>
                </div>

                {/* Daily Overdue Fine */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">DAILY OVERDUE FINE</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">${parseFloat(library.fine_per_day || 0.50).toFixed(2)}</span>
                  </div>
                </div>

                {/* Max Member Limit */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/90 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">MAX MEMBER LIMIT</span>
                    <span className="text-base sm:text-lg font-black text-slate-900">{library.max_books_per_member ?? 3} Books</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. 2-COLUMN DETAILS GRID */}
            <div className="px-5 pb-4 pt-1 flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs h-full">
                {/* Left Card: Branch Contacts & Location */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-black text-slate-800 tracking-wider block border-b border-slate-200/60 pb-1 shrink-0">BRANCH CONTACTS & LOCATION</span>
                  <div className="space-y-1.5 flex-1 justify-center flex flex-col">
                    <p className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Phone: <strong className="text-slate-900">{library.phone || 'Not provided'}</strong></span>
                    </p>
                    {library.email && (
                      <p className="flex items-center gap-2 text-slate-700 font-bold text-xs truncate">
                        <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">Email: {library.email}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Province: <strong className="text-slate-900">{library.city || 'Phnom Penh'}</strong></span>
                    </p>
                    {library.address && (
                      <p className="flex items-start gap-2 text-slate-700 font-bold text-xs">
                        <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                        <span>Address: <span className="font-semibold text-slate-800">{library.address}</span></span>
                      </p>
                    )}
                    <p className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Hours: <span className="font-semibold text-slate-800">{library.opening_hours && !library.opening_hours.includes('Mollitia') ? library.opening_hours : 'Mon - Sat: 08:00 AM - 05:00 PM'}</span></span>
                    </p>
                    {library.google_maps_url ? (
                      <a href={library.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-700 font-bold text-xs hover:underline pt-0.5">
                        <Navigation className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>View on Google Maps</span>
                      </a>
                    ) : (
                      <p className="flex items-center gap-2 text-slate-400 font-medium text-xs pt-0.5">
                        <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>No Google Maps URL set</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Card: Library Details & Rules */}
                <div className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-3.5 space-y-2 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-black text-slate-800 tracking-wider block border-b border-slate-200/60 pb-1 shrink-0">Library Details & Rules</span>
                  
                  <div className="space-y-0.5 flex-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">ABOUT LIBRARY</span>
                    <p className="text-slate-700 font-medium text-xs leading-relaxed line-clamp-2">
                      {library.description || 'No detailed description provided for this library branch.'}
                    </p>
                  </div>

                  <div className="space-y-0.5 pt-1 border-t border-slate-200/60 flex-1">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">BORROWING RULES</span>
                    <p className="text-slate-700 font-medium text-xs leading-relaxed line-clamp-2 whitespace-pre-wrap">
                      {library.borrowing_rules || 'No custom borrowing rules specified.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
