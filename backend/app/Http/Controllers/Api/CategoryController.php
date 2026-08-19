<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'library_id' => ['nullable', 'integer', 'exists:libraries,id'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Category::with('library:id,name,address')
            ->withCount(['books' => fn ($query) => $query->where('status', '!=', 'inactive')])
            ->where('status', 'active')
            ->whereHas('library', fn ($query) => $query->where('status', 'active'))
            ->when($request->filled('library_id'), fn ($query) => $query->where('library_id', $request->integer('library_id')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name');

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

    public function librarianIndex(Request $request)
    {
        $library = $request->user()->library;
        if (!$library) return response()->json(['message' => 'Create a library before managing categories.'], 404);

        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
            'per_page' => ['nullable', 'integer', 'min:-1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = $library->categories()
            ->withCount('books')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search')->toString();
                $q->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')->toString()))
            ->orderBy('name');

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

    public function librarianShow(Request $request, int $id)
    {
        $library = $request->user()->library;
        if (!$library) return response()->json(['message' => 'You do not own a library.'], 403);

        $category = $library->categories()->withCount('books')->findOrFail($id);
        return response()->json(['data' => $category]);
    }

    public function store(Request $request)
    {
        $library = $request->user()->library;
        if (!$library) return response()->json(['message' => 'Create a library before adding categories.'], 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->where(fn ($q) => $q->where('library_id', $library->id))],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $category = $library->categories()->create($validated + ['status' => 'active']);
        return response()->json(['message' => 'Category created successfully.', 'data' => $category->loadCount('books')], 201);
    }

    public function update(Request $request, int $id)
    {
        $library = $request->user()->library;
        if (!$library) return response()->json(['message' => 'You do not own a library.'], 403);
        $category = $library->categories()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:100', Rule::unique('categories', 'name')->where(fn ($q) => $q->where('library_id', $library->id))->ignore($category->id)],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', 'in:active,inactive'],
        ]);
        $category->update($validated);
        return response()->json(['message' => 'Category updated successfully.', 'data' => $category->fresh()->loadCount('books')]);
    }

    public function destroy(Request $request, int $id)
    {
        $library = $request->user()->library;
        if (!$library) return response()->json(['message' => 'You do not own a library.'], 403);
        $category = $library->categories()->findOrFail($id);

        if ($category->books()->where('status', '!=', 'inactive')->exists()) {
            return response()->json(['message' => 'This category contains active books and cannot be deleted.'], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
