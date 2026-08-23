import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publicService } from '../../services/publicService';
import { Star, MessageSquare, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { getAvatarUrl } from '../../utils/imageUrl';

export default function LibraryReviews({ libraryId, initialReviewsCount }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await publicService.getLibraryReviews(libraryId);
      setReviews(data);
    } catch (err) {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [libraryId]);

  const userReview = reviews.find(r => r.user_id === user?.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    
    try {
      await publicService.submitLibraryReview(libraryId, { rating, comment });
      await fetchReviews();
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-slate-100 rounded-2xl w-full my-6"></div>;
  }

  return (
    <div className="space-y-6 pt-4 border-t border-slate-200/80 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Library Reviews</h2>
            <p className="text-xs text-slate-500">See what readers are saying about this library</p>
          </div>
        </div>

        {user && user.role === 'member' && !userReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 text-xs text-white hover:text-white font-semibold px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-slate-900">Your Review</h3>
          
          {formError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${rating >= star ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-amber-500 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              rows="3"
              placeholder="Share your experience with this library..."
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No reviews yet. Be the first to rate this library!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={getAvatarUrl(review.user.avatar, 40) || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.user.name)}&bg=f8fafc&color=0f172a`} 
                    alt={review.user.name} 
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{review.user.name}</div>
                    <div className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-200 fill-slate-200'}`} />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
