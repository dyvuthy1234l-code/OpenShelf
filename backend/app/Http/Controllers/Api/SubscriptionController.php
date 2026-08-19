<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function plans()
    {
        return response()->json(['data' => SubscriptionPlan::where('status', 'active')->orderBy('price')->get()]);
    }

    public function current(Request $request)
    {
        return response()->json([
            'data' => $request->user()->subscriptions()->with('plan', 'payments')->latest()->get(),
        ]);
    }

    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:subscription_plans,id'],
            'payment_method' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();
        if ($user->status !== 'active') {
            return response()->json(['message' => 'Inactive accounts cannot subscribe.'], 403);
        }
        if (!in_array($user->role, ['member', 'librarian'], true)) {
            return response()->json(['message' => 'Only members and librarians can purchase librarian access.'], 403);
        }

        $result = DB::transaction(function () use ($validated, $user, $request) {
            $plan = SubscriptionPlan::where('status', 'active')->lockForUpdate()->findOrFail($validated['plan_id']);

            if ($user->subscriptions()
                ->where('status', 'active')
                ->whereDate('end_date', '>=', now()->toDateString())
                ->exists()) {
                throw new \Illuminate\Http\Exceptions\HttpResponseException(
                    response()->json(['message' => 'You already have an active subscription.'], 422)
                );
            }

            $start = now()->startOfDay();
            $end = $start->copy()->addDays($plan->duration_days - 1);
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'status' => 'active',
            ]);

            // This is intentionally a development simulation: no real card,
            // bank, or payment provider is contacted.
            $payment = Payment::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'amount' => $plan->price,
                'payment_method' => $validated['payment_method'] ?? 'simulation',
                'transaction_id' => 'SIM-'.Str::upper(Str::random(20)),
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            if ($user->role === 'member') {
                $user->update(['role' => 'librarian']);
            }

            if ($user->allowsNotification('subscription_payment', 'in_app')) {
                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'subscription',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'title' => 'Subscription Activated',
                        'message' => 'Your subscription for "' . $plan->name . '" is now active. Librarian access granted!',
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Notify all Admin users about the new subscription
            $adminIds = User::where('role', 'admin')->pluck('id');
            foreach ($adminIds as $adminId) {
                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'subscription',
                    'notifiable_type' => 'App\\Models\\User',
                    'notifiable_id' => $adminId,
                    'data' => json_encode([
                        'title' => 'New Subscription Purchased',
                        'message' => 'User "' . $user->name . '" (' . $user->email . ') purchased subscription plan "' . $plan->name . '" ($' . number_format((float) $plan->price, 2) . ').',
                        'subscription_id' => $subscription->id,
                        'target_url' => '/admin/subscriptions/' . $subscription->id,
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return compact('plan', 'subscription', 'payment');
        });

        return response()->json([
            'message' => 'Simulated payment successful. Librarian access is now active.',
            'data' => $result,
        ], 201);
    }

    public function payments(Request $request)
    {
        return response()->json(['data' => $request->user()->payments()->with('subscription.plan')->latest()->get()]);
    }
}
