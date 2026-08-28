<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use App\Models\User;
use Illuminate\Http\Request;
use Carbon\Carbon;

class LibrarianMemberController extends Controller
{
    /**
     * Get all members who have borrowed books from the authenticated librarian's library.
     */
    public function index(Request $request)
    {
        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before viewing members.'], 404);
        }

        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'filter' => ['nullable', 'in:all,active,overdue,returned'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = $request->string('search')->toString();
        $filter = $request->string('filter')->toString();
        $perPage = $request->integer('per_page', 12);
        $today = Carbon::today();

        // Base user query for members with borrowings in this library
        $query = User::whereHas('borrowings', function ($q) use ($library) {
            $q->where('library_id', $library->id);
        })
        ->select('id', 'name', 'email', 'phone', 'avatar', 'created_at')
        ->when($search !== '', function ($q) use ($search) {
            $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                   ->orWhere('email', 'like', "%{$search}%")
                   ->orWhere('phone', 'like', "%{$search}%");
            });
        });

        // Filter by member borrowing status
        if ($filter === 'active') {
            $query->whereHas('borrowings', function ($q) use ($library) {
                $q->where('library_id', $library->id)
                  ->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue']);
            });
        } elseif ($filter === 'overdue') {
            $query->whereHas('borrowings', function ($q) use ($library, $today) {
                $q->where('library_id', $library->id)
                  ->where(function ($sub) use ($today) {
                      $sub->where('status', 'overdue')
                        ->orWhere(function ($s) use ($today) {
                            $s->whereIn('status', ['borrowed', 'picked_up'])
                              ->whereNotNull('due_date')
                              ->whereDate('due_date', '<', $today);
                        });
                  });
            });
        } elseif ($filter === 'returned') {
            $query->whereHas('borrowings', function ($q) use ($library) {
                $q->where('library_id', $library->id)->where('status', 'returned');
            })->whereDoesntHave('borrowings', function ($q) use ($library) {
                $q->where('library_id', $library->id)
                  ->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue']);
            });
        }

        // Eager load borrowings scoped to this library
        $query->with(['borrowings' => function ($q) use ($library) {
            $q->where('library_id', $library->id)->with('library:id,name,fine_per_day');
        }]);

        $paginator = $query->latest('id')->paginate($perPage);

        // Format member items for current page
        $members = collect($paginator->items())->map(function ($u) use ($today) {
            $userBorrowings = $u->borrowings ?? collect();
            $totalBorrowed = $userBorrowings->count();
            $activeCount = 0;
            $returnedCount = 0;
            $overdueCount = 0;
            $totalFines = 0.00;

            foreach ($userBorrowings as $b) {
                $status = strtolower($b->status);
                $isOverdue = ($status === 'overdue') || (in_array($status, ['borrowed', 'picked_up']) && $b->due_date && Carbon::parse($b->due_date)->lt($today));

                if ($isOverdue) {
                    $overdueCount += 1;
                    $activeCount += 1;
                    $totalFines += (float) $b->current_fine;
                } elseif (in_array($status, ['borrowed', 'picked_up', 'approved', 'pending'])) {
                    $activeCount += 1;
                } elseif ($status === 'returned') {
                    $returnedCount += 1;
                    if ($b->fine_status === 'unpaid') {
                        $totalFines += (float) $b->fine_amount;
                    }
                }
            }

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'avatar' => $u->avatar,
                'avatar_url' => $u->avatar_url,
                'joined_at' => $u->created_at,
                'total_borrowed' => $totalBorrowed,
                'active_count' => $activeCount,
                'returned_count' => $returnedCount,
                'overdue_count' => $overdueCount,
                'total_fines' => round($totalFines, 2),
                'status' => $overdueCount > 0 ? 'Overdue' : ($activeCount > 0 ? 'Active' : 'Clear'),
            ];
        });

        // Summary calculations at DB level
        $totalMembersCount = Borrowing::where('library_id', $library->id)->distinct('user_id')->count('user_id');
        $activeBorrowersCount = Borrowing::where('library_id', $library->id)
            ->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue'])
            ->distinct('user_id')
            ->count('user_id');
        $overdueBorrowersCount = Borrowing::where('library_id', $library->id)
            ->where(function ($sub) use ($today) {
                $sub->where('status', 'overdue')
                  ->orWhere(function ($s) use ($today) {
                      $s->whereIn('status', ['borrowed', 'picked_up'])
                        ->whereNotNull('due_date')
                        ->whereDate('due_date', '<', $today);
                  });
            })
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'data' => $members,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'library' => [
                'id' => $library->id,
                'name' => $library->name,
                'address' => $library->address,
            ],
            'summary' => [
                'total_members' => $totalMembersCount,
                'active_borrowers' => $activeBorrowersCount,
                'overdue_borrowers' => $overdueBorrowersCount,
            ]
        ]);
    }

    /**
     * Get detailed borrowing history for a specific member strictly in this library.
     */
    public function show(Request $request, int $userId)
    {
        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before viewing member details.'], 404);
        }

        // Verify member has at least 1 borrowing in this librarian's library
        $hasBorrowing = Borrowing::where('library_id', $library->id)
            ->where('user_id', $userId)
            ->exists();

        if (!$hasBorrowing) {
            return response()->json(['message' => 'Member record not found in your library.'], 404);
        }

        $member = User::where('id', $userId)->select('id', 'name', 'email', 'phone', 'avatar', 'status', 'created_at')->firstOrFail();

        $borrowings = Borrowing::with(['book:id,title,author,isbn,cover_image', 'library:id,name,fine_per_day'])
            ->where('library_id', $library->id)
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $today = Carbon::today();
        $activeBorrowings = [];
        $historyBorrowings = [];
        $totalFines = 0.00;

        foreach ($borrowings as $b) {
            $status = strtolower($b->status);
            if (in_array($status, ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested'])) {
                $activeBorrowings[] = $b;
                if ($b->current_fine > 0) {
                    $totalFines += (float) $b->current_fine;
                }
            } else {
                $historyBorrowings[] = $b;
                if ($b->fine_status === 'unpaid') {
                    $totalFines += (float) $b->fine_amount;
                }
            }
        }

        $activeCount = count($activeBorrowings);
        $returnedCount = count(array_filter($historyBorrowings, fn($b) => $b->status === 'returned'));
        $overdueCount = count(array_filter($activeBorrowings, fn($b) => $b->days_overdue > 0));

        return response()->json([
            'data' => [
                'library' => [
                    'id' => $library->id,
                    'name' => $library->name,
                    'address' => $library->address,
                ],
                'member' => $member,
                'stats' => [
                    'total_borrowed' => count($borrowings),
                    'active_count' => $activeCount,
                    'returned_count' => $returnedCount,
                    'overdue_count' => $overdueCount,
                    'total_fines' => round($totalFines, 2),
                    'status' => $overdueCount > 0 ? 'Overdue' : ($activeCount > 0 ? 'Active' : 'Clear'),
                ],
                'current_borrowings' => $activeBorrowings,
                'borrowing_history' => $historyBorrowings,
            ]
        ]);
    }
}
