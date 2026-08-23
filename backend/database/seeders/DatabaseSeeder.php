<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use App\Models\Library;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Review;
use App\Models\LibraryReview;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Review::truncate();
        LibraryReview::truncate();
        Book::truncate();
        Category::truncate();
        Library::truncate();
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Admin
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@openshelf.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
        ]);

        // Members
        $members = [];
        for ($i=1; $i<=20; $i++) {
            $members[] = User::create([
                'name' => "Member User $i",
                'email' => "member$i@openshelf.com",
                'password' => Hash::make('password123'),
                'role' => 'member',
                'status' => 'active',
                'avatar' => "https://i.pravatar.cc/150?img=$i",
            ]);
        }

        // Library Data
        $libraryData = [
            [
                'name' => 'Central City Library',
                'desc' => 'The largest public library in the downtown area featuring over 50,000 books.',
                'image' => 'https://images.unsplash.com/photo-1568667256549-094345857637?w=500&h=500&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=400&fit=crop',
                'cats' => ['Fiction', 'Science', 'History', 'Children', 'Biography']
            ],
            [
                'name' => 'Tech Hub Books',
                'desc' => 'A specialized library focusing on software engineering, data science, and modern technology.',
                'image' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=500&h=500&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1550592704-6c76defa9985?w=1200&h=400&fit=crop',
                'cats' => ['Programming', 'Design', 'Business', 'AI', 'Startup']
            ],
            [
                'name' => 'National Archives',
                'desc' => 'Preserving history with a vast collection of historical records, classic literature, and ancient texts.',
                'image' => 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&h=500&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop',
                'cats' => ['History', 'Classics', 'Philosophy', 'Art']
            ],
            [
                'name' => 'Sakura Manga Lounge',
                'desc' => 'Your cozy spot for Japanese manga, comic books, and graphic novels.',
                'image' => 'https://images.unsplash.com/photo-1613324682498-08f307455d31?w=500&h=500&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=1200&h=400&fit=crop',
                'cats' => ['Manga', 'Comics', 'Fantasy', 'Action']
            ],
            [
                'name' => 'Future Kids Library',
                'desc' => 'A colorful and safe environment for children to discover the joy of reading.',
                'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1554418651-70309daf95f5?w=1200&h=400&fit=crop',
                'cats' => ['Children', 'Education', 'Fairy Tales', 'Science for Kids']
            ],
            [
                'name' => 'Medical & Science Center',
                'desc' => 'A premier collection of medical journals, biology research, and scientific literature.',
                'image' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=500&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=400&fit=crop',
                'cats' => ['Medicine', 'Biology', 'Chemistry', 'Research']
            ]
        ];

        // Sample Books Data
        $bookTitles = ['The Lost Symbol', 'Digital Fortress', 'Clean Architecture', 'Atomic Habits', 'Thinking Fast and Slow', 'The Lean Startup', 'Design Patterns', 'Harry Potter', 'Lord of the Rings', 'The Alchemist', 'Sapiens', 'Educated', 'Dune', '1984', 'To Kill a Mockingbird', 'The Great Gatsby', 'Fahrenheit 451', 'Brave New World', 'The Hobbit', 'Pride and Prejudice', 'Catch-22', 'The Catcher in the Rye', 'Animal Farm', 'The Grapes of Wrath', 'Moby Dick', 'War and Peace', 'Hamlet', 'Macbeth', 'Romeo and Juliet', 'The Odyssey', 'The Iliad', 'Crime and Punishment', 'The Brothers Karamazov', 'Anna Karenina', 'The Divine Comedy', 'Les Miserables', 'The Count of Monte Cristo', 'Don Quixote', 'One Hundred Years of Solitude', 'The Bell Jar', 'The Picture of Dorian Gray', 'Frankenstein', 'Dracula', 'Jane Eyre', 'Wuthering Heights', 'Great Expectations', 'David Copperfield', 'A Tale of Two Cities', 'Oliver Twist', 'The Adventures of Huckleberry Finn'];
        $bookAuthors = ['Dan Brown', 'Robert C. Martin', 'James Clear', 'Daniel Kahneman', 'Eric Ries', 'Gang of Four', 'J.K. Rowling', 'J.R.R. Tolkien', 'Paulo Coelho', 'Yuval Noah Harari', 'Tara Westover', 'Frank Herbert', 'George Orwell', 'Harper Lee', 'F. Scott Fitzgerald', 'Ray Bradbury', 'Aldous Huxley', 'Jane Austen', 'Joseph Heller', 'J.D. Salinger', 'John Steinbeck', 'Herman Melville', 'Leo Tolstoy', 'William Shakespeare', 'Homer', 'Fyodor Dostoevsky', 'Dante Alighieri', 'Victor Hugo', 'Alexandre Dumas', 'Miguel de Cervantes', 'Gabriel Garcia Marquez', 'Sylvia Plath', 'Oscar Wilde', 'Mary Shelley', 'Emily Bronte', 'Charles Dickens', 'Mark Twain'];
        $bookImages = [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1626379953822-ba31950e2788?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1529158062015-c6424aa0b182?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=400&h=600&fit=crop',
            'https://images.unsplash.com/photo-1511108690759-009324a90311?w=400&h=600&fit=crop',
        ];

        foreach ($libraryData as $i => $lData) {
            // Create Librarian
            $libUserId = $i + 1;
            $librarian = User::create([
                'name' => "Librarian $libUserId",
                'email' => "librarian$libUserId@openshelf.com",
                'password' => Hash::make('password123'),
                'role' => 'librarian',
                'status' => 'active',
                'avatar' => "https://i.pravatar.cc/150?img=" . ($i + 20),
            ]);

            // Create Library
            $library = Library::create([
                'owner_id' => $librarian->id,
                'name' => $lData['name'],
                'description' => $lData['desc'],
                'phone' => '+855 12 000 ' . str_pad($libUserId, 3, '0', STR_PAD_LEFT),
                'email' => "contact@lib$libUserId.com",
                'address' => 'Phnom Penh, Cambodia',
                'image' => $lData['image'],
                'cover_image' => $lData['cover'],
                'status' => 'active',
            ]);

            // Create Library Reviews (Random Rating)
            $numReviews = rand(2, 6);
            for ($r = 0; $r < $numReviews; $r++) {
                LibraryReview::create([
                    'library_id' => $library->id,
                    'user_id' => $members[array_rand($members)]->id,
                    'rating' => rand(3, 5),
                    'review' => 'Great library with an amazing collection and atmosphere!',
                ]);
            }

            // Create Categories & Books
            foreach ($lData['cats'] as $catName) {
                $category = Category::create([
                    'library_id' => $library->id,
                    'name' => $catName,
                    'status' => 'active'
                ]);

                // Create 8-15 books per category
                $numBooks = rand(8, 15);
                for ($b = 0; $b < $numBooks; $b++) {
                    $qty = rand(2, 20);
                    $book = Book::create([
                        'library_id' => $library->id,
                        'category_id' => $category->id,
                        'title' => $bookTitles[array_rand($bookTitles)] . ' - Vol ' . rand(1, 10),
                        'author' => $bookAuthors[array_rand($bookAuthors)],
                        'isbn' => '978' . rand(100000000, 999999999),
                        'quantity' => $qty,
                        'available_quantity' => $qty,
                        'cover_image' => $bookImages[array_rand($bookImages)],
                        'status' => 'active',
                        'description' => 'This is a beautifully written book that offers profound insights and keeps you engaged from the first page to the last. Highly recommended for readers interested in ' . $catName . '.'
                    ]);

                    // Add some reviews to the book
                    if (rand(1, 100) > 40) { // 60% chance to have reviews
                        $numBookReviews = rand(1, 5);
                        for ($br = 0; $br < $numBookReviews; $br++) {
                            Review::create([
                                'book_id' => $book->id,
                                'user_id' => $members[array_rand($members)]->id,
                                'rating' => rand(3, 5),
                                'comment' => 'This book was a fantastic read! Really enjoyed the structure and pacing.',
                            ]);
                        }
                    }
                }
            }
        }
    }
}
