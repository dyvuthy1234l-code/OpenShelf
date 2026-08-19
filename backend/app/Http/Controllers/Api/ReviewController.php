<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific book along with average rating summary.
     */
    public function index(int $bookId)
    {
        $book = Book::findOrFail($bookId);

        $reviews = Review::with('user:id,name,avatar')
            ->where('book_id', $book->id)
            ->latest()
            ->get();

        $avgRating = $reviews->avg('rating');
        $totalReviews = $reviews->count();

        return response()->json([
            'data' => $reviews,
            'summary' => [
                'average_rating' => $avgRating ? round((float) $avgRating, 1) : 0,
                'total_reviews' => $totalReviews,
            ]
        ]);
    }

    /**
     * Store or update a member's review for a book.
     */
    public function store(Request $request, int $bookId)
    {
        $user = $request->user();
        if ($user->role !== 'member') {
            return response()->json(['message' => 'Only members can submit book reviews.'], 403);
        }

        $book = Book::findOrFail($bookId);

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $review = Review::updateOrCreate(
            [
                'user_id' => $user->id,
                'book_id' => $book->id,
            ],
            [
                'rating' => $validated['rating'],
                'comment' => $validated['comment'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Your review has been submitted successfully!',
            'data' => $review->load('user:id,name,avatar'),
        ], 201);
    }

    /**
     * Delete a member's own review.
     */
    public function destroy(Request $request, int $id)
    {
        $user = $request->user();
        if ($user->role !== 'member') {
            return response()->json(['message' => 'Only members can delete reviews.'], 403);
        }

        $review = Review::find($id);
        if (!$review) {
            return response()->json(['message' => 'Review not found.'], 404);
        }

        if ($review->user_id !== $user->id) {
            return response()->json(['message' => 'You are not authorized to delete this review.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }
}
