import api from '../api/axios';
import { memberService } from './memberService';

export const publicService = {
  getLibraries: async (params = {}) => {
    const response = await api.get('/libraries', { params });
    return response.data;
  },

  getLibrary: async (id) => {
    const response = await api.get(`/libraries/${id}`);
    return response.data;
  },

  getLibraryReviews: async (id) => {
    const response = await api.get(`/libraries/${id}/reviews`);
    return response.data;
  },

  getBooks: async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
  },

  getBook: async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  getBookReviews: async (id) => {
    const response = await api.get(`/books/${id}/reviews`);
    return response.data;
  },

  submitBookReview: memberService.submitBookReview,
  submitLibraryReview: memberService.submitLibraryReview,

  getCategories: async (params = {}) => {
    const response = await api.get('/public/categories', { params });
    return response.data;
  },

  getSubscriptionPlans: async () => {
    const response = await api.get('/subscription-plans');
    return response.data;
  },

  requestBorrowing: async (bookId) => {
    const response = await api.post('/member/borrowings', { book_id: bookId });
    return response.data;
  },
};

export default publicService;
