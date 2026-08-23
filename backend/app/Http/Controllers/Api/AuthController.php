<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    // ** Register Member or Librarian
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'member',
            'status' => 'active',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $token,
            'data' => $user,
            'user' => $user,
        ], 201);
    }

    // ** Login User
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'message' => 'Your account is inactive.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'data' => $user,
            'user' => $user,
        ]);
    }

    // ** Get Authenticated User with Subscription Details
    public function me(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'librarian') {
            $user->load('library');
        }

        $activeSub = $user->subscriptions()
            ->with('plan')
            ->where('status', 'active')
            ->latest()
            ->first();

        $remainingDays = 0;
        $subData = null;

        if ($activeSub && $activeSub->end_date) {
            $today = \Carbon\Carbon::today();
            $endDate = \Carbon\Carbon::parse($activeSub->end_date);
            $remainingDays = $endDate->gte($today) ? $today->diffInDays($endDate) : 0;
            
            $subData = [
                'id' => $activeSub->id,
                'plan_name' => $activeSub->plan->name ?? 'Librarian Access Pass',
                'price' => (float) ($activeSub->plan->price ?? 29.99),
                'duration_days' => (int) ($activeSub->plan->duration_days ?? 365),
                'start_date' => $activeSub->start_date ? \Carbon\Carbon::parse($activeSub->start_date)->format('M d, Y') : null,
                'end_date' => $activeSub->end_date ? \Carbon\Carbon::parse($activeSub->end_date)->format('M d, Y') : null,
                'raw_end_date' => $activeSub->end_date ? $activeSub->end_date->toDateString() : null,
                'remaining_days' => $remainingDays,
                'status' => $activeSub->status,
                'full_access' => true,
                'plan' => $activeSub->plan,
            ];
        } elseif ($user->role === 'admin') {
            $subData = [
                'plan_name' => 'Staff Access Plan',
                'status' => 'active',
                'full_access' => true,
            ];
        } elseif ($user->role === 'librarian' && $user->hasActiveSubscription()) {
            $subData = [
                'plan_name' => 'Librarian Access',
                'status' => 'active',
                'full_access' => true,
            ];
        } elseif ($user->role === 'librarian') {
            $subData = [
                'plan_name' => 'Librarian Access',
                'status' => 'expired',
                'full_access' => false,
            ];
        } else {
            $subData = null;
        }

        return response()->json([
            'data' => $user,
            'user' => $user,
            'subscription' => $subData,
            'has_library' => $user->library !== null,
        ]);
    }

    // ** Update User Profile (Name, Phone, Avatar)
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $rules = [
            'name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
        ];

        if ($request->hasFile('avatar')) {
            $rules['avatar'] = ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'];
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('avatar')) {
            try {
                \App\Services\CloudinaryStorageService::delete($user->avatar);
                $user->avatar = \App\Services\CloudinaryStorageService::upload($request->file('avatar'), 'avatars');
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Avatar upload failed: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Failed to upload profile picture. Please try again later.',
                ], 422);
            }
        }

        if (!empty($validated['name'])) {
            $user->name = $validated['name'];
        }
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'data' => $user->fresh(),
            'user' => $user->fresh(),
        ]);
    }

    // ** Remove User Avatar
    public function removeAvatar(Request $request)
    {
        $user = $request->user();
        if ($user->avatar) {
            \App\Services\CloudinaryStorageService::delete($user->avatar);
        }
        $user->avatar = null;
        $user->save();

        return response()->json([
            'message' => 'Profile picture removed successfully.',
            'data' => $user->fresh(),
            'user' => $user->fresh(),
        ]);
    }

    // ** Change User Password
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password does not match our records.'
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully.'
        ]);
    }

    public function notificationPreferences(Request $request)
    {
        $defaults = [
            'borrow_status' => ['in_app' => true, 'email' => false],
            'due_date' => ['in_app' => true, 'email' => false],
            'subscription_payment' => ['in_app' => true, 'email' => false],
        ];
        return response()->json(['data' => array_replace_recursive($defaults, $request->user()->notification_preferences ?: [])]);
    }

    public function updateNotificationPreferences(Request $request)
    {
        $validated = $request->validate(['preferences' => ['required', 'array']]);
        $request->user()->update(['notification_preferences' => $validated['preferences']]);
        return response()->json(['message' => 'Notification preferences updated.', 'data' => $validated['preferences']]);
    }

    // ** Logout
    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logout successful.'
        ]);
    }
}
