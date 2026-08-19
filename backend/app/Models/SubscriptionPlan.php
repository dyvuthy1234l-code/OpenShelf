<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price', 'duration_days', 'max_concurrent_borrows', 'description', 'status'];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_days' => 'integer',
        'max_concurrent_borrows' => 'integer',
    ];

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}
