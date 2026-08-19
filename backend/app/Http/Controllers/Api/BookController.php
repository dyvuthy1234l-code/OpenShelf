<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'library_id' => ['nullable', 'integer', 'exists:libraries,id'],
            'library' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'sort' => ['nullable', 'string', 'in:latest,top_rated,popular'],
            'available_only' => ['nullable'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:100'],
        ]);

        $query = Book::with(['library:id,name,address,phone,google_maps_url,fine_per_day,borrowing_period_days,max_books_per_member', 'category:id,name'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('status', '!=', 'inactive')
            ->whereHas('library', fn ($q) => $q->where('status', 'active'))
            ->when($request->has('available_only') && filter_var($request->input('available_only'), FILTER_VALIDATE_BOOLEAN), function ($q) {
                $q->where(function ($sub) {
                    $sub->where('available_quantity', '>', 0)
                        ->orWhere(function ($s) {
                            $s->whereNull('available_quantity')
                              ->where('quantity', '>', 0);
                        });
                });
            })
            ->when($request->filled('library_id'), fn ($q) => $q->where('library_id', $request->integer('library_id')))
            ->when($request->filled('library'), function ($q) use ($request) {
                $librarySearch = $request->string('library')->toString();
                $q->whereHas('library', function ($libraryQuery) use ($librarySearch) {
                    $libraryQuery->where('name', 'like', "%{$librarySearch}%")
                        ->orWhere('address', 'like', "%{$librarySearch}%");
                });
            })
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            });

        // Sorting
        $sort = $request->string('sort')->toString();
        if ($sort === 'top_rated') {
            $query->orderByDesc('reviews_avg_rating')->orderByDesc('reviews_count')->latest();
        } else {
            $query->latest();
        }

        $perPage = $request->integer('per_page', 15);
        if ($perPage <= 0) {
            $books = $query->get();
            return response()->json(['data' => $books]);
        }

        $perPage = min($perPage, 100);
        $paginated = $query->paginate($perPage);
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

    public function show(int $id)
    {
        $book = Book::with(['library:id,name,address,phone,google_maps_url,fine_per_day,borrowing_period_days,max_books_per_member', 'category:id,name'])
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->where('status', '!=', 'inactive')
            ->whereHas('library', fn ($query) => $query->where('status', 'active'))
            ->findOrFail($id);

        return response()->json(['data' => $book]);
    }

    public function librarianIndex(Request $request)
    {
        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before managing books.'], 404);
        }

        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = $library->books()
            ->with('category:id,name')
            ->withAvg('reviews', 'rating')
            ->withCount('reviews')
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($sub) use ($search) {
                    $sub->where('title', 'like', "%{$search}%")
                        ->orWhere('author', 'like', "%{$search}%")
                        ->orWhere('isbn', 'like', "%{$search}%");
                });
            })
            ->latest();

        $perPage = $request->integer('per_page', -1);
        if ($perPage <= 0) {
            $books = $query->get();
            return response()->json(['data' => $books]);
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

    public function store(StoreBookRequest $request)
    {
        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before adding books.'], 404);
        }

        $validated = $request->validated();

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('books', 'public');
        }

        $validated['library_id'] = $library->id;
        $validated['available_quantity'] = (int) $validated['quantity'];
        $validated['status'] = $validated['status'] ?? 'active';

        $book = Book::create($validated);

        return response()->json([
            'message' => 'Book created successfully.',
            'data' => $book->load('category'),
        ], 201);
    }

    public function librarianShow(Request $request, int $id)
    {
        $book = $this->ownedBook($request, $id)->load('category');
        $activeBorrowed = \App\Models\Borrowing::where('book_id', $book->id)
            ->whereIn('status', ['borrowed', 'picked_up', 'overdue', 'return_requested'])
            ->count();
        $expectedAvailable = max(0, (int) $book->quantity - $activeBorrowed);
        if ($book->available_quantity !== $expectedAvailable) {
            $book->update(['available_quantity' => $expectedAvailable]);
            $book->available_quantity = $expectedAvailable;
        }

        return response()->json(['data' => $book]);
    }

    public function update(UpdateBookRequest $request, int $id)
    {
        $validated = $request->validated();

        $book = DB::transaction(function () use ($request, $id, $validated) {
            $book = Book::lockForUpdate()->where('library_id', $request->user()->library?->id)->findOrFail($id);

            $activeBorrowed = \App\Models\Borrowing::where('book_id', $book->id)
                ->whereIn('status', ['borrowed', 'picked_up', 'overdue', 'return_requested'])
                ->count();

            if (array_key_exists('quantity', $validated)) {
                $newQuantity = (int) $validated['quantity'];
                if ($newQuantity < $activeBorrowed) {
                    abort(response()->json([
                        'message' => "Quantity cannot be lower than the {$activeBorrowed} copies currently borrowed.",
                    ], 422));
                }
                $validated['available_quantity'] = max(0, $newQuantity - $activeBorrowed);
            } else {
                $validated['available_quantity'] = max(0, (int) $book->quantity - $activeBorrowed);
            }

            if ($request->hasFile('cover_image')) {
                if ($book->cover_image) {
                    Storage::disk('public')->delete($book->cover_image);
                }
                $validated['cover_image'] = $request->file('cover_image')->store('books', 'public');
            }

            $book->update($validated);
            return $book;
        });

        return response()->json([
            'message' => 'Book updated successfully.',
            'data' => $book->fresh()->load('category'),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $book = $this->ownedBook($request, $id);
        $book->update(['status' => 'inactive']);

        return response()->json(['message' => 'Book disabled successfully.']);
    }

    private function ownedBook(Request $request, int $id): Book
    {
        $library = $request->user()->library;
        if (!$library) {
            abort(response()->json(['message' => 'You do not own a library.'], 403));
        }

        return $library->books()->findOrFail($id);
    }
}
