<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    private function abortJson(string $message, int $status = 422): void
    {
        throw new HttpResponseException(
            response()->json(['message' => $message], $status)
        );
    }

    public function myPayments(Request $request)
    {
        $payments = $request->user()
            ->payments()
            ->with('subscription.plan')
            ->latest()
            ->get();

        return response()->json([
            'data' => $payments,
            'payments' => $payments,
        ]);
    }

    public function checkout(Request $request)
    {
        return app(SubscriptionController::class)->subscribe($request);
    }
}
