<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Borrowing;
use App\Models\Library;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $request->validate([
            'range' => ['nullable', 'string', 'in:all,today,month,year'],
            'chart_range' => ['nullable', 'string', 'in:month,quarter,year,all'],
        ]);

        $range = $request->input('range', 'all');
        $chartRange = $request->input('chart_range', 'year');

        // Helper function to apply date filter to queries
        $applyRange = function ($query, $dateColumn = 'created_at') use ($range) {
            if ($range === 'today') {
                if (is_string($dateColumn)) {
                    $query->whereDate($dateColumn, now()->toDateString());
                } else {
                    $query->whereRaw('DATE(COALESCE(paid_at, created_at)) = ?', [now()->toDateString()]);
                }
            } elseif ($range === 'month') {
                if (is_string($dateColumn)) {
                    $query->whereMonth($dateColumn, now()->month)
                          ->whereYear($dateColumn, now()->year);
                } else {
                    $query->whereRaw('MONTH(COALESCE(paid_at, created_at)) = ?', [now()->month])
                          ->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [now()->year]);
                }
            } elseif ($range === 'year') {
                if (is_string($dateColumn)) {
                    $query->whereYear($dateColumn, now()->year);
                } else {
                    $query->whereRaw('YEAR(COALESCE(paid_at, created_at)) = ?', [now()->year]);
                }
            }
        };

        // 1. Basic Counts (Filtered by range if specified, otherwise All Time)
        $totalLibrariesQuery = Library::query();
        $applyRange($totalLibrariesQuery, 'created_at');
        $totalLibraries = $totalLibrariesQuery->count();

        $activeLibrariansQuery = User::where('role', 'librarian')
            ->where(function ($q) {
                $q->where('status', 'active')
                  ->orWhereNull('status');
            });
        $applyRange($activeLibrariansQuery, 'created_at');
        $activeLibrarians = $activeLibrariansQuery->count();

        $totalMembersQuery = User::where('role', 'member');
        $applyRange($totalMembersQuery, 'created_at');
        $totalMembers = $totalMembersQuery->count();

        // Active Borrowings: Physically borrowed books currently out (borrowed, picked_up, overdue, return_requested)
        $activeBorrowingsQuery = Borrowing::whereIn('status', ['borrowed', 'picked_up', 'overdue', 'return_requested']);
        $applyRange($activeBorrowingsQuery, 'created_at');
        $activeBorrowings = $activeBorrowingsQuery->count();

        // 2. Revenue Calculations (Filtered by range & successful payments only)
        $subscriptionRevenueQuery = Payment::whereNotNull('subscription_id')
            ->whereIn('status', ['paid', 'success', 'completed']);
        $applyRange($subscriptionRevenueQuery, 'created_at');
        $subscriptionRevenue = (float) $subscriptionRevenueQuery->sum('amount');

        $fineRevenueQuery = Borrowing::where('fine_status', 'paid');
        $applyRange($fineRevenueQuery, 'updated_at');
        $fineRevenue = (float) $fineRevenueQuery->sum('fine_amount');

        $platformRevenue = $subscriptionRevenue + $fineRevenue;

        // 3. Library Status Breakdown
        $activeLibrariesCount = Library::where(function ($q) {
            $q->where('status', 'active')
              ->orWhereNull('status');
        })->count();
        $pendingLibrariesCount = Library::where('status', 'pending')->count();
        $inactiveLibrariesCount = Library::whereIn('status', ['inactive', 'suspended'])->count();

        // 4. Platform Activity Trend (Backend filtered based on chartRange)
        if ($chartRange === 'month') {
            // Weekly breakdown for current month (4 weeks)
            $startOfMonth = now()->startOfMonth();
            $activityTrend = collect(range(0, 3))->map(function ($weekIdx) use ($startOfMonth) {
                $wStart = (clone $startOfMonth)->addDays($weekIdx * 7);
                $wEnd = $weekIdx === 3 ? now()->endOfMonth() : (clone $wStart)->addDays(6)->endOfDay();
                $label = "W" . ($weekIdx + 1);

                $newLibs = Library::whereBetween('created_at', [$wStart, $wEnd])->count();
                $newMebs = User::where('role', 'member')->whereBetween('created_at', [$wStart, $wEnd])->count();
                $borrows = Borrowing::whereBetween('created_at', [$wStart, $wEnd])->count();

                return [
                    'month' => $label,
                    'Libraries' => $newLibs,
                    'Members' => $newMebs,
                    'Borrowings' => $borrows,
                ];
            })->values();
        } elseif ($chartRange === 'quarter') {
            // Last 3 months breakdown
            $activityTrend = collect(range(2, 0))->map(function ($i) {
                $date = Carbon::now()->subMonths($i);
                $year = $date->year;
                $month = $date->month;
                $monthName = $date->format('M');

                $newLibs = Library::whereYear('created_at', $year)->whereMonth('created_at', $month)->count();
                $newMebs = User::where('role', 'member')->whereYear('created_at', $year)->whereMonth('created_at', $month)->count();
                $borrows = Borrowing::whereYear('created_at', $year)->whereMonth('created_at', $month)->count();

                return [
                    'month' => $monthName,
                    'Libraries' => $newLibs,
                    'Members' => $newMebs,
                    'Borrowings' => $borrows,
                ];
            })->values();
        } else {
            // 'year' or default: 6 months trend
            $activityTrend = collect(range(5, 0))->map(function ($i) {
                $date = Carbon::now()->subMonths($i);
                $year = $date->year;
                $month = $date->month;
                $monthName = $date->format('M');

                $newLibs = Library::whereYear('created_at', $year)->whereMonth('created_at', $month)->count();
                $newMebs = User::where('role', 'member')->whereYear('created_at', $year)->whereMonth('created_at', $month)->count();
                $borrows = Borrowing::whereYear('created_at', $year)->whereMonth('created_at', $month)->count();

                return [
                    'month' => $monthName,
                    'Libraries' => $newLibs,
                    'Members' => $newMebs,
                    'Borrowings' => $borrows,
                ];
            })->values();
        }

        // 5. Recent Libraries (Latest 5)
        $recentLibraries = Library::with('owner:id,name,email')
            ->withCount('books')
            ->latest()
            ->limit(5)
            ->get();

        // 6. Pending Actions Calculation
        $expiringSubscriptions = Subscription::where('status', 'active')
            ->whereDate('end_date', '<=', Carbon::now()->addDays(7)->toDateString())
            ->whereDate('end_date', '>=', Carbon::now()->toDateString())
            ->count();

        $unpaidFinesCount = Borrowing::where('fine_status', 'unpaid')->count();

        $pendingActions = [];
        if ($pendingLibrariesCount > 0) {
          $pendingActions[] = [
            'id' => 'libraries',
            'type' => 'library',
            'title' => "{$pendingLibrariesCount} Libraries Pending Approval",
            'subtitle' => 'Review and activate new library branches',
            'link' => '/admin/libraries',
            'action' => 'Review →',
          ];
        }

        if ($expiringSubscriptions > 0) {
          $pendingActions[] = [
            'id' => 'subscriptions',
            'type' => 'subscription',
            'title' => "{$expiringSubscriptions} Subscriptions Expiring Soon",
            'subtitle' => 'Membership renewals requiring attention',
            'link' => '/admin/subscriptions',
            'action' => 'View →',
          ];
        }

        if ($unpaidFinesCount > 0) {
          $pendingActions[] = [
            'id' => 'fines',
            'type' => 'payment',
            'title' => "{$unpaidFinesCount} Unpaid Fines Pending Settlement",
            'subtitle' => 'Outstanding borrowing fines awaiting payment',
            'link' => '/admin/payments',
            'action' => 'Review →',
          ];
        }

        return response()->json([
            'data' => [
                'total_libraries' => $totalLibraries,
                'active_librarians' => $activeLibrarians,
                'total_members' => $totalMembers,
                'active_borrowings' => $activeBorrowings,
                'platform_revenue' => round($platformRevenue, 2),
                'subscription_revenue' => round($subscriptionRevenue, 2),
                'fine_revenue' => round($fineRevenue, 2),
                'library_status' => [
                    'active' => $activeLibrariesCount,
                    'pending' => $pendingLibrariesCount,
                    'inactive' => $inactiveLibrariesCount,
                ],
                'activity_trend' => $activityTrend,
                'recent_libraries' => $recentLibraries,
                'pending_actions' => $pendingActions,
            ]
        ]);
    }

    public function libraries(Request $request)
    {
        $query = Library::with(['owner:id,name,email,phone,avatar,status', 'owner.subscriptions.plan'])
            ->withCount(['books', 'borrowings'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhereHas('owner', function ($owner) use ($search) {
                            $owner->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('subscription') && $request->input('subscription') !== 'all', function ($query) use ($request) {
                $subscription = $request->input('subscription');
                if ($subscription === 'active') {
                    $query->whereHas('owner.subscriptions', fn ($q) => $q->where('status', 'active'));
                } elseif ($subscription === 'expired') {
                    $query->whereHas('owner.subscriptions', fn ($q) => $q->whereIn('status', ['expired', 'cancelled']));
                } elseif ($subscription === 'trial') {
                    $query->whereHas('owner.subscriptions', fn ($q) => $q->where('status', 'trial'));
                }
            })
            ->latest();

        $summary = [
            'total' => Library::count(),
            'active' => Library::where('status', 'active')->count(),
            'pending' => Library::where('status', 'pending')->count(),
            'inactive' => Library::whereIn('status', ['inactive', 'suspended'])->count(),
        ];

        if ((int) $request->input('per_page') === -1) {
            return response()->json(['data' => $query->get(), 'summary' => $summary]);
        }

        $paginator = $query->paginate($this->perPage($request));

        return $this->paginatedResponse($paginator, $summary);
    }

    public function library(int $id)
    {
        $library = Library::with([
            'owner:id,name,email,phone,avatar,status',
            'owner.subscriptions.plan',
            'books.category',
            'borrowings' => function ($q) {
                $q->with(['user:id,name,email', 'book:id,title,cover_image'])->latest()->limit(10);
            }
        ])
        ->withCount(['books', 'borrowings'])
        ->findOrFail($id);

        return response()->json(['data' => $library]);
    }

    public function storeLibrary(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'status' => ['required', 'in:active,pending,inactive,suspended'],
        ]);

        if (($validated['status'] ?? '') === 'active' && !empty($validated['owner_id'])) {
            $owner = User::find($validated['owner_id']);
            if ($owner && !$owner->hasActiveSubscription()) {
                return response()->json([
                    'message' => 'Cannot activate library: Assigned librarian does not have an active subscription.',
                ], 422);
            }
        }

        $library = Library::create($validated);

        return response()->json([
            'message' => 'Library created successfully.',
            'data' => $library->load(['owner:id,name,email']),
        ], 201);
    }

    public function updateLibrary(Request $request, int $id)
    {
        $library = Library::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'owner_id' => ['nullable', 'exists:users,id'],
            'status' => ['sometimes', 'required', 'in:active,pending,inactive,suspended'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'active' && !empty($validated['owner_id'] ?? $library->owner_id)) {
            $owner = User::find($validated['owner_id'] ?? $library->owner_id);
            if ($owner && !$owner->hasActiveSubscription()) {
                return response()->json([
                    'message' => 'Cannot activate library: Assigned librarian does not have an active subscription.',
                ], 422);
            }
        }

        $library->update($validated);

        return response()->json([
            'message' => 'Library updated successfully.',
            'data' => $library->fresh()->load('owner:id,name,email'),
        ]);
    }

    public function updateLibraryStatus(Request $request, int $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:active,inactive,pending,suspended'],
            'rejection_reason' => ['nullable', 'string'],
        ]);
        $library = Library::findOrFail($id);

        if ($validated['status'] === 'active' && $library->owner_id) {
            $owner = User::find($library->owner_id);
            if ($owner && !$owner->hasActiveSubscription()) {
                return response()->json([
                    'message' => 'Cannot activate library: Assigned librarian does not have an active subscription.',
                ], 422);
            }
        }

        $updateData = ['status' => $validated['status']];
        if (array_key_exists('rejection_reason', $validated)) {
            $updateData['rejection_reason'] = $validated['rejection_reason'];
        }

        $library->update($updateData);

        return response()->json([
            'message' => 'Library status updated to ' . $validated['status'] . '.',
            'data' => $library->fresh()->load('owner:id,name,email'),
        ]);
    }

    public function librarians(Request $request)
    {
        $query = $this->usersByRole($request, 'librarian')->with('library', 'subscriptions.plan');
        $summary = [
            'total' => User::where('role', 'librarian')->count(),
            'active' => User::where('role', 'librarian')->where('status', 'active')->count(),
            'inactive' => User::where('role', 'librarian')->whereIn('status', ['inactive', 'suspended'])->count(),
            'unassigned' => User::where('role', 'librarian')->doesntHave('library')->count(),
        ];

        $paginator = $query->paginate($this->perPage($request));
        return $this->paginatedResponse($paginator, $summary);
    }

    public function librarian(int $id)
    {
        $user = User::where('role', 'librarian')->with('library', 'subscriptions.plan')->findOrFail($id);
        return response()->json(['data' => $user]);
    }

    public function storeLibrarian(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'library_id' => ['nullable', 'exists:libraries,id'],
            'status' => ['nullable', 'in:active,inactive,suspended'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'role' => 'librarian',
            'status' => $validated['status'] ?? 'active',
        ]);

        if (!empty($validated['library_id'])) {
            Library::where('id', $validated['library_id'])->update(['owner_id' => $user->id]);
        }

        return response()->json([
            'message' => 'Librarian account created successfully.',
            'data' => $user->load(['library', 'subscriptions.plan']),
        ], 201);
    }

    public function updateLibrarian(Request $request, int $id)
    {
        $user = User::where('role', 'librarian')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'required', 'in:active,inactive,suspended'],
            'library_id' => ['nullable'],
        ]);

        $user->update(array_filter([
            'name' => $validated['name'] ?? $user->name,
            'phone' => array_key_exists('phone', $validated) ? $validated['phone'] : $user->phone,
            'status' => $validated['status'] ?? $user->status,
        ]));

        if (array_key_exists('library_id', $validated)) {
            // Remove previous library ownership
            Library::where('owner_id', $user->id)->update(['owner_id' => null]);
            if ($validated['library_id']) {
                Library::where('id', $validated['library_id'])->update(['owner_id' => $user->id]);
            }
        }

        return response()->json([
            'message' => 'Librarian account updated successfully.',
            'data' => $user->fresh()->load(['library', 'subscriptions.plan']),
        ]);
    }

    public function members(Request $request)
    {
        $query = User::where('role', 'member')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            })
            ->when($request->filled('library') && $request->input('library') !== 'all', function ($query) use ($request) {
                if ($request->input('library') === 'no_library') {
                    $query->doesntHave('borrowings');
                } else {
                    $query->whereHas('borrowings.library', fn ($q) => $q->where('libraries.id', $request->input('library')));
                }
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('borrowing') && $request->input('borrowing') !== 'all', function ($query) use ($request) {
                $borrowing = $request->input('borrowing');
                $activeStatuses = ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested'];
                if ($borrowing === 'active') {
                    $query->whereHas('borrowings', fn ($q) => $q->whereIn('status', $activeStatuses));
                } elseif ($borrowing === 'no_active') {
                    $query->whereDoesntHave('borrowings', fn ($q) => $q->whereIn('status', $activeStatuses));
                } elseif ($borrowing === 'overdue') {
                    $query->whereHas('borrowings', function ($q) {
                        $q->where('status', 'overdue')
                            ->orWhere(function ($overdue) {
                                $overdue->whereIn('status', ['borrowed', 'picked_up'])
                                    ->whereNotNull('due_date')
                                    ->whereDate('due_date', '<', today());
                            });
                    });
                }
            })
            ->with(['borrowings' => function ($q) {
                $q->select('id', 'user_id', 'book_id', 'library_id', 'status', 'due_date');
            }, 'borrowings.library:id,name'])
            ->withCount('borrowings')
            ->latest();

        $summary = [
            'total' => User::where('role', 'member')->count(),
            'active' => User::where('role', 'member')->where('status', 'active')->count(),
            'inactive' => User::where('role', 'member')->whereIn('status', ['inactive', 'suspended'])->count(),
            'with_borrowings' => User::where('role', 'member')->whereHas('borrowings', fn ($q) => $q->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested']))->count(),
        ];

        $paginator = $query->paginate($this->perPage($request));
        $paginator->setCollection($paginator->getCollection()->map(function ($m) {
                $activeBorrows = $m->borrowings->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested']);
                $overdueBorrows = $m->borrowings->filter(function ($b) {
                    return $b->status === 'overdue' || (in_array($b->status, ['borrowed', 'picked_up']) && $b->due_date && Carbon::parse($b->due_date)->isPast());
                });

                $m->active_borrowings_count = $activeBorrows->count();
                $m->overdue_borrowings_count = $overdueBorrows->count();
                $m->assigned_library_name = $m->borrowings->first()?->library?->name ?? null;
                return $m;
            }));

        return $this->paginatedResponse($paginator, $summary);
    }

    public function member(int $id)
    {
        $user = User::where('role', 'member')
            ->with([
                'borrowings' => function ($q) {
                    $q->with(['book:id,title,cover_image,author', 'library:id,name'])->latest();
                }
            ])
            ->withCount('borrowings')
            ->findOrFail($id);

        $activeBorrows = $user->borrowings->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue', 'return_requested']);
        $overdueBorrows = $user->borrowings->filter(function ($b) {
            return $b->status === 'overdue' || (in_array($b->status, ['borrowed', 'picked_up']) && $b->due_date && Carbon::parse($b->due_date)->isPast());
        });

        $user->active_borrowings_count = $activeBorrows->count();
        $user->overdue_borrowings_count = $overdueBorrows->count();
        $user->primary_library = $user->borrowings->first()?->library ?? null;

        return response()->json(['data' => $user]);
    }

    public function updateUserStatus(Request $request, User $user)
    {
        $validated = $request->validate(['status' => ['required', 'in:active,inactive,suspended']]);

        if ($user->role === 'admin' || $user->id === $request->user()->id) {
            return response()->json(['message' => 'This administrator account cannot be changed here.'], 403);
        }

        $user->update(['status' => $validated['status']]);

        if (in_array($validated['status'], ['inactive', 'suspended'])) {
            $user->tokens()->delete();
        }

        return response()->json(['message' => 'Account status updated.', 'data' => $user]);
    }

    public function subscriptions(Request $request)
    {
        $query = Subscription::with([
            'user:id,name,email,avatar',
            'user.library:id,owner_id,name,image,address',
            'plan',
            'payments'
        ])
        ->when($request->filled('search'), function ($query) use ($request) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                    ->orWhereHas('user.library', fn ($library) => $library->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('plan', fn ($plan) => $plan->where('name', 'like', "%{$search}%"));
            });
        })
        ->when($request->filled('plan') && $request->input('plan') !== 'all', fn ($query) => $query->where('plan_id', $request->input('plan')))
        ->when($request->filled('status') && $request->input('status') !== 'all', function ($query) use ($request) {
            $status = $request->input('status');
            if ($status === 'expiring_soon') {
                $query->where('status', 'active')->whereBetween('end_date', [today(), now()->addDays(7)->toDateString()]);
            } elseif ($status === 'expired') {
                $query->where(fn ($q) => $q->where('status', 'expired')->orWhere(fn ($active) => $active->where('status', 'active')->whereDate('end_date', '<', today())));
            } elseif ($status === 'active') {
                $query->where('status', 'active')->where(fn ($q) => $q->whereNull('end_date')->orWhereDate('end_date', '>', now()->addDays(7)->toDateString()));
            } else {
                $query->where('status', $status);
            }
        })
        ->when($request->filled('date') && $request->input('date') !== 'all', function ($query) use ($request) {
            $this->applyDateFilter($query, $request->input('date'));
        })
        ->latest();

        $summarySubscriptions = Subscription::with(['payments:id,subscription_id,amount,status', 'plan:id,price'])->get();
        $summary = [
            'total' => $summarySubscriptions->count(),
            'active' => $summarySubscriptions->filter(fn ($s) => $this->subscriptionDisplayStatus($s) === 'active')->count(),
            'expiring' => $summarySubscriptions->filter(fn ($s) => $this->subscriptionDisplayStatus($s) === 'expiring_soon')->count(),
            'expired' => $summarySubscriptions->filter(fn ($s) => in_array($this->subscriptionDisplayStatus($s), ['expired', 'cancelled']))->count(),
            'revenue' => round((float) Payment::whereIn('status', ['paid', 'success', 'completed'])->sum('amount'), 2),
        ];

        $paginator = $query->paginate($this->perPage($request));
        $paginator->setCollection($paginator->getCollection()->map(function ($s) {
            $s->calculated_status = $this->subscriptionDisplayStatus($s);
            return $s;
        }));
        return $this->paginatedResponse($paginator, $summary);
    }

    public function subscription(int $id)
    {
        $subscription = Subscription::with([
            'user:id,name,email,phone,avatar,status',
            'user.library:id,owner_id,name,image,address,status',
            'plan',
            'payments'
        ])
        ->findOrFail($id);

        return response()->json(['data' => $subscription]);
    }

    public function payments(Request $request)
    {
        $subscriptionQuery = Payment::with([
            'user:id,name,email,avatar',
            'user.library:id,owner_id,name,image',
            'subscription.plan'
        ]);

        $fineQuery = Borrowing::where('fine_amount', '>', 0)
            ->with([
                'user:id,name,email,avatar',
                'library:id,name,image',
                'book:id,title,cover_image'
            ]);

        $this->applyPaymentFilters($subscriptionQuery, $fineQuery, $request);

        $perPage = $this->perPage($request);
        $currentPage = max(1, (int) $request->input('page', 1));
        $offset = ($currentPage - 1) * $perPage;

        // Global summary aggregates calculated via database queries
        $subscriptionRevenue = (float) (clone $subscriptionQuery)->whereIn('status', ['paid', 'success', 'completed'])->sum('amount');
        $fineRevenue = (float) (clone $fineQuery)->where('fine_status', 'paid')->sum('fine_amount');
        $pendingSubscriptionQuery = (clone $subscriptionQuery)->where('status', 'pending');
        $pendingFineQuery = (clone $fineQuery)->where('fine_status', 'pending');
        $pendingCount = $pendingSubscriptionQuery->count() + $pendingFineQuery->count();
        $pendingTotal = (float) $pendingSubscriptionQuery->sum('amount') + (float) $pendingFineQuery->sum('fine_amount');

        $type = $request->input('type', 'all');

        if ($type === 'subscription') {
            $total = (clone $subscriptionQuery)->count();
            $rawPayments = (clone $subscriptionQuery)->latest()->offset($offset)->limit($perPage)->get();
            $payments = $rawPayments->map(function ($p) {
                return [
                    'id' => $p->transaction_id ? $p->transaction_id : 'SUB-' . $p->id,
                    'raw_id' => $p->id,
                    'type' => 'subscription',
                    'user_id' => $p->user_id,
                    'payer_name' => $p->user?->name ?? 'Librarian',
                    'payer_email' => $p->user?->email,
                    'user' => $p->user,
                    'library_name' => $p->user?->library?->name ?? 'Library Branch',
                    'library' => $p->user?->library,
                    'amount' => (float) $p->amount,
                    'payment_method' => $p->payment_method ? ucfirst($p->payment_method) : 'Card / Bank',
                    'transaction_id' => $p->transaction_id ? $p->transaction_id : 'SUB-' . $p->id,
                    'status' => $p->status ?? 'paid',
                    'created_at' => $p->created_at,
                    'paid_at' => $p->paid_at ?? $p->created_at,
                ];
            });
        } elseif ($type === 'fine') {
            $total = (clone $fineQuery)->count();
            $rawFines = (clone $fineQuery)->latest('updated_at')->offset($offset)->limit($perPage)->get();
            $payments = $rawFines->map(function ($b) {
                return [
                    'id' => 'FINE-' . $b->id,
                    'raw_id' => $b->id,
                    'type' => 'fine',
                    'user_id' => $b->user_id,
                    'payer_name' => $b->user?->name ?? 'Member',
                    'payer_email' => $b->user?->email,
                    'user' => $b->user,
                    'library_name' => $b->library?->name ?? 'Library Branch',
                    'library' => $b->library,
                    'book' => $b->book,
                    'amount' => (float) $b->fine_amount,
                    'payment_method' => 'Overdue Fine Settlement',
                    'transaction_id' => 'FINE-REF-' . $b->id,
                    'status' => $b->fine_status === 'paid' ? 'paid' : ($b->fine_status === 'pending' ? 'pending' : 'unpaid'),
                    'created_at' => $b->updated_at ?? $b->created_at,
                    'paid_at' => $b->fine_status === 'paid' ? ($b->updated_at ?? $b->created_at) : null,
                ];
            });
        } else {
            // Type === 'all': Efficient DB UNION for page keys
            $subBuilder = (clone $subscriptionQuery)->select([
                'id as item_id',
                DB::raw("'subscription' as item_type"),
                DB::raw("COALESCE(paid_at, created_at) as sort_date")
            ])->toBase();

            $fineBuilder = (clone $fineQuery)->select([
                'id as item_id',
                DB::raw("'fine' as item_type"),
                DB::raw("COALESCE(updated_at, created_at) as sort_date")
            ])->toBase();

            $unionQuery = $subBuilder->unionAll($fineBuilder);

            $total = DB::table($unionQuery, 'combined')->count();

            $pageKeys = DB::table($unionQuery, 'combined')
                ->orderByDesc('sort_date')
                ->offset($offset)
                ->limit($perPage)
                ->get();

            $subIds = $pageKeys->where('item_type', 'subscription')->pluck('item_id')->toArray();
            $fineIds = $pageKeys->where('item_type', 'fine')->pluck('item_id')->toArray();

            $subModels = !empty($subIds)
                ? Payment::with([
                    'user:id,name,email,avatar',
                    'user.library:id,owner_id,name,image',
                    'subscription.plan'
                ])->whereIn('id', $subIds)->get()->keyBy('id')
                : collect();

            $fineModels = !empty($fineIds)
                ? Borrowing::with([
                    'user:id,name,email,avatar',
                    'library:id,name,image',
                    'book:id,title,cover_image'
                ])->whereIn('id', $fineIds)->get()->keyBy('id')
                : collect();

            $payments = $pageKeys->map(function ($key) use ($subModels, $fineModels) {
                if ($key->item_type === 'subscription') {
                    $p = $subModels->get($key->item_id);
                    if (!$p) return null;
                    return [
                        'id' => $p->transaction_id ? $p->transaction_id : 'SUB-' . $p->id,
                        'raw_id' => $p->id,
                        'type' => 'subscription',
                        'user_id' => $p->user_id,
                        'payer_name' => $p->user?->name ?? 'Librarian',
                        'payer_email' => $p->user?->email,
                        'user' => $p->user,
                        'library_name' => $p->user?->library?->name ?? 'Library Branch',
                        'library' => $p->user?->library,
                        'amount' => (float) $p->amount,
                        'payment_method' => $p->payment_method ? ucfirst($p->payment_method) : 'Card / Bank',
                        'transaction_id' => $p->transaction_id ? $p->transaction_id : 'SUB-' . $p->id,
                        'status' => $p->status ?? 'paid',
                        'created_at' => $p->created_at,
                        'paid_at' => $p->paid_at ?? $p->created_at,
                    ];
                } else {
                    $b = $fineModels->get($key->item_id);
                    if (!$b) return null;
                    return [
                        'id' => 'FINE-' . $b->id,
                        'raw_id' => $b->id,
                        'type' => 'fine',
                        'user_id' => $b->user_id,
                        'payer_name' => $b->user?->name ?? 'Member',
                        'payer_email' => $b->user?->email,
                        'user' => $b->user,
                        'library_name' => $b->library?->name ?? 'Library Branch',
                        'library' => $b->library,
                        'book' => $b->book,
                        'amount' => (float) $b->fine_amount,
                        'payment_method' => 'Overdue Fine Settlement',
                        'transaction_id' => 'FINE-REF-' . $b->id,
                        'status' => $b->fine_status === 'paid' ? 'paid' : ($b->fine_status === 'pending' ? 'pending' : 'unpaid'),
                        'created_at' => $b->updated_at ?? $b->created_at,
                        'paid_at' => $b->fine_status === 'paid' ? ($b->updated_at ?? $b->created_at) : null,
                    ];
                }
            })->filter()->values();
        }

        $revenueTrend = collect(range(5, 0))->map(function ($i) {
            $date = now()->subMonths($i);
            $subRev = (float) Payment::whereIn('status', ['paid', 'success', 'completed'])
                ->whereMonth(DB::raw('COALESCE(paid_at, created_at)'), $date->month)
                ->whereYear(DB::raw('COALESCE(paid_at, created_at)'), $date->year)
                ->sum('amount');
            $fineRev = (float) Borrowing::where('fine_status', 'paid')
                ->whereMonth(DB::raw('COALESCE(updated_at, created_at)'), $date->month)
                ->whereYear(DB::raw('COALESCE(updated_at, created_at)'), $date->year)
                ->sum('fine_amount');
            return [
                'month' => $date->format('M'),
                'Subscriptions' => round($subRev, 2),
                'Fines' => round($fineRev, 2),
                'Total' => round($subRev + $fineRev, 2),
            ];
        })->values();

        return response()->json([
            'data' => [
                'payments' => $payments,
            ],
            'meta' => [
                'current_page' => $currentPage,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total > 0 ? $offset + 1 : null,
                'to' => $total > 0 ? min($offset + $perPage, $total) : null,
            ],
            'summary' => [
                'total_revenue' => round($subscriptionRevenue + $fineRevenue, 2),
                'subscription_revenue' => round($subscriptionRevenue, 2),
                'fine_revenue' => round($fineRevenue, 2),
                'pending_count' => $pendingCount,
                'pending_total' => round($pendingTotal, 2),
                'revenue_trend' => $revenueTrend,
            ],
        ]);
    }

    public function payment(string $id)
    {
        if (str_starts_with($id, 'FINE-')) {
            $borrowingId = (int) str_replace('FINE-', '', $id);
            $borrowing = Borrowing::with([
                'user:id,name,email,phone,avatar',
                'library:id,name,image,address',
                'book:id,title,cover_image,author'
            ])->findOrFail($borrowingId);

            return response()->json([
                'data' => [
                    'id' => 'FINE-' . $borrowing->id,
                    'type' => 'fine',
                    'user' => $borrowing->user,
                    'library' => $borrowing->library,
                    'book' => $borrowing->book,
                    'borrowing' => $borrowing,
                    'amount' => (float) $borrowing->fine_amount,
                    'payment_method' => 'Overdue Fine Settlement',
                    'transaction_id' => 'FINE-REF-' . $borrowing->id,
                    'status' => $borrowing->fine_status === 'paid' ? 'paid' : ($borrowing->fine_status === 'pending' ? 'pending' : 'unpaid'),
                    'created_at' => $borrowing->updated_at ?? $borrowing->created_at,
                ]
            ]);
        }

        $numericId = (int) preg_replace('/[^0-9]/', '', $id);
        $payment = Payment::with([
            'user:id,name,email,phone,avatar',
            'user.library:id,owner_id,name,image,address',
            'subscription.plan'
        ])
        ->where('id', $id)
        ->orWhere('transaction_id', $id)
        ->when($numericId > 0, fn ($q) => $q->orWhere('id', $numericId))
        ->firstOrFail();

        $payment->type = 'subscription';
        return response()->json(['data' => $payment]);
    }

    public function plans()
    {
        return response()->json(['data' => SubscriptionPlan::withCount('subscriptions')->latest()->get()]);
    }

    public function storePlan(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:subscription_plans,name'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);
        return response()->json(['message' => 'Plan created.', 'data' => SubscriptionPlan::create($validated)], 201);
    }

    public function updatePlan(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:subscription_plans,name,'.$plan->id],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_days' => ['required', 'integer', 'min:1'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'string', 'in:active,closed,archived,inactive'],
        ]);
        $plan->update($validated);
        return response()->json(['message' => 'Plan updated.', 'data' => $plan->fresh()]);
    }

    public function archivePlan(SubscriptionPlan $plan)
    {
        $plan->update(['status' => 'archived']);
        return response()->json(['message' => 'Plan archived.', 'data' => $plan->fresh()]);
    }

    public function deletePlan(SubscriptionPlan $plan)
    {
        if ($plan->subscriptions()->exists()) {
            return response()->json([
                'message' => 'Cannot delete subscription plan because it is referenced by existing subscriptions. Please archive/deactivate the plan instead.',
                'can_archive' => true,
            ], 422);
        }

        $plan->delete();
        return response()->json(['message' => 'Subscription plan deleted successfully.']);
    }

    public function storeSubscription(Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'plan_id' => ['required', 'integer', 'exists:subscription_plans,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'status' => ['required', 'string', 'in:active,expired,cancelled,pending'],
        ]);

        $user = User::findOrFail($validated['user_id']);
        if ($user->role !== 'librarian') {
            return response()->json([
                'message' => 'Selected user must be a librarian.',
                'errors' => ['user_id' => ['Selected user must have role = librarian.']],
            ], 422);
        }

        $plan = SubscriptionPlan::findOrFail($validated['plan_id']);

        if ($validated['status'] === 'active') {
            Subscription::where('user_id', $user->id)
                ->where('status', 'active')
                ->update(['status' => 'cancelled']);
        }

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Subscription created successfully.',
            'data' => $subscription->load(['user:id,name,email,avatar', 'plan']),
        ], 201);
    }

    public function updateSubscription(Request $request, int $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'plan_id' => ['sometimes', 'required', 'integer', 'exists:subscription_plans,id'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'status' => ['sometimes', 'required', 'string', 'in:active,expired,cancelled,pending'],
        ]);

        if ($subscription->user && $subscription->user->role !== 'librarian') {
            return response()->json([
                'message' => 'Subscriptions can only belong to librarians.',
            ], 422);
        }

        $subscription->update($validated);

        return response()->json([
            'message' => 'Subscription updated successfully.',
            'data' => $subscription->fresh()->load(['user:id,name,email,avatar', 'plan']),
        ]);
    }

    public function cancelSubscription(int $id)
    {
        $subscription = Subscription::findOrFail($id);
        $subscription->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Subscription cancelled successfully.',
            'data' => $subscription->fresh(),
        ]);
    }

    public function deleteSubscription(int $id)
    {
        $subscription = Subscription::findOrFail($id);

        if ($subscription->payments()->exists()) {
            return response()->json([
                'message' => 'Cannot delete subscription with existing payment records. Please cancel or deactivate instead.',
            ], 422);
        }

        $subscription->delete();

        return response()->json([
            'message' => 'Subscription record deleted.',
        ]);
    }

    public function notifications(Request $request)
    {
        $dbNotifications = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($n) {
                $data = is_string($n->data) ? (json_decode($n->data, true) ?: ['message' => $n->data]) : $n->data;

                $targetUrl = $data['target_url'] ?? null;
                if (isset($data['subscription_id']) && ($targetUrl === '/admin/subscriptions' || !$targetUrl)) {
                    $targetUrl = '/admin/subscriptions/' . $data['subscription_id'];
                } elseif (isset($data['library_id']) && ($targetUrl === '/admin/libraries' || !$targetUrl)) {
                    $targetUrl = '/admin/libraries/' . $data['library_id'];
                } elseif (isset($data['payment_id']) && ($targetUrl === '/admin/payments' || !$targetUrl)) {
                    $targetUrl = '/admin/payments/' . $data['payment_id'];
                } elseif (isset($data['librarian_id']) && ($targetUrl === '/admin/librarians' || !$targetUrl)) {
                    $targetUrl = '/admin/librarians/' . $data['librarian_id'];
                } elseif (isset($data['member_id']) && ($targetUrl === '/admin/members' || !$targetUrl)) {
                    $targetUrl = '/admin/members/' . $data['member_id'];
                }

                return [
                    'id' => $n->id,
                    'title' => $data['title'] ?? 'System Notification',
                    'message' => $data['message'] ?? '',
                    'type' => $data['type'] ?? 'system',
                    'priority' => $data['priority'] ?? 'low',
                    'is_read' => $n->read_at !== null,
                    'is_persistent' => true,
                    'target_url' => $targetUrl,
                    'created_at' => $n->created_at,
                ];
            });

        $systemAlerts = collect();

        // 1. Pending Libraries
        $pendingLibraries = Library::where('status', 'pending')->latest()->get();
        foreach ($pendingLibraries as $lib) {
            $systemAlerts->push([
                'id' => 'LIB-APPROVAL-' . $lib->id,
                'title' => '🏛️ New Library Requires Review',
                'message' => "Library '{$lib->name}' was created and is waiting for administrator approval.",
                'type' => 'library',
                'priority' => 'medium',
                'is_read' => false,
                'is_persistent' => false,
                'target_url' => "/admin/libraries/{$lib->id}",
                'created_at' => $lib->created_at,
            ]);
        }

        // 2. Subscriptions (Expiring & Expired)
        $subscriptions = Subscription::with(['user.library', 'plan'])->where('status', 'active')->get();
        foreach ($subscriptions as $sub) {
            if (!$sub->end_date) continue;
            $endDate = Carbon::parse($sub->end_date);
            $diffDays = (int) ceil(now()->diffInDays($endDate, false));
            $libName = $sub->user?->library?->name ?? 'Library Branch';

            if ($diffDays <= 7 && $diffDays >= 0) {
                $systemAlerts->push([
                    'id' => 'SUB-EXPIRING-' . $sub->id,
                    'title' => '⏳ Subscription Expiring Soon',
                    'message' => "Subscription for '{$libName}' will expire in {$diffDays} day(s).",
                    'type' => 'subscription',
                    'priority' => 'medium',
                    'is_read' => false,
                    'is_persistent' => false,
                    'target_url' => "/admin/subscriptions/{$sub->id}",
                    'created_at' => $sub->updated_at ?? $sub->created_at,
                ]);
            } else if ($diffDays < 0) {
                $systemAlerts->push([
                    'id' => 'SUB-EXPIRED-' . $sub->id,
                    'title' => '⚠️ Subscription Expired',
                    'message' => "Subscription for '{$libName}' has expired.",
                    'type' => 'subscription',
                    'priority' => 'high',
                    'is_read' => false,
                    'is_persistent' => false,
                    'target_url' => "/admin/subscriptions/{$sub->id}",
                    'created_at' => $sub->end_date,
                ]);
            }
        }

        // 3. Pending Payments
        $pendingFines = Borrowing::where('fine_status', 'pending')->latest()->get();
        foreach ($pendingFines as $fine) {
            $systemAlerts->push([
                'id' => 'FINE-PENDING-' . $fine->id,
                'title' => '💳 Fine Payment Pending',
                'message' => "Member fine payment of \${$fine->fine_amount} is awaiting verification.",
                'type' => 'payment',
                'priority' => 'medium',
                'is_read' => false,
                'is_persistent' => false,
                'target_url' => "/admin/payments/FINE-{$fine->id}",
                'created_at' => $fine->updated_at ?? $fine->created_at,
            ]);
        }

        $allNotifications = $dbNotifications->concat($systemAlerts)->sortByDesc('created_at')->values();
        $status = $request->input('status', 'all');
        $type = $request->input('type', 'all');
        $priority = $request->input('priority', 'all');
        $filteredNotifications = $allNotifications->filter(function ($notification) use ($status, $type, $priority) {
            $matchesStatus = $status === 'all'
                || ($status === 'unread' && !$notification['is_read'])
                || ($status === 'read' && $notification['is_read']);
            $matchesType = $type === 'all' || $notification['type'] === $type;
            $matchesPriority = $priority === 'all' || $notification['priority'] === $priority;
            return $matchesStatus && $matchesType && $matchesPriority;
        })->values();

        $perPage = $this->perPage($request);
        $currentPage = max(1, (int) $request->input('page', 1));
        $total = $filteredNotifications->count();
        $offset = ($currentPage - 1) * $perPage;

        return response()->json([
            'data' => $filteredNotifications->slice($offset, $perPage)->values(),
            'meta' => [
                'current_page' => $currentPage,
                'last_page' => max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total > 0 ? $offset + 1 : null,
                'to' => $total > 0 ? min($offset + $perPage, $total) : null,
            ],
            'unread_count' => $dbNotifications->where('is_read', false)->count(),
            'summary' => [
                'total' => $allNotifications->count(),
                'unread' => $allNotifications->where('is_read', false)->count(),
                'requires_attention' => $allNotifications->filter(fn ($notification) => !$notification['is_read'] && in_array($notification['priority'], ['high', 'medium']))->count(),
                'today' => $allNotifications->filter(fn ($notification) => $notification['created_at'] && Carbon::parse($notification['created_at'])->isToday())->count(),
            ],
        ]);
    }

    public function report()
    {
        return response()->json(['data' => [
            'libraries' => Library::count(),
            'librarians' => User::where('role', 'librarian')->count(),
            'members' => User::where('role', 'member')->count(),
            'books' => Book::count(),
            'borrowings' => Borrowing::count(),
            'overdue_summary' => Borrowing::where(function ($q) {
                $q->where('status', 'overdue')
                  ->orWhere(function ($sub) {
                      $sub->whereIn('status', ['borrowed', 'picked_up'])
                          ->whereDate('due_date', '<', today());
                  });
            })->count(),
        ]]);
    }

    private function usersByRole(Request $request, string $role)
    {
        return User::where('role', $role)
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->string('search')->toString();
                $query->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
            })
            ->when($request->filled('status') && $request->input('status') !== 'all', fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('library') && $request->input('library') !== 'all', function ($query) use ($request) {
                if ($request->input('library') === 'unassigned') {
                    $query->doesntHave('library');
                } else {
                    $query->whereHas('library', fn ($library) => $library->whereKey($request->input('library')));
                }
            })
            ->latest();
    }

    private function perPage(Request $request): int
    {
        $requested = (int) $request->input('per_page', 10);
        return in_array($requested, [10, 25, 50], true) ? $requested : 10;
    }

    private function paginatedResponse($paginator, array $summary = [])
    {
        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
            'summary' => $summary,
        ]);
    }

    private function subscriptionDisplayStatus($subscription): string
    {
        if ($subscription->status === 'active' && $subscription->end_date) {
            $diffDays = (int) ceil(now()->diffInDays(Carbon::parse($subscription->end_date), false));
            if ($diffDays < 0) return 'expired';
            if ($diffDays <= 7) return 'expiring_soon';
        }

        return $subscription->status ?: 'active';
    }

    private function applyDateFilter($query, string $dateFilter, $column = 'created_at'): void
    {
        if ($dateFilter === 'month') {
            $query->whereMonth($column, now()->month)->whereYear($column, now()->year);
        } elseif ($dateFilter === 'quarter') {
            $query->where($column, '>=', now()->subMonths(3));
        } elseif ($dateFilter === 'year') {
            $query->whereYear($column, now()->year);
        }
    }

    private function applyPaymentFilters($subscriptionQuery, $fineQuery, Request $request): void
    {
        $type = $request->input('type', 'all');
        $status = $request->input('status', 'all');
        $search = $request->string('search')->toString();
        $library = $request->input('library', 'all');
        $date = $request->input('date', 'all');

        if ($type === 'fine') {
            $subscriptionQuery->whereRaw('1 = 0');
        } else {
            $subscriptionQuery
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('transaction_id', 'like', "%{$search}%")
                            ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                            ->orWhereHas('user.library', fn ($lib) => $lib->where('name', 'like', "%{$search}%"));
                    });
                })
                ->when($library !== 'all', fn ($query) => $query->whereHas('user.library', fn ($lib) => $lib->where('name', $library)))
                ->when($date !== 'all', fn ($query) => $this->applyDateFilter($query, $date, DB::raw('COALESCE(paid_at, created_at)')));

            if ($status === 'paid') {
                $subscriptionQuery->whereIn('status', ['paid', 'success', 'completed']);
            } elseif ($status === 'pending') {
                $subscriptionQuery->where('status', 'pending');
            } elseif ($status === 'failed') {
                $subscriptionQuery->whereIn('status', ['failed', 'unpaid']);
            }
        }

        if ($type === 'subscription') {
            $fineQuery->whereRaw('1 = 0');
        } else {
            $fineQuery
                ->when($search !== '', function ($query) use ($search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('id', 'like', '%' . preg_replace('/[^0-9]/', '', $search) . '%')
                            ->orWhereHas('user', fn ($user) => $user->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                            ->orWhereHas('library', fn ($lib) => $lib->where('name', 'like', "%{$search}%"));
                    });
                })
                ->when($library !== 'all', fn ($query) => $query->whereHas('library', fn ($lib) => $lib->where('name', $library)))
                ->when($date !== 'all', fn ($query) => $this->applyDateFilter($query, $date, DB::raw('COALESCE(updated_at, created_at)')));

            if ($status === 'paid') {
                $fineQuery->where('fine_status', 'paid');
            } elseif ($status === 'pending') {
                $fineQuery->where('fine_status', 'pending');
            } elseif ($status === 'failed') {
                $fineQuery->whereIn('fine_status', ['unpaid', 'none', 'failed']);
            }
        }
    }
}
