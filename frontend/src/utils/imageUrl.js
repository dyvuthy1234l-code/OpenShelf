/**
 * Normalizes any image path or URL into a fully-qualified displayable image URL.
 */
export function getImageUrl(path) {
  if (!path || typeof path !== 'string') return null;

  const trimmed = path.trim();
  if (!trimmed) return null;

  // Case A: Full URL or Data URI
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Keep the local backend fallback limited to development. Production must
  // provide VITE_API_URL for a separate backend, or use same-origin paths.
  const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : '/api');
  const backendOrigin = apiBase.replace(/\/api\/?$/, '');

  // Case B: Relative storage path
  if (trimmed.startsWith('/storage/')) {
    return `${backendOrigin}${trimmed}`;
  }
  if (trimmed.startsWith('storage/')) {
    return `${backendOrigin}/${trimmed}`;
  }

  // Case C: Raw relative storage path without leading slash/storage
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  return `${backendOrigin}/storage/${cleanPath}`;
}

/**
 * Cloudinary Transformation Helper.
 * Inserts Cloudinary optimization parameters (f_auto, q_auto, w_X, c_X) into image URLs.
 */
export function getOptimizedImageUrl(path, { width = null, height = null, crop = 'limit', quality = 'auto', format = 'auto' } = {}) {
  const url = getImageUrl(path);
  if (!url) return null;

  if (url.includes('/image/upload/')) {
    const transforms = [];
    if (format) transforms.push(`f_${format}`);
    if (quality) transforms.push(`q_${quality}`);
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    if ((width || height) && crop) transforms.push(`c_${crop}`);

    const transformStr = transforms.join(',');

    // Insert transformations right after /image/upload/
    if (/\/image\/upload\/(?:[a-z]_[a-z0-9_.,]+\/)?/.test(url)) {
      return url.replace(/\/image\/upload\/(?:[a-z]_[a-z0-9_.,]+\/)?/, `/image/upload/${transformStr}/`);
    }
  }

  return url;
}

export function getBookCoverUrl(path, width = 400) {
  return getOptimizedImageUrl(path, { width, crop: 'limit' });
}

export function getLibraryLogoUrl(path, width = 160) {
  return getOptimizedImageUrl(path, { width, height: width, crop: 'fill' });
}

export function getLibraryCoverUrl(path, width = 1200) {
  return getOptimizedImageUrl(path, { width, crop: 'limit' });
}

export function getAvatarUrl(path, width = 120) {
  return getOptimizedImageUrl(path, { width, height: width, crop: 'fill' });
}

export default getImageUrl;
