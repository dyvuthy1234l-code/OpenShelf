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
        Schema::table('borrowings', function (Blueprint $table) {
            $table->dateTime('picked_up_at')->nullable()->after('approved_at');
            $table->decimal('fine_amount', 8, 2)->default(0.00)->after('status');
            $table->string('fine_status')->default('none')->after('fine_amount'); // none, unpaid, paid, waived
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrowings', function (Blueprint $table) {
            $table->dropColumn(['picked_up_at', 'fine_amount', 'fine_status']);
        });
    }
};
