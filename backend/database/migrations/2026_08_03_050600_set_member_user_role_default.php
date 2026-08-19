<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The original migration now has the correct default for new
        // databases. Existing MySQL databases need this small default-only
        // adjustment; SQLite cannot alter a column default and already gets
        // the corrected default when its test database is recreated.
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
