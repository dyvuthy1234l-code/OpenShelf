<?php

namespace App\Http\Controllers\Api;

use App\Models\Library;
use App\Models\LibraryReview;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class LibraryReviewController extends Controller
{
    /**
     * Display a listing of the reviews for a library.
     */
    public function index(Library $library)
    {
        $reviews = $library->reviews()->with('user:id,name,avatar')->latest()->get();
        return response()->json($reviews);
    }

    /**
     * Store or update a newly created review in storage.
     */
    public function store(Request $request, Library $library)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Check if the user has ever borrowed a book from this library
        $hasBorrowed = Borrowing::where('user_id', $user->id)
            ->where('library_id', $library->id)
            ->exists();

        if (!$hasBorrowed) {
            return response()->json([
                'message' => 'You must borrow a book from this library before you can submit a rating.'
            ], 403);
        }

        $review = LibraryReview::updateOrCreate(
            ['user_id' => $user->id, 'library_id' => $library->id],
            ['rating' => $validated['rating'], 'comment' => $validated['comment']]
        );

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review->load('user:id,name,avatar')
        ]);
    }

    /**
     * Remove the specified review from storage.
     */
    public function destroy(Library $library, LibraryReview $review)
    {
        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
