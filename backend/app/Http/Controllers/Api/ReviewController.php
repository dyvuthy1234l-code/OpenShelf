<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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

        $book = Book::with('library.owner')->findOrFail($bookId);

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

        // Notify the librarian (book library owner)
        $librarian = $book->library?->owner;
        if ($librarian && $librarian->id !== $user->id) {
            $starStr = str_repeat('⭐', $validated['rating']);
            $commentSnippet = !empty($validated['comment']) ? ': "' . Str::limit($validated['comment'], 80) . '"' : '.';

            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'book_review',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $librarian->id,
                'data' => json_encode([
                    'title' => 'New Book Rating ' . $starStr,
                    'message' => 'Member "' . $user->name . '" rated ' . $validated['rating'] . '/5 on "' . $book->title . '"' . $commentSnippet,
                    'book_id' => $book->id,
                    'book_title' => $book->title,
                    'reviewer_name' => $user->name,
                    'rating' => $validated['rating'],
                    'target_url' => '/librarian/books/' . $book->id,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

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
