<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Borrowing;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessOverdueBorrowings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'borrowings:update-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically update status and dynamic fines for overdue borrowings and notify members';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        
        $overdueBorrowings = Borrowing::with(['library', 'book', 'user'])
            ->whereIn('status', ['borrowed', 'picked_up', 'overdue'])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', $today)
            ->get();

        if ($overdueBorrowings->isEmpty()) {
            $this->info('No overdue borrowings found today.');
            return Command::SUCCESS;
        }

        $count = 0;
        foreach ($overdueBorrowings as $borrowing) {
            $dueDate = Carbon::parse($borrowing->due_date)->startOfDay();
            $daysOverdue = $today->diffInDays($dueDate);
            if ($daysOverdue < 1) {
                $daysOverdue = 1;
            }

            $finePerDay = $borrowing->library ? (float) $borrowing->library->fine_per_day : 0.50;
            $newFineAmount = round($daysOverdue * $finePerDay, 2);

            $fineStatus = $borrowing->fine_status === 'none' ? 'unpaid' : $borrowing->fine_status;

            $borrowing->update([
                'status' => 'overdue',
                'fine_amount' => $newFineAmount,
                'fine_status' => $fineStatus,
            ]);

            // Check if member was already notified today for this borrowing
            $alreadyNotifiedToday = DB::table('notifications')
                ->where('notifiable_id', $borrowing->user_id)
                ->whereDate('created_at', $today)
                ->where('data', 'like', '%"borrowing_id":' . $borrowing->id . '%')
                ->exists();

            if (!$alreadyNotifiedToday) {
                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'overdue_reminder',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $borrowing->user_id,
                    'data' => json_encode([
                        'title' => 'Overdue Book & Fine Reminder',
                        'message' => sprintf(
                            'Your book "%s" is overdue by %d day(s). Current accumulated fine: $%.2f. Please return it to %s.',
                            $borrowing->book ? $borrowing->book->title : 'Borrowed Book',
                            $daysOverdue,
                            $newFineAmount,
                            $borrowing->library ? $borrowing->library->name : 'the library'
                        ),
                        'borrowing_id' => $borrowing->id,
                        'fine_amount' => $newFineAmount,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $count++;
        }

        $this->info("Successfully processed {$count} overdue borrowing(s).");
        return Command::SUCCESS;
    }
}
