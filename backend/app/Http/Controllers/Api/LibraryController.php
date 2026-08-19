<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Library;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LibraryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:100'],
        ]);

        $query = Library::with('owner:id,name,email')
            ->withCount(['books' => fn ($query) => $query->where('status', '!=', 'inactive')])
            ->where('status', 'active')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->latest();

        $perPage = $request->integer('per_page', 15);
        if ($perPage <= 0) {
            $libraries = $query->get();
            return response()->json([
                'data' => $libraries,
                'libraries' => $libraries,
            ]);
        }

        $perPage = min($perPage, 100);
        $paginated = $query->paginate($perPage);

        return response()->json([
            'data' => $paginated->items(),
            'libraries' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    // មើល Library មួយ
    public function show(int $id)
    {
        $library = Library::with([
                'owner:id,name,email',
                'books' => fn ($query) => $query->where('status', '!=', 'inactive'),
                'books.category',
            ])
            ->where('status', 'active')
            ->findOrFail($id);

        return response()->json([
            'data' => $library,
            'library' => $library,
        ]);
    }

    // Librarian មើល Library របស់ខ្លួន
    public function myLibrary(Request $request)
    {
        $library = Library::with(['owner:id,name,email,avatar', 'books.category'])
            ->withCount('books')
            ->where('owner_id', $request->user()->id)
            ->first();

        return response()->json([
            'data' => $library,
            'library' => $library,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $existingLibrary = Library::where('owner_id', $user->id)->exists();

        if ($existingLibrary) {
            return response()->json([
                'message' => 'You already have a library.'
            ], 422);
        }

        $input = $request->all();
        foreach (['latitude', 'longitude', 'google_maps_url', 'email', 'phone', 'city', 'opening_hours', 'borrowing_rules', 'description'] as $field) {
            if (array_key_exists($field, $input) && ($input[$field] === '' || $input[$field] === 'null')) {
                $input[$field] = null;
            }
        }
        $request->replace($input);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'borrowing_rules' => ['nullable', 'string'],
            'borrowing_period_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'fine_per_day' => ['nullable', 'numeric', 'min:0'],
            'max_books_per_member' => ['nullable', 'integer', 'min:1', 'max:50'],
            'google_maps_url' => ['nullable', 'url', 'max:2048'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'status' => ['nullable', 'in:active,inactive'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('libraries', 'public');
        }

        if ($request->hasFile('cover_image')) {
            $validated['cover_image'] = $request->file('cover_image')->store('libraries/covers', 'public');
        }

        $validated['owner_id'] = $user->id;
        $validated['status'] = $validated['status'] ?? 'active';

        $library = Library::create($validated);

        return response()->json([
            'message' => 'Library created successfully.',
            'data' => $library,
            'library' => $library
        ], 201);
    }

    /**
     * Update the authenticated librarian's one library.
     */
    public function update(Request $request)
    {
        $library = $request->user()->library;

        if (!$library) {
            return response()->json(['message' => 'Create a library before updating it.'], 404);
        }

        $input = $request->all();
        foreach (['latitude', 'longitude', 'google_maps_url', 'email', 'phone', 'city', 'opening_hours', 'borrowing_rules', 'description'] as $field) {
            if (array_key_exists($field, $input) && ($input[$field] === '' || $input[$field] === 'null')) {
                $input[$field] = null;
            }
        }
        $request->replace($input);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:255'],
            'opening_hours' => ['sometimes', 'nullable', 'string', 'max:255'],
            'borrowing_rules' => ['sometimes', 'nullable', 'string'],
            'borrowing_period_days' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:365'],
            'fine_per_day' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'max_books_per_member' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:50'],
            'google_maps_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'cover_image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        if ($request->hasFile('image')) {
            if ($library->image) {
                Storage::disk('public')->delete($library->image);
            }
            $validated['image'] = $request->file('image')->store('libraries', 'public');
        }

        if ($request->hasFile('cover_image')) {
            if ($library->cover_image) {
                Storage::disk('public')->delete($library->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('libraries/covers', 'public');
        }

        $library->update($validated);

        $freshLibrary = Library::with(['owner:id,name,email,avatar', 'books.category'])
            ->withCount('books')
            ->find($library->id);

        return response()->json([
            'message' => 'Library updated successfully.',
            'data' => $freshLibrary,
            'library' => $freshLibrary,
        ]);
    }

    /**
     * Toggle or explicitly set library operational status (Open/Close).
     */
    public function toggleStatus(Request $request)
    {
        $library = $request->user()->library;

        if (!$library) {
            return response()->json(['message' => 'Create a library first.'], 404);
        }

        $request->validate([
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        if ($request->has('status')) {
            $newStatus = $request->input('status');
        } else {
            $newStatus = ($library->status === 'active') ? 'inactive' : 'active';
        }

        $library->update(['status' => $newStatus]);

        $freshLibrary = Library::with(['owner:id,name,email,avatar', 'books.category'])
            ->withCount('books')
            ->find($library->id);

        return response()->json([
            'message' => $newStatus === 'active' ? 'Library opened successfully.' : 'Library closed successfully.',
            'data' => $freshLibrary,
            'library' => $freshLibrary,
        ]);
    }
}
