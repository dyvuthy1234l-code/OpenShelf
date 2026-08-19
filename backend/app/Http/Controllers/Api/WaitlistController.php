<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Waitlist;
use Illuminate\Http\Request;

class WaitlistController extends Controller
{
    public function join(Request $request, int $bookId)
    {
        // Check that the book is active and its library is active
        $book = Book::with('library')
            ->where('status', '!=', 'inactive')
            ->whereHas('library', fn ($q) => $q->where('status', 'active'))
            ->findOrFail($bookId);

        // A member can only join waitlist if there are no copies available
        if ($book->available_quantity > 0) {
            return response()->json([
                'message' => 'Copies of this book are currently available for borrowing. You do not need to join the waitlist.'
            ], 422);
        }

        $existing = Waitlist::where('book_id', $book->id)->where('member_id', $request->user()->id)->first();
        if ($existing) return response()->json(['message' => 'You are already on this waitlist.', 'data' => $existing]);
        $position = (int) Waitlist::where('book_id', $book->id)->max('position') + 1;
        $entry = Waitlist::create(['book_id' => $book->id, 'member_id' => $request->user()->id, 'position' => $position]);
        return response()->json(['message' => 'You joined the waitlist.', 'data' => $entry], 201);
    }
    public function leave(Request $request, int $bookId)
    {
        Waitlist::where('book_id', $bookId)->where('member_id', $request->user()->id)->delete();
        return response()->json(['message' => 'You left the waitlist.']);
    }
    public function position(Request $request, int $bookId)
    {
        return response()->json(['data' => Waitlist::where('book_id', $bookId)->where('member_id', $request->user()->id)->first()]);
    }
}
