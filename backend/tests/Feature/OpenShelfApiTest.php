<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Borrowing;
use App\Models\Category;
use App\Models\Library;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class OpenShelfApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_login_view_me_and_logout(): void
    {
        User::create([
            'name' => 'Auth User',
            'email' => 'auth@example.com',
            'password' => Hash::make('password123'),
            'role' => 'member',
            'status' => 'active',
        ]);

        $login = $this->postJson('/api/login', [
            'email' => 'auth@example.com',
            'password' => 'password123',
        ])->assertOk();

        $token = $login->json('token');
        $this->assertNotEmpty($token);
        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('data.email', 'auth@example.com');
        $this->withToken($token)->postJson('/api/logout')->assertOk();
    }

    public function test_public_registration_always_creates_a_member(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'admin',
        ]);

        $response->assertCreated()->assertJsonPath('data.role', 'member');
        $this->assertDatabaseHas('users', ['email' => 'new@example.com', 'role' => 'member']);
    }

    public function test_member_cannot_access_admin_or_librarian_routes(): void
    {
        $member = User::factory()->create(['role' => 'member', 'status' => 'active']);

        $this->actingAs($member, 'sanctum')->getJson('/api/admin/dashboard')->assertForbidden();
        $this->actingAs($member, 'sanctum')->getJson('/api/librarian/my-library')->assertForbidden();
    }

    public function test_borrowing_stock_changes_only_at_pickup_and_return(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(1);

        $request = $this->actingAs($member, 'sanctum')->postJson('/api/member/borrowings', ['book_id' => $book->id]);
        $request->assertCreated();
        $this->assertDatabaseHas('books', ['id' => $book->id, 'available_quantity' => 1]);

        $borrowing = Borrowing::firstOrFail();
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/approve")
            ->assertOk();
        $this->assertDatabaseHas('books', ['id' => $book->id, 'available_quantity' => 1]);

        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/pickup")
            ->assertOk();
        $this->assertDatabaseHas('books', ['id' => $book->id, 'available_quantity' => 0]);

        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/return")
            ->assertOk();
        $this->assertDatabaseHas('books', ['id' => $book->id, 'available_quantity' => 1]);
    }

    public function test_wrong_librarian_cannot_manage_another_library_borrowing(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(1);
        $otherLibrarian = User::factory()->create(['role' => 'librarian', 'status' => 'active']);
        $this->giveSubscription($otherLibrarian);

        $this->actingAs($member, 'sanctum')->postJson('/api/member/borrowings', ['book_id' => $book->id]);
        $borrowing = Borrowing::firstOrFail();

        $this->actingAs($otherLibrarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/approve")
            ->assertForbidden();
    }

    public function test_member_can_add_and_remove_a_favorite(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(1);

        $this->actingAs($member, 'sanctum')
            ->postJson('/api/member/favorites', ['book_id' => $book->id])
            ->assertCreated();

        $this->actingAs($member, 'sanctum')
            ->deleteJson("/api/member/favorites/{$book->id}")
            ->assertOk();

        $this->assertDatabaseMissing('favorites', [
            'user_id' => $member->id,
            'book_id' => $book->id,
        ]);
    }

    public function test_catalogue_filters_by_library_and_returns_book_count(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(1);

        $this->getJson('/api/libraries?per_page=12')
            ->assertOk()
            ->assertJsonPath('data.0.books_count', 1);

        $this->getJson('/api/books?library=Test%20Library&per_page=24')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_simulated_subscription_upgrades_member_through_backend(): void
    {
        $member = User::factory()->create(['role' => 'member', 'status' => 'active']);
        $plan = SubscriptionPlan::create(['name' => 'Test Plan', 'price' => 10, 'duration_days' => 30, 'status' => 'active']);

        $this->actingAs($member, 'sanctum')
            ->postJson('/api/subscriptions', ['plan_id' => $plan->id])
            ->assertCreated();

        $this->assertDatabaseHas('users', ['id' => $member->id, 'role' => 'librarian']);
        $this->assertDatabaseHas('payments', ['user_id' => $member->id, 'status' => 'paid']);
    }

    public function test_inactive_user_cannot_access_api(): void
    {
        $member = User::factory()->create(['role' => 'member', 'status' => 'inactive']);
        $this->actingAs($member, 'sanctum')
            ->getJson('/api/member/borrowings')
            ->assertStatus(403)
            ->assertJsonPath('message', 'Your account is inactive.');
    }

    public function test_deactivating_user_revokes_tokens(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        $member = User::factory()->create(['role' => 'member', 'status' => 'active']);
        
        $token = $member->createToken('test_token');
        $this->assertCount(1, $member->tokens);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/users/{$member->id}/status", ['status' => 'inactive'])
            ->assertOk();

        $this->assertCount(0, $member->fresh()->tokens);
    }

    public function test_registration_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'mismatch',
        ]);

        $response->assertStatus(422);
    }

    public function test_inactive_user_cannot_access_profile_or_me(): void
    {
        $member = User::factory()->create(['role' => 'member', 'status' => 'inactive']);
        $this->actingAs($member, 'sanctum')
            ->getJson('/api/me')
            ->assertStatus(403)
            ->assertJsonPath('message', 'Your account is inactive.');
    }

    public function test_waitlist_joining_rules(): void
    {
        // 1. Available book waitlist join is rejected
        [$member, $librarian, $book] = $this->makeLibraryData(1);
        $this->actingAs($member, 'sanctum')
            ->postJson("/api/member/books/{$book->id}/waitlist")
            ->assertStatus(422);

        // 2. Make book unavailable and join waitlist (accepted)
        $book->update(['available_quantity' => 0]);
        $this->actingAs($member, 'sanctum')
            ->postJson("/api/member/books/{$book->id}/waitlist")
            ->assertCreated();

        // 3. Duplicate waitlist join is rejected (returns 200 with existing warning message)
        $this->actingAs($member, 'sanctum')
            ->postJson("/api/member/books/{$book->id}/waitlist")
            ->assertOk();
    }

    public function test_unauthorized_and_resolved_fine_payments(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(1);

        $borrowing = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'returned',
            'fine_amount' => 5.00,
            'fine_status' => 'paid',
        ]);

        // 1. Pay already paid fine (rejected)
        $this->actingAs($member, 'sanctum')
            ->postJson("/api/member/borrowings/{$borrowing->id}/pay-fine")
            ->assertStatus(422);

        // 2. Waived fine cannot be paid
        $borrowing->update(['fine_status' => 'waived']);
        $this->actingAs($member, 'sanctum')
            ->postJson("/api/member/borrowings/{$borrowing->id}/pay-fine")
            ->assertStatus(422);

        // 3. Prevent paying another user's fine
        $otherMember = User::factory()->create(['role' => 'member', 'status' => 'active']);
        $borrowing->update(['fine_status' => 'unpaid']);
        $this->actingAs($otherMember, 'sanctum')
            ->postJson("/api/member/borrowings/{$borrowing->id}/pay-fine")
            ->assertStatus(404);
    }

    public function test_duplicate_and_limit_borrowing_requests(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(1);

        // 1. Create first request (pending)
        $this->actingAs($member, 'sanctum')
            ->postJson('/api/member/borrowings', ['book_id' => $book->id])
            ->assertCreated();

        // 2. Duplicate request for the same book (rejected)
        $this->actingAs($member, 'sanctum')
            ->postJson('/api/member/borrowings', ['book_id' => $book->id])
            ->assertStatus(422);

        // 3. User reaches max_books_per_member limit
        $book->library->update(['max_books_per_member' => 1]);
        $otherBook = Book::create([
            'library_id' => $book->library_id,
            'category_id' => $book->category_id,
            'title' => 'Another Book',
            'author' => 'Author',
            'quantity' => 1,
            'available_quantity' => 1,
            'status' => 'active',
        ]);
        $this->actingAs($member, 'sanctum')
            ->postJson('/api/member/borrowings', ['book_id' => $otherBook->id])
            ->assertStatus(422);
    }

    public function test_approving_borrow_request_fails_if_available_quantity_is_zero(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(0);

        $borrowing = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/approve");

        $response->assertStatus(422)
            ->assertJsonPath('message', 'This book has no available copies.');

        $this->assertEquals('pending', $borrowing->fresh()->status);
    }

    public function test_bulk_approve_validates_stock_per_book(): void
    {
        [$member, $librarian, $availableBook] = $this->makeLibraryData(1);

        $unavailableBook = Book::create([
            'library_id' => $availableBook->library_id,
            'category_id' => $availableBook->category_id,
            'title' => 'Out of Stock Book',
            'author' => 'Author',
            'quantity' => 1,
            'available_quantity' => 0,
            'status' => 'active',
        ]);

        $b1 = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $availableBook->id,
            'library_id' => $availableBook->library_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $b2 = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $unavailableBook->id,
            'library_id' => $availableBook->library_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($librarian, 'sanctum')
            ->postJson('/api/librarian/borrowings/bulk-update', [
                'borrowing_ids' => [$b1->id, $b2->id],
                'status' => 'approved',
            ]);

        $response->assertOk();
        $this->assertEquals('approved', $b1->fresh()->status);
        $this->assertEquals('pending', $b2->fresh()->status);
        $this->assertCount(1, $response->json('failed'));
    }

    public function test_inventory_sync_when_quantity_is_updated_and_borrowed(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(900);

        // 1. Initially 900 quantity and 0 borrowed -> available = 900
        $this->assertEquals(900, $book->fresh()->available_quantity);

        // 2. Update Total to 1000 with 0 borrowed -> available = 1000
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/books/{$book->id}", ['quantity' => 1000])
            ->assertOk();
        $this->assertEquals(1000, $book->fresh()->available_quantity);

        // 3. Create 3 active borrowings (borrowed state)
        for ($i = 0; $i < 3; $i++) {
            $u = User::factory()->create(['role' => 'member', 'status' => 'active']);
            Borrowing::create([
                'user_id' => $u->id,
                'book_id' => $book->id,
                'library_id' => $book->library_id,
                'status' => 'borrowed',
                'borrowed_at' => now(),
            ]);
        }

        // 4. Update Total to 900 with 3 borrowed -> available = 897
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/books/{$book->id}", ['quantity' => 900])
            ->assertOk();
        $this->assertEquals(897, $book->fresh()->available_quantity);

        // 5. Attempt reducing Total to 2 when 3 are borrowed -> Reject 422
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/books/{$book->id}", ['quantity' => 2])
            ->assertStatus(422);

        // 6. Request & Approve borrow on available = 897 -> succeeds
        $borrowing = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/approve")
            ->assertOk();

        // 7. Pickup -> available becomes 896
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/pickup")
            ->assertOk();
        $this->assertEquals(896, $book->fresh()->available_quantity);

        // 8. Return -> available becomes 897
        $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/return")
            ->assertOk();
        $this->assertEquals(897, $book->fresh()->available_quantity);
    }

    public function test_librarian_borrowings_index_includes_book_available_quantity(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(935);

        $borrowing = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $response = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/librarian/borrowings')
            ->assertOk();

        $response->assertJsonPath('data.0.book.available_quantity', 935);
        $response->assertJsonPath('data.0.book.quantity', 935);
    }

    public function test_book_publisher_and_publication_year_are_persisted_on_store_and_update(): void
    {
        [$member, $librarian, $initialBook] = $this->makeLibraryData(10);

        // 1. Create book with publisher and publication_year
        $storeRes = $this->actingAs($librarian, 'sanctum')
            ->postJson('/api/librarian/books', [
                'title' => 'Test Book',
                'author' => 'Test Author',
                'category_id' => $initialBook->category_id,
                'publisher' => 'OpenShelf Publishing',
                'publication_year' => 2026,
                'quantity' => 10,
            ])
            ->assertCreated();

        $bookId = $storeRes->json('data.id');
        $this->assertNotEmpty($bookId);
        $this->assertEquals('OpenShelf Publishing', $storeRes->json('data.publisher'));
        $this->assertEquals(2026, $storeRes->json('data.publication_year'));

        // Verify persistence via GET /api/librarian/books/{id}
        $getRes = $this->actingAs($librarian, 'sanctum')
            ->getJson("/api/librarian/books/{$bookId}")
            ->assertOk();

        $this->assertEquals('OpenShelf Publishing', $getRes->json('data.publisher'));
        $this->assertEquals(2026, $getRes->json('data.publication_year'));

        // 2. Edit book with updated publisher and publication_year
        $updateRes = $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/books/{$bookId}", [
                'publisher' => 'Updated Publisher',
                'publication_year' => 2025,
            ])
            ->assertOk();

        $this->assertEquals('Updated Publisher', $updateRes->json('data.publisher'));
        $this->assertEquals(2025, $updateRes->json('data.publication_year'));

        // Verify updated persistence via GET /api/librarian/books/{id}
        $reloadRes = $this->actingAs($librarian, 'sanctum')
            ->getJson("/api/librarian/books/{$bookId}")
            ->assertOk();

        $this->assertEquals('Updated Publisher', $reloadRes->json('data.publisher'));
        $this->assertEquals(2025, $reloadRes->json('data.publication_year'));
    }

    public function test_books_api_handles_per_page_minus_one_and_filters(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(10);

        // Create a second book
        Book::create([
            'library_id' => $book->library_id,
            'category_id' => $book->category_id,
            'title' => 'Laravel Masterclass',
            'author' => 'Taylor',
            'quantity' => 5,
            'available_quantity' => 5,
            'status' => 'active',
        ]);

        // 1. GET /api/books?per_page=1 -> paginated with meta
        $p1 = $this->getJson('/api/books?per_page=1')
            ->assertOk()
            ->assertJsonPath('meta.per_page', 1)
            ->assertJsonCount(1, 'data');

        // 2. GET /api/books?per_page=-1 -> returns all 2 books without error
        $pAll = $this->getJson('/api/books?per_page=-1')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        // 3. GET /api/books?search=Masterclass&per_page=-1 -> filter search
        $pSearch = $this->getJson('/api/books?search=Masterclass&per_page=-1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Laravel Masterclass');

        // 4. GET /api/books?category_id=X&per_page=-1 -> filter category
        $pCategory = $this->getJson("/api/books?category_id={$book->category_id}&per_page=-1")
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_subscription_data_mapping_and_active_duplicate_prevention(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(10);

        // 1. Verify active subscription details on GET /api/me
        $meRes = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/me')
            ->assertOk();

        $meRes->assertJsonPath('subscription.status', 'active');
        $meRes->assertJsonPath('subscription.plan_name', 'Test Librarian Plan');
        $meRes->assertJsonPath('subscription.price', 5);
        $meRes->assertJsonPath('subscription.remaining_days', 29);

        // 2. Attempting to purchase a second subscription while active returns 422
        $plan = SubscriptionPlan::first();
        $subRes = $this->actingAs($librarian, 'sanctum')
            ->postJson('/api/subscriptions', ['plan_id' => $plan->id]);

        $subRes->assertStatus(422)
            ->assertJsonPath('message', 'You already have an active subscription.');
    }

    public function test_librarian_borrowings_server_side_search_status_filter_and_pagination(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(10);

        $brooke = User::factory()->create(['name' => 'Brooke Slater', 'email' => 'brooke@example.com', 'role' => 'member', 'status' => 'active']);

        // Create 2 borrowings: 1 for Brooke (pending), 1 for default member (approved)
        $b1 = Borrowing::create([
            'user_id' => $brooke->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'pending',
            'requested_at' => now(),
        ]);

        $b2 = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'approved',
            'requested_at' => now(),
        ]);

        // 1. Search Brooke -> returns 1 match
        $searchRes = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/librarian/borrowings?search=Brooke')
            ->assertOk();
        $searchRes->assertJsonCount(1, 'data');
        $searchRes->assertJsonPath('data.0.user.name', 'Brooke Slater');

        // 2. Status filter pending -> returns 1 match
        $statusRes = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/librarian/borrowings?status=pending')
            ->assertOk();
        $statusRes->assertJsonCount(1, 'data');
        $statusRes->assertJsonPath('data.0.id', $b1->id);

        // 3. Combined search + status -> returns 1 match
        $combRes = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/librarian/borrowings?search=Brooke&status=pending')
            ->assertOk();
        $combRes->assertJsonCount(1, 'data');

        // 4. Pagination per_page=1 -> page 1 has 1 item, page 2 has 1 item
        $p1Res = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/librarian/borrowings?page=1&per_page=1')
            ->assertOk();
        $p1Res->assertJsonCount(1, 'data');
        $p1Res->assertJsonPath('meta.total', 2);
        $p1Res->assertJsonPath('meta.last_page', 2);
    }

    public function test_librarian_returns_flow_and_inventory_sync(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(10);

        // Initially: Total = 10, Available = 10 (from makeLibraryData)
        $this->assertEquals(10, $book->fresh()->available_quantity);

        // Create a borrowing in borrowed state (available becomes 9)
        $borrowing = Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'return_requested',
            'borrowed_at' => now()->subDays(5),
            'due_date' => now()->addDays(2)->toDateString(),
            'requested_at' => now()->subDays(5),
        ]);
        $book->decrement('available_quantity');
        $this->assertEquals(9, $book->fresh()->available_quantity);

        // Confirm return via endpoint
        $retRes = $this->actingAs($librarian, 'sanctum')
            ->postJson("/api/librarian/borrowings/{$borrowing->id}/return", ['fine_status' => 'none'])
            ->assertOk();

        $retRes->assertJsonPath('data.status', 'returned');

        // Available quantity must be restored to 10
        $this->assertEquals(10, $book->fresh()->available_quantity);
    }

    public function test_librarian_members_isolation_search_and_pagination(): void
    {
        [$memberA, $librarianA, $bookA] = $this->makeLibraryData(10);
        [$memberB, $librarianB, $bookB] = $this->makeLibraryData(10);

        // Member A has a borrowing in Library A
        Borrowing::create([
            'user_id' => $memberA->id,
            'book_id' => $bookA->id,
            'library_id' => $bookA->library_id,
            'status' => 'borrowed',
            'requested_at' => now(),
        ]);

        // Member B has a borrowing in Library B
        Borrowing::create([
            'user_id' => $memberB->id,
            'book_id' => $bookB->id,
            'library_id' => $bookB->library_id,
            'status' => 'borrowed',
            'requested_at' => now(),
        ]);

        // 1. Librarian A gets member list -> sees Member A, does NOT see Member B
        $resA = $this->actingAs($librarianA, 'sanctum')
            ->getJson('/api/librarian/members')
            ->assertOk();

        $resA->assertJsonCount(1, 'data');
        $resA->assertJsonPath('data.0.id', $memberA->id);

        // 2. Librarian A attempts to view Member B details -> returns 404
        $this->actingAs($librarianA, 'sanctum')
            ->getJson("/api/librarian/members/{$memberB->id}")
            ->assertNotFound();

        // 3. Search and pagination metadata
        $pRes = $this->actingAs($librarianA, 'sanctum')
            ->getJson('/api/librarian/members?page=1&per_page=10')
            ->assertOk();

        $pRes->assertJsonPath('meta.total', 1);
        $pRes->assertJsonPath('meta.per_page', 10);
    }

    public function test_librarian_dashboard_report_metrics_and_isolation(): void
    {
        [$member, $librarian, $book] = $this->makeLibraryData(10);

        // Create an overdue borrowing
        Borrowing::create([
            'user_id' => $member->id,
            'book_id' => $book->id,
            'library_id' => $book->library_id,
            'status' => 'borrowed',
            'borrowed_at' => now()->subDays(10),
            'due_date' => now()->subDays(3)->toDateString(),
            'requested_at' => now()->subDays(10),
        ]);

        $repRes = $this->actingAs($librarian, 'sanctum')
            ->getJson('/api/librarian/reports')
            ->assertOk();

        $repRes->assertJsonPath('data.total_books', 1);
        $repRes->assertJsonPath('data.total_copies', 10);
        $repRes->assertJsonPath('data.available_books', 10);
        $repRes->assertJsonPath('data.overdue_books', 1);
        $repRes->assertJsonPath('data.active_borrowings', 1);
    }

    public function test_librarian_categories_isolation_crud_and_delete_guard(): void
    {
        [$memberA, $librarianA, $bookA] = $this->makeLibraryData(10);
        [$memberB, $librarianB, $bookB] = $this->makeLibraryData(10);

        // 1. Librarian A gets categories -> sees Category A (from makeLibraryData), does NOT see Category B
        $catRes = $this->actingAs($librarianA, 'sanctum')
            ->getJson('/api/librarian/categories')
            ->assertOk();

        $catRes->assertJsonCount(1, 'data');
        $catRes->assertJsonPath('data.0.name', 'Testing');

        // 2. Librarian A attempts to view Librarian B's category -> returns 404
        $catB = $bookB->category;
        $this->actingAs($librarianA, 'sanctum')
            ->getJson("/api/librarian/categories/{$catB->id}")
            ->assertNotFound();

        // 3. Attempting to delete Category A (contains active bookA) returns 422
        $catA = $bookA->category;
        $delRes = $this->actingAs($librarianA, 'sanctum')
            ->deleteJson("/api/librarian/categories/{$catA->id}");
        $delRes->assertStatus(422)
            ->assertJsonPath('message', 'This category contains active books and cannot be deleted.');

        // 4. Create empty category A2 and delete it successfully
        $createRes = $this->actingAs($librarianA, 'sanctum')
            ->postJson('/api/librarian/categories', ['name' => 'Empty Science'])
            ->assertCreated();

        $newCatId = $createRes->json('data.id');
        $this->actingAs($librarianA, 'sanctum')
            ->deleteJson("/api/librarian/categories/{$newCatId}")
            ->assertOk();
    }

    public function test_member_book_rating_review_security_and_validations(): void
    {
        [$memberA, $librarianA, $book] = $this->makeLibraryData(10);
        $memberB = User::factory()->create(['role' => 'member', 'status' => 'active']);

        // 1. Librarian review attempt -> 403
        $this->actingAs($librarianA, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['rating' => 5, 'comment' => 'Great'])
            ->assertForbidden();

        // 2. Invalid rating (0, 6) -> 422
        $this->actingAs($memberA, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['rating' => 0])
            ->assertStatus(422);

        $this->actingAs($memberA, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['rating' => 6])
            ->assertStatus(422);

        // 3. User spoofing test -> user_id in body is ignored, belongs to Member A
        $resA = $this->actingAs($memberA, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['rating' => 5, 'comment' => 'Excellent book', 'user_id' => $memberB->id])
            ->assertCreated();

        $resA->assertJsonPath('data.user_id', $memberA->id);

        // 4. Duplicate review updates existing review
        $this->actingAs($memberA, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['rating' => 4, 'comment' => 'Updated comment'])
            ->assertCreated();

        $this->assertDatabaseCount('reviews', 1);
        $this->assertDatabaseHas('reviews', ['user_id' => $memberA->id, 'rating' => 4, 'comment' => 'Updated comment']);

        // 5. Member B leaves a 2-star review -> average rating = (4 + 2) / 2 = 3.0
        $this->actingAs($memberB, 'sanctum')
            ->postJson("/api/books/{$book->id}/reviews", ['rating' => 2, 'comment' => 'Not bad'])
            ->assertCreated();

        $revIdx = $this->getJson("/api/books/{$book->id}/reviews")->assertOk();
        $revIdx->assertJsonPath('summary.average_rating', 3);
        $revIdx->assertJsonPath('summary.total_reviews', 2);

        // 6. Delete authorization -> Member B cannot delete Member A's review
        $reviewA = \App\Models\Review::where('user_id', $memberA->id)->first();
        $this->actingAs($memberB, 'sanctum')
            ->deleteJson("/api/member/reviews/{$reviewA->id}")
            ->assertForbidden();

        // Member A deletes own review
        $this->actingAs($memberA, 'sanctum')
            ->deleteJson("/api/member/reviews/{$reviewA->id}")
            ->assertOk();
    }

    public function test_member_public_catalogue_library_category_filtering_and_available_only(): void
    {
        [$memberA, $librarianA, $bookA] = $this->makeLibraryData(10);
        [$memberB, $librarianB, $bookB] = $this->makeLibraryData(0);

        // 1. Categories scoped to Library A
        $catRes = $this->getJson("/api/categories?library_id={$bookA->library_id}")->assertOk();
        $catRes->assertJsonCount(1, 'data');
        $catRes->assertJsonPath('data.0.id', $bookA->category_id);

        // 2. Books scoped to Library A & Category A
        $bookRes = $this->getJson("/api/books?library_id={$bookA->library_id}&category_id={$bookA->category_id}")->assertOk();
        $bookRes->assertJsonCount(1, 'data');
        $bookRes->assertJsonPath('data.0.id', $bookA->id);

        // 3. Books available_only filter -> includes Book A (qty 10), excludes Book B (qty 0)
        $availRes = $this->getJson('/api/books?available_only=1')->assertOk();
        $availIds = collect($availRes->json('data'))->pluck('id')->toArray();
        $this->assertContains($bookA->id, $availIds);
        $this->assertNotContains($bookB->id, $availIds);
    }

    private function makeLibraryData(int $quantity): array
    {
        $member = User::factory()->create(['role' => 'member', 'status' => 'active']);
        $librarian = User::factory()->create(['role' => 'librarian', 'status' => 'active']);
        $this->giveSubscription($librarian);
        $library = Library::create([
            'owner_id' => $librarian->id,
            'name' => 'Test Library',
            'address' => 'Test Address',
            'status' => 'active',
        ]);
        $category = Category::create([
            'library_id' => $library->id,
            'name' => 'Testing',
            'status' => 'active',
        ]);
        $book = Book::create([
            'library_id' => $library->id,
            'category_id' => $category->id,
            'title' => 'Testing Laravel',
            'author' => 'Tester',
            'quantity' => $quantity,
            'available_quantity' => $quantity,
            'status' => 'active',
        ]);

        return [$member, $librarian, $book];
    }

    private function giveSubscription(User $user): void
    {
        $plan = SubscriptionPlan::firstOrCreate(
            ['name' => 'Test Librarian Plan'],
            ['price' => 5, 'duration_days' => 30, 'status' => 'active']
        );
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'start_date' => today(),
            'end_date' => today()->addDays(29),
            'status' => 'active',
        ]);
    }

    public function test_admin_subscriptions_payments_and_notifications_work(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'status' => 'active']);
        [$member, $librarian, $book] = $this->makeLibraryData(1);

        $this->actingAs($admin, 'sanctum')->getJson('/api/admin/subscriptions')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/admin/payments')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/admin/notifications')->assertOk();

        // Check librarian member detail view
        $this->actingAs($member, 'sanctum')->postJson('/api/member/borrowings', ['book_id' => $book->id]);
        $this->actingAs($librarian, 'sanctum')->getJson("/api/librarian/members/{$member->id}")->assertOk();
    }
}
