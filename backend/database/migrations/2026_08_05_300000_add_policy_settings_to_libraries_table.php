<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('libraries', function (Blueprint $table) {
            $table->integer('borrowing_period_days')->default(7)->after('borrowing_rules');
            $table->decimal('fine_per_day', 8, 2)->default(0.50)->after('borrowing_period_days');
            $table->integer('max_books_per_member')->default(3)->after('fine_per_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('libraries', function (Blueprint $table) {
            $table->dropColumn(['borrowing_period_days', 'fine_per_day', 'max_books_per_member']);
        });
    }
};
