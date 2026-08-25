import { useState } from 'react';
import { 
  Building2, MapPin, Phone, Mail, Clock, Globe, 
  FileText, Upload, X, Check, RefreshCw, AlertCircle 
} from 'lucide-react';

export default function LibraryForm({ initialData = null, onSave, onCancel }) {
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    opening_hours: initialData?.opening_hours || '',
    borrowing_rules: initialData?.borrowing_rules || '',
    google_maps_url: initialData?.google_maps_url || '',
    latitude: initialData?.latitude || '',
    longitude: initialData?.longitude || '',
  });

  // Image File States & Previews
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData?.image_url || null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialData?.cover_image_url || null);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'File format must be JPG, PNG, or WEBP.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Logo image size must be 5MB or less.' }));
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, image: null }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, cover_image: 'File format must be JPG, PNG, or WEBP.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, cover_image: 'Cover image size must be 5MB or less.' }));
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, cover_image: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setGeneralError('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (logoFile) {
        data.append('image', logoFile);
      }
      if (coverFile) {
        data.append('cover_image', coverFile);
      }

      await onSave(data);
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setGeneralError(err.response?.data?.message || 'Failed to save library profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="os-panel p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isEditing ? 'Edit Library Profile' : 'Configure Your Library Profile'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Provide details about your physical library, location, contact, and operating hours.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {generalError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* 1. IMAGES SECTION */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-600">
          Library Images
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Banner Image */}
          <div className="space-y-2">
            <label className="os-label">Library Cover / Banner</label>
            <div className="relative h-36 bg-slate-100 border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all group">
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-white/90 text-slate-900 font-bold text-xs rounded-xl cursor-pointer shadow-xs">
                      Change Cover
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-gold-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 block">Upload Cover Image</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, WEBP up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>
            {errors.cover_image && (
              <p className="text-[11px] font-semibold text-rose-600">{Array.isArray(errors.cover_image) ? errors.cover_image[0] : errors.cover_image}</p>
            )}
          </div>

          {/* Logo / Avatar Image */}
          <div className="space-y-2">
            <label className="os-label">Library Logo / Avatar</label>
            <div className="relative h-36 bg-slate-100 border-2 border-dashed border-slate-300 hover:border-gold-500 rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all group">
              {logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo Preview" className="w-24 h-24 object-cover rounded-2xl shadow-xs" />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-white/90 text-slate-900 font-bold text-xs rounded-xl cursor-pointer shadow-xs">
                      Change Logo
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer text-center p-4">
                  <Building2 className="w-6 h-6 text-slate-400 mx-auto mb-1 group-hover:text-gold-600 transition-colors" />
                  <span className="text-xs font-bold text-slate-600 block">Upload Logo Image</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">JPG, PNG, WEBP up to 5MB</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
              )}
            </div>
            {errors.image && (
              <p className="text-[11px] font-semibold text-rose-600">{Array.isArray(errors.image) ? errors.image[0] : errors.image}</p>
            )}
          </div>
        </div>
      </div>

      {/* 2. BASIC INFORMATION */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-600">
          Basic Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="os-label">
              Library Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. OpenShelf Community Library"
              required
              className="os-input"
            />
            {errors.name && <p className="text-[11px] font-semibold text-rose-600">{errors.name[0]}</p>}
          </div>

          <div className="space-y-1">
            <label className="os-label">Opening Hours</label>
            <input
              type="text"
              name="opening_hours"
              value={formData.opening_hours}
              onChange={handleChange}
              placeholder="e.g. Mon–Sat: 8:00 AM – 5:00 PM"
              className="os-input"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="os-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Provide a brief summary about your library's history, collections, and mission..."
            className="os-input"
          />
        </div>
      </div>

      {/* 3. LOCATION & CONTACT */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-600">
          Location & Contact
        </h3>

        <div className="space-y-1">
          <label className="os-label">
            Address / Location <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="e.g. Street 2004, Phnom Penh, Cambodia"
            required
            className="os-input"
          />
          {errors.address && <p className="text-[11px] font-semibold text-rose-600">{errors.address[0]}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="os-label">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +855 12 345 678"
              className="os-input"
            />
          </div>

          <div className="space-y-1">
            <label className="os-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. contact@openshelflibrary.com"
              className="os-input"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="os-label">Google Maps URL</label>
          <input
            type="url"
            name="google_maps_url"
            value={formData.google_maps_url}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
            className="os-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="os-label">Latitude</label>
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="e.g. 11.5564"
              className="os-input"
            />
          </div>

          <div className="space-y-1">
            <label className="os-label">Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g. 104.9282"
              className="os-input"
            />
          </div>
        </div>
      </div>

      {/* 4. BORROWING POLICY */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-gold-600">
          Borrowing Guidelines
        </h3>

        <div className="space-y-1">
          <label className="os-label">Borrowing Rules / Policies</label>
          <textarea
            name="borrowing_rules"
            value={formData.borrowing_rules}
            onChange={handleChange}
            rows={3}
            placeholder="Detail borrowing policies, loan pickup guidelines, return rules, and fine rates..."
            className="os-input"
          />
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="os-btn-secondary"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className="os-btn-gold"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Saving Library...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Update Library' : 'Create Library'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
