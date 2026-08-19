<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->orderByDesc('created_at');

        $unreadCount = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        $perPage = $request->integer('per_page', 0);
        if ($perPage <= 0) {
            $notifications = $query->get()->map(function ($notification) {
                $notification->data = is_string($notification->data)
                    ? (json_decode($notification->data, true) ?: ['message' => $notification->data])
                    : $notification->data;
                if ($notification->created_at) {
                    $notification->created_at = \Carbon\Carbon::parse($notification->created_at)->toISOString();
                }
                return $notification;
            });

            return response()->json([
                'data' => $notifications,
                'unread_count' => $unreadCount,
            ]);
        }

        $paginated = $query->paginate(min($perPage, 100));
        $items = collect($paginated->items())->map(function ($notification) {
            $notification->data = is_string($notification->data)
                ? (json_decode($notification->data, true) ?: ['message' => $notification->data])
                : $notification->data;
            if ($notification->created_at) {
                $notification->created_at = \Carbon\Carbon::parse($notification->created_at)->toISOString();
            }
            return $notification;
        });

        return response()->json([
            'data' => $items,
            'unread_count' => $unreadCount,
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ]
        ]);
    }

    public function markAsRead(Request $request, string $id)
    {
        return $this->markRead($request, $id);
    }

    public function markRead(Request $request, string $id)
    {
        $notification = DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->first();

        if (!$notification) {
            if ($request->user()->role === 'admin' || (str_contains($id, '-') && !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id))) {
                return response()->json(['message' => 'Dynamic system alert acknowledged.']);
            }
            return response()->json(['message' => 'Notification not found.'], 404);
        }

        if ($notification->read_at === null) {
            DB::table('notifications')->where('id', $id)->update([
                'read_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request)
    {
        return $this->markAllRead($request);
    }

    public function markAllRead(Request $request)
    {
        $updated = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return response()->json([
            'message' => 'All notifications marked as read.',
            'updated_count' => $updated,
            'unread_count' => 0,
        ]);
    }

    public function destroy(Request $request, string $id)
    {
        $deleted = DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->delete();

        if (!$deleted) {
            if (str_contains($id, '-') && !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
                return response()->json(['message' => 'Dynamic system alert removed.']);
            }
            return response()->json(['message' => 'Notification not found or access denied.'], 404);
        }

        return response()->json(['message' => 'Notification deleted successfully.']);
    }

    public function destroyAll(Request $request)
    {
        $deleted = DB::table('notifications')
            ->where('notifiable_type', 'App\\Models\\User')
            ->where('notifiable_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'All notifications cleared.',
            'deleted_count' => $deleted,
        ]);
    }
}
