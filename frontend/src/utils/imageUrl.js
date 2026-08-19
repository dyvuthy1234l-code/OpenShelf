/**
 * Normalizes any image path or URL into a fully-qualified displayable image URL.
 * Handles:
 * Case A: Full URL ('https://...' or 'http://...' or 'data:...') -> returns directly
 * Case B: Relative URL starting with '/storage/' or 'storage/' -> prepends backend base origin
 * Case C: Raw storage path ('libraries/logos/file.jpg' or 'avatars/1.jpg') -> prepends backend origin + '/storage/'
 * Case D: null / undefined -> returns null
 */
export function getImageUrl(path) {
  if (!path || typeof path !== 'string') return null;

  const trimmed = path.trim();
  if (!trimmed) return null;

  // Case A: Full URL or Data URI
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Determine backend origin (e.g., 'http://localhost:8000')
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
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

export default getImageUrl;
