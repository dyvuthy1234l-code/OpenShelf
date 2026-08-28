<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Borrowing;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    public function librarian(Request $request)
    {
        $library = $request->user()->library;
        if (!$library) {
            return response()->json(['message' => 'Create a library before viewing reports.'], 404);
        }

        $request->validate([
            'date_range' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $dateRange = $request->input('date_range');

        if ($dateRange) {
            if ($dateRange === 'today') {
                $startDate = Carbon::today()->toDateString();
                $endDate = Carbon::today()->toDateString();
            } elseif ($dateRange === 'month' || $dateRange === 'this_month') {
                $startDate = Carbon::now()->startOfMonth()->toDateString();
                $endDate = Carbon::now()->endOfMonth()->toDateString();
            } elseif ($dateRange === 'quarter' || $dateRange === '3_months' || $dateRange === '30_days' || $dateRange === '30days') {
                $startDate = Carbon::now()->subMonths(3)->startOfMonth()->toDateString();
                $endDate = Carbon::now()->toDateString();
            } elseif ($dateRange === 'year' || $dateRange === 'this_year') {
                $startDate = Carbon::now()->startOfYear()->toDateString();
                $endDate = Carbon::now()->endOfYear()->toDateString();
            } elseif ($dateRange === 'all') {
                $startDate = null;
                $endDate = null;
            }
        }

        $query = $library->borrowings()
            ->with(['user:id,name,email,avatar', 'book:id,title,category_id,cover_image', 'library:id,name,fine_per_day'])
            ->latest();

        if ($startDate) {
            $query->whereDate('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        $borrowings = $query->limit(500)->get();

        // Status Breakdown Counts from Database with optional date filter
        $baseQuery = function () use ($library, $startDate, $endDate) {
            $q = $library->borrowings();
            if ($startDate) $q->whereDate('created_at', '>=', $startDate);
            if ($endDate) $q->whereDate('created_at', '<=', $endDate);
            return $q;
        };

        $pendingCount = $baseQuery()->where('status', 'pending')->count();
        $approvedCount = $baseQuery()->where('status', 'approved')->count();
        $borrowedCount = $baseQuery()->whereIn('status', ['borrowed', 'picked_up'])->count();
        $returnedCount = $baseQuery()->where('status', 'returned')->count();
        $rejectedCount = $baseQuery()->where('status', 'rejected')->count();

        // Accurate Overdue Count (status === 'overdue' OR active borrowed/picked_up with due_date < today)
        $today = Carbon::today();
        $overdueQuery = function () use ($baseQuery, $today) {
            return $baseQuery()->where(function ($q) use ($today) {
                $q->where('status', 'overdue')
                  ->orWhere(function ($sub) use ($today) {
                      $sub->whereIn('status', ['borrowed', 'picked_up'])
                          ->whereDate('due_date', '<', $today);
                  });
            });
        };

        $overdueCount = $overdueQuery()->count();

        // Fine Financial Breakdown
        $collectedFines = (float) $baseQuery()->where('fine_status', 'paid')->sum('fine_amount');
        $fineRevenueToday = (float) $library->borrowings()->where('fine_status', 'paid')->whereDate('updated_at', Carbon::today())->sum('fine_amount');
        $fineRevenueThisMonth = (float) $library->borrowings()->where('fine_status', 'paid')->whereYear('updated_at', Carbon::now()->year)->whereMonth('updated_at', Carbon::now()->month)->sum('fine_amount');
        $unpaidFines = (float) $baseQuery()->where('fine_status', 'unpaid')->sum('fine_amount');
        $waivedFines = (float) $baseQuery()->where('fine_status', 'waived')->sum('fine_amount');

        // Real Monthly Circulation Data aggregated across last 6 months
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();

        $monthlyRequests = $library->borrowings()
            ->where('created_at', '>=', $sixMonthsAgo)
            ->selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, count(*) as total')
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($r) => $r->year . '-' . $r->month);

        $monthlyApproved = $library->borrowings()
            ->whereNotNull('approved_at')
            ->where('approved_at', '>=', $sixMonthsAgo)
            ->selectRaw('YEAR(approved_at) as year, MONTH(approved_at) as month, count(*) as total')
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($r) => $r->year . '-' . $r->month);

        $monthlyBorrowed = $library->borrowings()
            ->where(function ($q) use ($sixMonthsAgo) {
                $q->where('borrowed_at', '>=', $sixMonthsAgo)
                  ->orWhere(function ($sub) use ($sixMonthsAgo) {
                      $sub->whereIn('status', ['borrowed', 'picked_up'])
                          ->where('created_at', '>=', $sixMonthsAgo);
                  });
            })
            ->selectRaw('YEAR(COALESCE(borrowed_at, created_at)) as year, MONTH(COALESCE(borrowed_at, created_at)) as month, count(*) as total')
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($r) => $r->year . '-' . $r->month);

        $monthlyReturns = $library->borrowings()
            ->where('status', 'returned')
            ->where(function ($q) use ($sixMonthsAgo) {
                $q->where('returned_at', '>=', $sixMonthsAgo)
                  ->orWhere(function ($sub) use ($sixMonthsAgo) {
                      $sub->whereNull('returned_at')
                          ->where('updated_at', '>=', $sixMonthsAgo);
                  });
            })
            ->selectRaw('YEAR(COALESCE(returned_at, updated_at)) as year, MONTH(COALESCE(returned_at, updated_at)) as month, count(*) as total')
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($r) => $r->year . '-' . $r->month);

        $monthlyFines = $library->borrowings()
            ->where('fine_status', 'paid')
            ->where('updated_at', '>=', $sixMonthsAgo)
            ->selectRaw('YEAR(updated_at) as year, MONTH(updated_at) as month, sum(fine_amount) as total')
            ->groupBy('year', 'month')
            ->get()
            ->keyBy(fn ($r) => $r->year . '-' . $r->month);

        $lastMonths = collect(range(5, 0))->map(function ($i) use ($monthlyRequests, $monthlyApproved, $monthlyBorrowed, $monthlyReturns, $monthlyFines) {
            $date = Carbon::now()->subMonths($i);
            $year = $date->year;
            $month = $date->month;
            $key = $year . '-' . $month;
            $monthName = $date->format('M');

            return [
                'month' => $monthName,
                'Requests' => (int) ($monthlyRequests->get($key)->total ?? 0),
                'Approved' => (int) ($monthlyApproved->get($key)->total ?? 0),
                'Borrowed' => (int) ($monthlyBorrowed->get($key)->total ?? 0),
                'Returns' => (int) ($monthlyReturns->get($key)->total ?? 0),
                'FineRevenue' => round((float) ($monthlyFines->get($key)->total ?? 0), 2),
            ];
        })->values();

        $totalBooksCount = $library->books()->count();
        $totalCopies = (int) $library->books()->sum('quantity');
        $availableCopies = (int) $library->books()->selectRaw('SUM(COALESCE(available_quantity, quantity)) as total')->value('total');
        $activeBorrowingsCount = $baseQuery()->whereIn('status', ['borrowed', 'picked_up', 'overdue', 'return_requested'])->count();

        // Real Member Scoping with DB-level distinct count
        $totalMembersCount = $library->borrowings()->distinct('user_id')->count('user_id');
        $activeBorrowersCount = $library->borrowings()->whereIn('status', ['pending', 'approved', 'borrowed', 'picked_up', 'overdue'])->distinct('user_id')->count('user_id');

        // Recent Overdue Records for Operational Alerts (eager load library to avoid N+1 in current_fine)
        $overdueList = $overdueQuery()->with(['user:id,name,email', 'book:id,title', 'library:id,name,fine_per_day'])->limit(5)->get();

        // Top Active Members
        $topMembers = $library->borrowings()
            ->with('user:id,name,email,avatar')
            ->selectRaw('user_id, count(*) as borrowings_count, sum(case when status = "returned" then 1 else 0 end) as returned_count')
            ->groupBy('user_id')
            ->orderByDesc('borrowings_count')
            ->limit(5)
            ->get();

        // Category Distribution for Library Books
        $categoryDistribution = $library->books()
            ->join('categories', 'books.category_id', '=', 'categories.id')
            ->selectRaw('categories.id, categories.name, count(books.id) as count')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('count')
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'name' => $cat->name,
                    'count' => (int) $cat->count,
                ];
            });

        return response()->json([
            'data' => [
                'opening_time' => $library->opening_time,
                'closing_time' => $library->closing_time,
                'opening_hours' => $library->opening_hours,
                'total_books' => $totalBooksCount,
                'total_copies' => $totalCopies,
                'available_books' => $availableCopies,
                'total_members' => $totalMembersCount,
                'active_borrowers' => $activeBorrowersCount,
                'active_borrowings' => $activeBorrowingsCount,
                'pending_requests' => $pendingCount,
                'approved_requests' => $approvedCount,
                'borrowed_books' => $borrowedCount,
                'returned_books' => $returnedCount,
                'rejected_requests' => $rejectedCount,
                'overdue_books' => $overdueCount,
                'collected_fines' => round($collectedFines, 2),
                'fine_revenue_today' => round($fineRevenueToday, 2),
                'fine_revenue_this_month' => round($fineRevenueThisMonth, 2),
                'unpaid_fines' => round($unpaidFines, 2),
                'outstanding_fines' => round($unpaidFines, 2),
                'waived_fines' => round($waivedFines, 2),
                'status_breakdown' => [
                    ['name' => 'Pending', 'value' => $pendingCount, 'color' => '#d99a18'],
                    ['name' => 'Approved', 'value' => $approvedCount, 'color' => '#137333'],
                    ['name' => 'Borrowed', 'value' => $borrowedCount, 'color' => '#1a73e8'],
                    ['name' => 'Returned', 'value' => $returnedCount, 'color' => '#5f6368'],
                    ['name' => 'Rejected', 'value' => $rejectedCount, 'color' => '#c5221f'],
                ],
                'monthly_circulation' => $lastMonths,
                'category_distribution' => $categoryDistribution,
                'borrowing_history' => $borrowings,
                'overdue_list' => $overdueList,
                'top_members' => $topMembers,
            ]
        ]);
    }
}
