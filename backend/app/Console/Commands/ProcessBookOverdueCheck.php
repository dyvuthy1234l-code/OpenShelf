<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ProcessBookOverdueCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'books:check-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Alias command for checking overdue book loans, updating status, and notifying members';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        return $this->call('borrowings:update-overdue');
    }
}
