<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Borrowing;
use App\Models\Waitlist;
use App\Http\Requests\StoreBorrowingRequest;
use App\Http\Requests\RejectBorrowingRequest;
use App\Http\Requests\ReturnBookRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class BorrowingController extends Controller
{
    private function abortJson(string $message, int $status = 422): void
    {
        throw new HttpResponseException(
            response()->json(['message' => $message], $status)
        );
    }
    public function memberIndex(Request $request)
    {
        $request->validate([
            'status' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $query = $request->user()->borrowings()
            ->with(['book.category', 'library:id,name,address,phone,fine_per_day,borrowing_period_days,max_books_per_member'])
            ->when($request->filled('status') && $request->input('status') !== 'all', function ($query) use ($request) {
                $statusStr = $request->string('status')->toString();
                $statuses = array_filter(explode(',', $statusStr));
                if (count($statuses) > 0) {
                    if (in_array('overdue', $statuses, true)) {
                        $query->where(function ($q) use ($statuses) {
                            $q->whereIn('status', $statuses)
                              ->orWhere(function ($sub) {
                                  $sub->whereIn('status', ['borrowed', 'picked_up'])
                                      ->whereNotNull('due_date')
                                      ->whereDate('due_date', '<', Carbon::today());
                              });
                        });
                    } elseif (in_array('borrowed', $statuses, true)) {
                        $query->whereIn('status', ['borrowed', 'picked_up']);
                    } else {
                        $query->whereIn('status', $statuses);
                    }
                }
            })
            ->latest();

        $perPage = $request->integer('per_page', 15);
        if ($perPage <= 0) {
            $borrowings = $this->withWaitlistPositions($query->get(), $request->user()->id);
            return response()->json(['data' => $borrowings]);
        }

        $paginated = $query->paginate(min($perPage, 100));
        return response()->json([
            'data' => $this->withWaitlistPositions(collect($paginated->items()), $request->user()->id)->values(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    public function memberShow(Request $request, int $id)
    {
        $borrowing = $request->user()->borrowings()
            ->with(['book.category', 'library:id,name,address,phone,fine_per_day,borrowing_period_days,max_books_per_member'])
            ->findOrFail($id);

        return response()->json(['data' => $borrowing]);
    }

    public function store(StoreBorrowingRequest $request)
    {
        $validated = $request->validated();

        $user = $request->user();
        if ($user->status !== 'active' || $user->role !== 'member') {
            return response()->json(['message' => 'Only active members can request books.'], 403);
        }

        $borrowing = DB::transaction(function () use ($validated, $user) {
            // Lock the user record to prevent concurrent borrowing request race conditions
            $lockedUser = \App\Models\User::lockForUpdate()->findOrFail($user->id);

            $book = Book::with('library.owner')->lockForUpdate()->findOrFail($validated['book_id']);

            if ($book->library->status !== 'active') {
                $this->abortJson('This library is currently closed / inactive.', 422);
            }
            if ($book->status === 'inactive') {
                $this->abortJson('This book is not available.', 422);
            }
            if ($book->available_quantity < 1) {
                $this->abortJson('No copies are currently available.', 422);
            }

            // Determine user limit strictly from library policy
            $maxBooksAllowed = $book->library->max_books_per_member ?? 3;

            $activeMemberLoansCount = Borrowing::where('user_id', $user->id)
                ->where('library_id', $book->library_id)
                ->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue'])
                ->count();

            if ($activeMemberLoansCount >= $maxBooksAllowed) {
                $this->abortJson("You have reached the maximum allowed limit of {$maxBooksAllowed} active book requests/loans for this library.", 422);
            }

            $hasActiveRequestForSameBook = Borrowing::where('user_id', $user->id)
                ->where('book_id', $book->id)
                ->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue'])
                ->exists();

            if ($hasActiveRequestForSameBook) {
                $this->abortJson('You already have an active request or loan for this book.', 422);
            }

            $borrowing = Borrowing::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'library_id' => $book->library_id,
                'requested_at' => now(),
                'status' => 'pending',
                'fine_amount' => 0.00,
                'fine_status' => 'none',
            ]);

            $ownerId = $book->library?->owner_id ?? \App\Models\Library::where('id', $book->library_id)->value('owner_id');
            if ($ownerId) {
                $this->notifyUser(
                    (int) $ownerId,
                    'New Borrow Request',
                    $user->name . ' requested to borrow "' . $book->title . '".',
                    $borrowing->id
                );
            }

            return $borrowing;
        });

        return response()->json([
            'message' => 'Borrowing request created successfully.',
            'data' => $borrowing->load(['book', 'library']),
        ], 201);
    }

    public function librarianIndex(Request $request)
    {
        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before viewing borrowings.'], 404);
        }

        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'max:100'],
            'fine_status' => ['nullable', 'string', 'in:none,has_fine,unpaid,paid,waived'],
            'start_date' => ['nullable', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d'],
            'per_page' => ['nullable', 'integer', 'min:0', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = $library->borrowings()
            ->with(['user:id,name,email,avatar', 'book.category', 'library:id,name,fine_per_day'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($sub) use ($search) {
                    $sub->whereHas('user', function ($uQuery) use ($search) {
                        $uQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })->orWhereHas('book', function ($bQuery) use ($search) {
                        $bQuery->where('title', 'like', "%{$search}%")
                            ->orWhere('isbn', 'like', "%{$search}%")
                            ->orWhere('author', 'like', "%{$search}%");
                    });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $statusStr = $request->string('status')->toString();
                $statuses = array_filter(explode(',', $statusStr));
                if (count($statuses) > 0) {
                    if (in_array('overdue', $statuses, true)) {
                        $query->where(function ($q) use ($statuses) {
                            $q->whereIn('status', $statuses)
                              ->orWhere(function ($sub) {
                                  $sub->whereIn('status', ['borrowed', 'picked_up'])
                                      ->whereDate('due_date', '<', Carbon::today());
                              });
                        });
                    } else {
                        $query->whereIn('status', $statuses);
                    }
                }
            })
            ->when($request->filled('fine_status'), function ($query) use ($request) {
                $fineStatus = $request->string('fine_status')->toString();
                if ($fineStatus === 'none') {
                    $query->where(function ($q) {
                        $q->where('fine_amount', '<=', 0)
                          ->orWhere('fine_status', 'none');
                    });
                } elseif ($fineStatus === 'has_fine') {
                    $query->where('fine_amount', '>', 0);
                } else {
                    $query->where('fine_status', $fineStatus);
                }
            })
            ->when($request->filled('start_date'), function ($query) use ($request) {
                $query->whereDate('requested_at', '>=', $request->string('start_date')->toString());
            })
            ->when($request->filled('end_date'), function ($query) use ($request) {
                $query->whereDate('requested_at', '<=', $request->string('end_date')->toString());
            })
            ->latest();

        $perPage = $request->integer('per_page', 15);
        if ($perPage <= 0) {
            $borrowings = $query->get();
            return response()->json(['data' => $borrowings]);
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
        if (!$library) {
            return response()->json(['message' => 'Create a library before managing borrowings.'], 404);
        }

        $borrowing = $library->borrowings()
            ->with(['user:id,name,email,avatar', 'book.category', 'library:id,name,address,phone,fine_per_day,borrowing_period_days'])
            ->findOrFail($id);

        return response()->json(['data' => $borrowing]);
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'borrowing_ids' => ['required', 'array', 'min:1'],
            'borrowing_ids.*' => ['integer'],
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before managing borrowings.'], 404);
        }

        $results = DB::transaction(function () use ($library, $validated) {
            $borrowings = $library->borrowings()
                ->whereIn('id', $validated['borrowing_ids'])
                ->where('status', 'pending')
                ->with('book')
                ->get();

            $processed = [];
            $failed = [];

            foreach ($borrowings as $borrowing) {
                $lockedBorrowing = Borrowing::lockForUpdate()->find($borrowing->id);
                if (!$lockedBorrowing || $lockedBorrowing->status !== 'pending') {
                    continue;
                }

                if ($validated['status'] === 'approved') {
                    $book = Book::lockForUpdate()->find($lockedBorrowing->book_id);
                    if (!$book || $book->available_quantity <= 0) {
                        $failed[] = [
                            'id' => $lockedBorrowing->id,
                            'book' => $book ? $book->title : 'Unknown Book',
                            'reason' => 'This book has no available copies.',
                        ];
                        continue;
                    }

                    $lockedBorrowing->update([
                        'status' => 'approved',
                        'approved_at' => now(),
                    ]);
                    $processed[] = $lockedBorrowing;
                } else {
                    $lockedBorrowing->update([
                        'status' => 'rejected',
                        'rejection_reason' => 'Request rejected by librarian.',
                    ]);
                    $processed[] = $lockedBorrowing;
                }
            }

            return ['processed' => $processed, 'failed' => $failed];
        });

        foreach ($results['processed'] as $borrowing) {
            $this->notifyMember(
                $borrowing,
                'Borrowing ' . $validated['status'],
                'Your request for "' . ($borrowing->book->title ?? 'book') . '" was ' . $validated['status'] . '.'
            );
        }

        $message = count($results['failed']) > 0
            ? 'Processed ' . count($results['processed']) . ' request(s). ' . count($results['failed']) . ' request(s) failed due to zero stock.'
            : 'Borrowing requests updated.';

        return response()->json([
            'message' => $message,
            'data' => collect($results['processed'])->map(fn ($b) => $b->fresh()->load(['book', 'user'])),
            'failed' => $results['failed'],
        ]);
    }

    public function approve(Request $request, Borrowing $borrowing)
    {
        $this->ensureOwnBorrowing($request, $borrowing);

        $updatedBorrowing = DB::transaction(function () use ($borrowing) {
            $lockedBorrowing = Borrowing::lockForUpdate()->findOrFail($borrowing->id);

            if ($lockedBorrowing->status !== 'pending') {
                $this->abortJson('Only pending requests can be approved.', 422);
            }

            $book = Book::lockForUpdate()->findOrFail($lockedBorrowing->book_id);

            if ($book->available_quantity <= 0) {
                $this->abortJson('This book has no available copies.', 422);
            }

            $lockedBorrowing->update([
                'status' => 'approved',
                'approved_at' => now(),
            ]);

            return $lockedBorrowing;
        });

        $this->notifyMember($updatedBorrowing, 'Borrowing approved', 'Your request for "'.$updatedBorrowing->book->title.'" was approved. Please visit the library for pickup.');

        return response()->json(['message' => 'Borrowing request approved.', 'data' => $updatedBorrowing->fresh()->load(['book', 'user'])]);
    }

    public function reject(RejectBorrowingRequest $request, Borrowing $borrowing)
    {
        $this->ensureOwnBorrowing($request, $borrowing);
        $validated = $request->validated();

        if ($borrowing->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be rejected.'], 422);
        }

        $borrowing->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);
        $this->notifyMember($borrowing, 'Borrowing rejected', 'Your request for "'.$borrowing->book->title.'" was rejected.');

        return response()->json(['message' => 'Borrowing request rejected.', 'data' => $borrowing->fresh()->load(['book', 'user'])]);
    }

    /**
     * Confirm Member Pickup:
     * Sets picked_up_at, calculates due_date based on library borrowing_period_days, and decrements book stock.
     */
    public function pickup(Request $request, Borrowing $borrowing)
    {
        $this->ensureOwnBorrowing($request, $borrowing);
        $library = $request->user()->library;

        $updatedBorrowing = DB::transaction(function () use ($borrowing, $library) {
            $lockedBorrowing = Borrowing::lockForUpdate()->findOrFail($borrowing->id);
            if ($lockedBorrowing->status !== 'approved') {
                $this->abortJson('Only approved requests can be picked up.', 422);
            }

            $book = Book::lockForUpdate()->findOrFail($lockedBorrowing->book_id);
            if ($book->available_quantity <= 0) {
                $this->abortJson('No available copy remains for pickup.', 422);
            }

            $periodDays = (int) ($library->borrowing_period_days ?? 14);
            $pickupTime = now();
            $dueDate = Carbon::today()->addDays($periodDays);

            $book->decrement('available_quantity');
            $lockedBorrowing->update([
                'status' => 'borrowed',
                'picked_up_at' => $pickupTime,
                'borrowed_at' => $pickupTime,
                'due_date' => $dueDate->toDateString(),
            ]);

            return $lockedBorrowing;
        });

        $this->notifyMember($updatedBorrowing, 'Book picked up', 'Your borrowing period has started. Book is due on ' . $updatedBorrowing->due_date);

        return response()->json(['message' => 'Book pickup confirmed.', 'data' => $updatedBorrowing->fresh()->load(['book', 'user', 'library'])]);
    }

    /**
     * Confirm Book Return & Finalize Fine Calculation.
     */
    public function returnBook(ReturnBookRequest $request, Borrowing $borrowing)
    {
        $this->ensureOwnBorrowing($request, $borrowing);
        $validated = $request->validated();

        $updatedBorrowing = DB::transaction(function () use ($borrowing, $validated) {
            $lockedBorrowing = Borrowing::with(['library', 'book', 'user'])->lockForUpdate()->findOrFail($borrowing->id);
            if (!in_array($lockedBorrowing->status, ['borrowed', 'picked_up', 'overdue', 'return_requested'])) {
                $this->abortJson('Only borrowed/picked up/overdue/return requested books can be returned.', 422);
            }

            $book = Book::lockForUpdate()->findOrFail($lockedBorrowing->book_id);
            $book->available_quantity = min($book->quantity, $book->available_quantity + 1);
            $book->save();

            $returnedAt = now();
            $fineAmount = 0.00;
            $fineStatus = $validated['fine_status'] ?? 'none';

            if ($lockedBorrowing->due_date) {
                $dueDate = Carbon::parse($lockedBorrowing->due_date)->startOfDay();
                $returnDay = Carbon::today();
                if ($returnDay->gt($dueDate)) {
                    $daysOverdue = $returnDay->diffInDays($dueDate);
                    $finePerDay = $lockedBorrowing->library ? (float) $lockedBorrowing->library->fine_per_day : 0.50;
                    $fineAmount = round($daysOverdue * $finePerDay, 2);
                    if ($fineStatus === 'none') {
                        $fineStatus = 'unpaid';
                    }
                }
            }

            $lockedBorrowing->update([
                'status' => 'returned',
                'returned_at' => $returnedAt,
                'fine_amount' => $fineAmount,
                'fine_status' => $fineStatus,
            ]);

            if ($fineStatus === 'paid' && $fineAmount > 0) {
                \App\Models\Payment::create([
                    'user_id' => $lockedBorrowing->user_id,
                    'subscription_id' => null,
                    'amount' => $fineAmount,
                    'payment_method' => 'In-Library Fine Settlement',
                    'transaction_id' => 'FINE-LIB-' . Str::upper(Str::random(16)),
                    'status' => 'paid',
                    'paid_at' => now(),
                ]);
            }

            return $lockedBorrowing;
        });

        $this->notifyMember($updatedBorrowing, 'Book returned', 'Your return of the book has been confirmed by the library.');
        
        $ownerId = $updatedBorrowing->library?->owner_id ?? \App\Models\Library::where('id', $updatedBorrowing->library_id)->value('owner_id');
        if ($ownerId) {
            $memberName = $updatedBorrowing->user?->name ?? 'A member';
            $bookTitle = $updatedBorrowing->book?->title ?? 'a book';
            $this->notifyUser(
                (int) $ownerId,
                'Book Return Completed',
                $memberName . ' successfully returned "' . $bookTitle . '".',
                $updatedBorrowing->id
            );
        }

        $next = Waitlist::where('book_id', $updatedBorrowing->book_id)->orderBy('position')->first();
        if ($next) {
            $this->notifyUser($next->member_id, 'Book available soon', 'A copy of "'.($updatedBorrowing->book->title ?? 'the book').'" is now available. You are next in the waitlist.');
        }

        return response()->json(['message' => 'Book return confirmed.', 'data' => $updatedBorrowing->fresh()->load(['book', 'user', 'library'])]);
    }

    public function payFine(Request $request, int $id)
    {
        $borrowing = $request->user()->borrowings()->findOrFail($id);

        if ($borrowing->fine_amount <= 0 || in_array($borrowing->fine_status, ['paid', 'waived'])) {
            return response()->json(['message' => 'No outstanding fine to pay for this borrowing.'], 422);
        }

        DB::transaction(function () use ($borrowing, $request) {
            $borrowing->update([
                'fine_status' => 'paid',
            ]);

            \App\Models\Payment::create([
                'user_id' => $request->user()->id,
                'subscription_id' => null,
                'amount' => $borrowing->fine_amount,
                'payment_method' => 'Fine Settlement',
                'transaction_id' => 'FINE-' . Str::upper(Str::random(16)),
                'status' => 'paid',
                'paid_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Fine payment processed successfully.',
            'data' => $borrowing->fresh(),
        ]);
    }

    public function extendLoan(Request $request, int $id)
    {
        $borrowing = $request->user()->borrowings()->with('library')->findOrFail($id);

        if (!in_array($borrowing->status, ['borrowed', 'picked_up', 'overdue'])) {
            return response()->json(['message' => 'Only active borrowed books can be extended.'], 422);
        }

        $dueDate = Carbon::parse($borrowing->due_date);
        if (Carbon::today()->gt($dueDate)) {
            return response()->json(['message' => 'Overdue borrowings cannot be extended. Please return the book and resolve any fine.'], 422);
        }

        $periodDays = $borrowing->library->borrowing_period_days ?? 7;
        $newDueDate = $dueDate->addDays($periodDays)->toDateString();

        $borrowing->update([
            'due_date' => $newDueDate,
        ]);

        return response()->json([
            'message' => "Loan extended successfully by {$periodDays} days. New due date: {$newDueDate}",
            'data' => $borrowing->fresh(),
        ]);
    }

    public function memberRequestReturn(Request $request, int $id)
    {
        $user = $request->user();
        if ($user->role !== 'member') {
            return response()->json(['message' => 'Only members can request book returns.'], 403);
        }

        $borrowing = $user->borrowings()->with(['book', 'library'])->findOrFail($id);

        if ($borrowing->status === 'return_requested') {
            return response()->json(['message' => 'Return request already exists for this book.'], 409);
        }

        if (!in_array($borrowing->status, ['borrowed', 'picked_up', 'overdue'])) {
            return response()->json(['message' => 'Only active or overdue borrowings can be requested for return.'], 422);
        }

        $borrowing->update([
            'status' => 'return_requested',
        ]);

        $ownerId = $borrowing->library?->owner_id ?? \App\Models\Library::where('id', $borrowing->library_id)->value('owner_id');
        if ($ownerId) {
            $this->notifyUser(
                (int) $ownerId,
                'Return Request Received',
                $user->name . ' requested to return "' . ($borrowing->book->title ?? 'a book') . '".',
                $borrowing->id
            );
        }

        return response()->json([
            'message' => 'Return request submitted successfully.',
            'data' => $borrowing->fresh()->load(['book.category', 'library']),
        ]);
    }

    private function ensureOwnBorrowing(Request $request, Borrowing $borrowing): void
    {
        $library = $request->user()->library;
        if (!$library || $borrowing->library_id !== $library->id) {
            $this->abortJson('You can only manage borrowings from your own library.', 403);
        }
    }

    private function withWaitlistPositions($borrowings, int $memberId)
    {
        $positions = Waitlist::where('member_id', $memberId)->pluck('position', 'book_id');
        return $borrowings->map(function ($borrowing) use ($positions) {
            $borrowing->waitlist_position = $positions[$borrowing->book_id] ?? null;
            return $borrowing;
        });
    }

    private function notifyMember(Borrowing $borrowing, string $title, string $message): void
    {
        $this->notifyUser($borrowing->user_id, $title, $message, $borrowing->id);
    }

    private function notifyUser(int $userId, string $title, string $message, ?int $borrowingId = null): void
    {
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'type' => 'borrowing',
            'notifiable_type' => 'App\\Models\\User',
            'notifiable_id' => $userId,
            'data' => json_encode(['title' => $title, 'message' => $message, 'borrowing_id' => $borrowingId]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
