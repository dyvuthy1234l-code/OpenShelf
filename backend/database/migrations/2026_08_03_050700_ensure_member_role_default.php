<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // This is safe to run more than once and repairs an existing MySQL
        // database even if the earlier default migration was already recorded.
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'member'");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user'");
        }
    }
};
