/**
 * Extract a user-friendly error message from an Axios error.
 * Handles Laravel's validation error format.
 */
export function getErrorMessage(error) {
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }

  const { data, status } = error.response;

  // Laravel validation errors (422)
  if (status === 422 && data.errors) {
    const firstField = Object.keys(data.errors)[0];
    if (firstField) {
      return data.errors[firstField][0];
    }
  }

  // General error message from backend
  if (data.message) {
    return data.message;
  }

  // Fallback by status code
  switch (status) {
    case 401:
      return 'Invalid credentials. Please try again.';
    case 403:
      return 'Access denied.';
    case 429:
      return 'Too many attempts. Please wait and try again.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
}

/**
 * Extract all validation errors as a flat object.
 * Returns: { email: 'The email has already been taken.', ... }
 */
export function getValidationErrors(error) {
  if (!error.response || error.response.status !== 422 || !error.response.data.errors) {
    return {};
  }

  const errors = {};
  for (const [field, messages] of Object.entries(error.response.data.errors)) {
    errors[field] = messages[0];
  }
  return errors;
}
