<?php

use Illuminate\Database\Migrations\Migration;
use App\Models\Book;
use App\Models\Borrowing;

return new class extends Migration
{
    public function up(): void
    {
        $books = Book::all();
        foreach ($books as $book) {
            $activeBorrowed = Borrowing::where('book_id', $book->id)
                ->whereIn('status', ['borrowed', 'picked_up', 'overdue', 'return_requested'])
                ->count();
            $book->update([
                'available_quantity' => max(0, (int) $book->quantity - $activeBorrowed)
            ]);
        }
    }

    public function down(): void
    {
        // Data fix migration does not require rollback logic
    }
};
