<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:100'],
        ]);

        $query = $request->user()->favorites()
            ->with([
                'book' => fn ($q) => $q->withAvg('reviews', 'rating')->withCount('reviews'),
                'book.library:id,name,address',
                'book.category:id,name'
            ])
            ->whereHas('book', fn ($q) => $q->where('status', '!=', 'inactive'))
            ->latest();

        $perPage = $request->integer('per_page', 12);
        if ($perPage <= 0) {
            return response()->json(['data' => $query->get()]);
        }

        $paginated = $query->paginate(min($perPage, 100));
        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['book_id' => ['required', 'integer', 'exists:books,id']]);
        $book = Book::where('id', $validated['book_id'])
            ->where('status', '!=', 'inactive')
            ->whereHas('library', fn ($query) => $query->where('status', 'active'))
            ->firstOrFail();

        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'book_id' => $book->id,
        ]);

        return response()->json(['message' => 'Book added to favorites.', 'data' => $favorite->load('book')], $favorite->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Request $request, int $id)
    {
        $deleted = $request->user()->favorites()
            ->where(function ($query) use ($id) {
                $query->where('book_id', $id)
                      ->orWhere('id', $id);
            })
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'Favorite not found.'], 404);
        }

        return response()->json(['message' => 'Book removed from favorites.']);
    }
}
