<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use App\Models\Library;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Book::truncate();
        Category::truncate();
        Library::truncate();
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Users with Real Avatars
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@openshelf.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
        ]);

        $librarian1 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'librarian@openshelf.com',
            'password' => Hash::make('password123'),
            'role' => 'librarian',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
        ]);
        
        $librarian2 = User::create([
            'name' => 'Michael Chen',
            'email' => 'michael@openshelf.com',
            'password' => Hash::make('password123'),
            'role' => 'librarian',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        ]);

        for ($i=1; $i<=10; $i++) {
            User::create([
                'name' => "Member User $i",
                'email' => "member$i@openshelf.com",
                'password' => Hash::make('password123'),
                'role' => 'member',
                'status' => 'active',
                'avatar' => "https://i.pravatar.cc/150?img=$i",
            ]);
        }

        // 2. Real Libraries
        $lib1 = Library::create([
            'owner_id' => $librarian1->id,
            'name' => 'Central City Library',
            'description' => 'The largest public library in the downtown area featuring over 50,000 books and free co-working spaces.',
            'phone' => '+855 12 345 678',
            'email' => 'central@openshelf.com',
            'address' => '123 Main Blvd, Phnom Penh, Cambodia',
            'image' => 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=500&fit=crop',
            'cover_image' => 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=400&fit=crop',
            'status' => 'active',
        ]);

        $lib2 = Library::create([
            'owner_id' => $librarian2->id,
            'name' => 'Tech Hub Books',
            'description' => 'A specialized library focusing on software engineering, data science, and modern technology.',
            'phone' => '+855 98 765 432',
            'email' => 'techhub@openshelf.com',
            'address' => 'Tech Park, Toul Kork, Phnom Penh',
            'image' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&h=500&fit=crop',
            'cover_image' => 'https://images.unsplash.com/photo-1550592704-6c76defa9985?w=1200&h=400&fit=crop',
            'status' => 'active',
        ]);

        // 3. Categories for Lib1
        $cats1 = [];
        foreach(['Fiction', 'Science', 'History', 'Children'] as $c) {
            $cats1[$c] = Category::create(['library_id' => $lib1->id, 'name' => $c, 'status' => 'active']);
        }

        // 3. Categories for Lib2
        $cats2 = [];
        foreach(['Programming', 'Design', 'Business', 'AI'] as $c) {
            $cats2[$c] = Category::create(['library_id' => $lib2->id, 'name' => $c, 'status' => 'active']);
        }

        // 4. Books with Real Images for Lib1
        $booksLib1 = [
            ['The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 5, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop'],
            ['A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 3, 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=600&fit=crop'],
            ['Sapiens', 'Yuval Noah Harari', '9780062316097', 'History', 8, 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop'],
            ['Harry Potter', 'J.K. Rowling', '9780590353427', 'Children', 12, 'https://images.unsplash.com/photo-1626379953822-ba31950e2788?w=400&h=600&fit=crop'],
            ['1984', 'George Orwell', '9780451524935', 'Fiction', 4, 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop'],
            ['The Selfish Gene', 'Richard Dawkins', '9780192860927', 'Science', 2, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop'],
        ];

        foreach($booksLib1 as $b) {
            Book::create([
                'library_id' => $lib1->id,
                'category_id' => $cats1[$b[3]]->id,
                'title' => $b[0],
                'author' => $b[1],
                'isbn' => $b[2],
                'quantity' => $b[4],
                'available_quantity' => $b[4],
                'cover_image' => $b[5],
                'status' => 'active',
                'description' => 'A famous book available at Central City Library.'
            ]);
        }

        // 4. Books with Real Images for Lib2
        $booksLib2 = [
            ['Clean Code', 'Robert C. Martin', '9780132350884', 'Programming', 10, 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=600&fit=crop'],
            ['The Pragmatic Programmer', 'Andrew Hunt', '9780201616224', 'Programming', 7, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=600&fit=crop'],
            ['Design of Everyday Things', 'Don Norman', '9780465050659', 'Design', 5, 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=600&fit=crop'],
            ['Zero to One', 'Peter Thiel', '9780804139298', 'Business', 15, 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop'],
            ['Deep Learning', 'Ian Goodfellow', '9780262035613', 'AI', 4, 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=600&fit=crop'],
            ['Refactoring', 'Martin Fowler', '9780134757599', 'Programming', 6, 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop'],
            ['Steve Jobs', 'Walter Isaacson', '9781451648539', 'Business', 8, 'https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=400&h=600&fit=crop'],
        ];

        foreach($booksLib2 as $b) {
            Book::create([
                'library_id' => $lib2->id,
                'category_id' => $cats2[$b[3]]->id,
                'title' => $b[0],
                'author' => $b[1],
                'isbn' => $b[2],
                'quantity' => $b[4],
                'available_quantity' => $b[4],
                'cover_image' => $b[5],
                'status' => 'active',
                'description' => 'A technology-focused book available at Tech Hub Books.'
            ]);
        }
    }
}
