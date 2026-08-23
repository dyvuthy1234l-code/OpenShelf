<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Borrowing extends Model
{
    use HasFactory;

    protected $appends = ['current_fine', 'days_overdue', 'remaining_days', 'is_overdue'];

    protected $fillable = [
        'user_id',
        'book_id',
        'library_id',
        'requested_at',
        'approved_at',
        'picked_up_at',
        'borrowed_at',
        'due_date',
        'returned_at',
        'status',
        'fine_amount',
        'fine_status',
        'rejection_reason',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'borrowed_at' => 'datetime',
        'due_date' => 'date',
        'returned_at' => 'datetime',
        'fine_amount' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    public function library()
    {
        return $this->belongsTo(Library::class);
    }

    public function getCurrentFineAttribute(): float
    {
        if ($this->status === 'returned') {
            return (float) ($this->fine_amount ?? 0.00);
        }

        if (in_array($this->status, ['borrowed', 'picked_up', 'overdue', 'return_requested']) && $this->due_date) {
            $today = Carbon::today();
            $dueDate = Carbon::parse($this->due_date);
            if ($today->gt($dueDate)) {
                $daysOverdue = $today->diffInDays($dueDate);
                $finePerDay = $this->library ? (float) ($this->library->fine_per_day ?? 0.50) : 0.50;
                return round($daysOverdue * $finePerDay, 2);
            }
        }

        return (float) ($this->fine_amount ?? 0.00);
    }

    public function getDaysOverdueAttribute(): int
    {
        if ($this->status === 'returned' && $this->returned_at && $this->due_date) {
            $returnedDate = Carbon::parse($this->returned_at)->startOfDay();
            $dueDate = Carbon::parse($this->due_date);
            return $returnedDate->gt($dueDate) ? $returnedDate->diffInDays($dueDate) : 0;
        }

        if (in_array($this->status, ['borrowed', 'picked_up', 'overdue', 'return_requested']) && $this->due_date) {
            $today = Carbon::today();
            $dueDate = Carbon::parse($this->due_date);
            return $today->gt($dueDate) ? $today->diffInDays($dueDate) : 0;
        }

        return 0;
    }

    public function getRemainingDaysAttribute(): int
    {
        if (in_array($this->status, ['borrowed', 'picked_up', 'overdue', 'return_requested']) && $this->due_date) {
            $today = Carbon::today();
            $dueDate = Carbon::parse($this->due_date);
            return $dueDate->gte($today) ? $today->diffInDays($dueDate) : 0;
        }

        return 0;
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->days_overdue > 0;
    }
}
