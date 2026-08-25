<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BorrowingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\LibraryController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\LibrarianMemberController;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\WaitlistController;
use App\Http\Controllers\Api\LibraryReviewController;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

Route::get('/libraries', [LibraryController::class, 'index']);
Route::get('/libraries/locations', [LibraryController::class, 'locations']);
Route::get('/libraries/{id}', [LibraryController::class, 'show']);
Route::get('/libraries/{library}/reviews', [LibraryReviewController::class, 'index']);
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/books/{id}/reviews', [ReviewController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/public/libraries', [LibraryController::class, 'index']);
Route::get('/public/libraries/{id}', [LibraryController::class, 'show']);
Route::get('/public/categories', [CategoryController::class, 'index']);
Route::get('/public/books', [BookController::class, 'index']);
Route::get('/public/subscription-plans', [SubscriptionController::class, 'plans']);
Route::get('/subscription-plans', [SubscriptionController::class, 'plans']);

Route::middleware(['auth:sanctum', 'active.user'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/update', [AuthController::class, 'updateProfile']);
    Route::post('/profile/remove-avatar', [AuthController::class, 'removeAvatar']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::get('/notification-preferences', [AuthController::class, 'notificationPreferences']);
    Route::put('/notification-preferences', [AuthController::class, 'updateNotificationPreferences']);

    Route::post('/books/{id}/reviews', [ReviewController::class, 'store']);
    Route::post('/libraries/{library}/reviews', [LibraryReviewController::class, 'store']);

    Route::get('/subscriptions', [SubscriptionController::class, 'current']);
    Route::post('/subscriptions', [SubscriptionController::class, 'subscribe']);
    Route::get('/payments', [SubscriptionController::class, 'payments']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);
});

Route::middleware(['auth:sanctum', 'active.user', 'role:member'])->prefix('member')->group(function () {
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::delete('/libraries/{library}/reviews/{review}', [LibraryReviewController::class, 'destroy']);
    Route::get('/borrowings', [BorrowingController::class, 'memberIndex']);
    Route::get('/borrowings/{id}', [BorrowingController::class, 'memberShow']);
    Route::post('/borrowings', [BorrowingController::class, 'store']);
    Route::post('/borrowings/{id}/pay-fine', [BorrowingController::class, 'payFine']);
    Route::post('/borrowings/{id}/extend', [BorrowingController::class, 'extendLoan']);
    Route::post('/borrowings/{id}/request-return', [BorrowingController::class, 'memberRequestReturn']);
    Route::post('/books/{bookId}/waitlist', [WaitlistController::class, 'join']);
    Route::delete('/books/{bookId}/waitlist', [WaitlistController::class, 'leave']);
    Route::get('/books/{bookId}/waitlist', [WaitlistController::class, 'position']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{id}', [FavoriteController::class, 'destroy']);

    Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);
    Route::get('/subscriptions/current', [SubscriptionController::class, 'current']);
    Route::post('/payments/checkout', [PaymentController::class, 'checkout']);
    Route::get('/payments/my-payments', [PaymentController::class, 'myPayments']);

});

Route::middleware(['auth:sanctum', 'active.user', 'role:librarian', 'active.subscription'])->prefix('librarian')->group(function () {
    Route::get('/my-library', [LibraryController::class, 'myLibrary']);
    Route::post('/library', [LibraryController::class, 'store']);
    Route::post('/library/update', [LibraryController::class, 'update']);
    Route::post('/library/toggle-status', [LibraryController::class, 'toggleStatus']);
    Route::patch('/library', [LibraryController::class, 'update']);

    Route::get('/categories', [CategoryController::class, 'librarianIndex']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{id}', [CategoryController::class, 'librarianShow']);
    Route::patch('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    Route::get('/books', [BookController::class, 'librarianIndex']);
    Route::post('/books', [BookController::class, 'store']);
    Route::get('/books/{id}', [BookController::class, 'librarianShow']);
    Route::post('/books/{id}', [BookController::class, 'update']);
    Route::patch('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);

    Route::get('/borrowings', [BorrowingController::class, 'librarianIndex']);
    Route::get('/borrowings/{id}', [BorrowingController::class, 'librarianShow']);
    Route::post('/borrowings/bulk-update', [BorrowingController::class, 'bulkUpdate']);
    Route::post('/borrowings/{borrowing}/approve', [BorrowingController::class, 'approve']);
    Route::post('/borrowings/{borrowing}/reject', [BorrowingController::class, 'reject']);
    Route::post('/borrowings/{borrowing}/pickup', [BorrowingController::class, 'pickup']);
    Route::post('/borrowings/{borrowing}/return', [BorrowingController::class, 'returnBook']);

    Route::get('/members', [LibrarianMemberController::class, 'index']);
    Route::get('/members/{id}', [LibrarianMemberController::class, 'show']);

    Route::get('/reports', [ReportController::class, 'librarian']);
});

Route::middleware(['auth:sanctum', 'active.user', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/report', [AdminController::class, 'report']);

    Route::get('/libraries', [AdminController::class, 'libraries']);
    Route::post('/libraries', [AdminController::class, 'storeLibrary']);
    Route::get('/libraries/{id}', [AdminController::class, 'library']);
    Route::put('/libraries/{id}', [AdminController::class, 'updateLibrary']);
    Route::patch('/libraries/{id}', [AdminController::class, 'updateLibrary']);
    Route::patch('/libraries/{id}/status', [AdminController::class, 'updateLibraryStatus']);

    Route::get('/librarians', [AdminController::class, 'librarians']);
    Route::post('/librarians', [AdminController::class, 'storeLibrarian']);
    Route::get('/librarians/{id}', [AdminController::class, 'librarian']);
    Route::put('/librarians/{id}', [AdminController::class, 'updateLibrarian']);
    Route::patch('/librarians/{id}', [AdminController::class, 'updateLibrarian']);
    Route::get('/members', [AdminController::class, 'members']);
    Route::get('/members/{id}', [AdminController::class, 'member']);
    Route::patch('/users/{user}/status', [AdminController::class, 'updateUserStatus']);

    Route::get('/subscriptions', [AdminController::class, 'subscriptions']);
    Route::post('/subscriptions', [AdminController::class, 'storeSubscription']);
    Route::get('/subscriptions/{id}', [AdminController::class, 'subscription']);
    Route::put('/subscriptions/{id}', [AdminController::class, 'updateSubscription']);
    Route::post('/subscriptions/{id}/cancel', [AdminController::class, 'cancelSubscription']);
    Route::delete('/subscriptions/{id}', [AdminController::class, 'deleteSubscription']);

    Route::get('/payments', [AdminController::class, 'payments']);
    Route::get('/payments/{id}', [AdminController::class, 'payment']);

    Route::get('/notifications', [AdminController::class, 'notifications']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);

    Route::get('/plans', [AdminController::class, 'plans']);
    Route::post('/plans', [AdminController::class, 'storePlan']);
    Route::put('/plans/{plan}', [AdminController::class, 'updatePlan']);
    Route::patch('/plans/{plan}/archive', [AdminController::class, 'archivePlan']);
    Route::delete('/plans/{plan}', [AdminController::class, 'deletePlan']);
});
