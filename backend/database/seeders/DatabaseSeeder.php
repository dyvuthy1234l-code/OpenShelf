<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use App\Models\Library;
use App\Models\User;
use App\Models\Borrowing;
use App\Models\SubscriptionPlan;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Favorite;
use App\Models\Waitlist;
use App\Models\Review;
use App\Models\LibraryReview;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('notifications')->truncate();
        Review::truncate();
        LibraryReview::truncate();
        Favorite::truncate();
        Waitlist::truncate();
        Borrowing::truncate();
        Payment::truncate();
        Subscription::truncate();
        SubscriptionPlan::truncate();
        Book::truncate();
        Category::truncate();
        Library::truncate();
        User::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ═══════════════════════════════════════════════════════════
        // 1. SUBSCRIPTION PLANS
        // ═══════════════════════════════════════════════════════════
        $plans = [
            SubscriptionPlan::create([
                'name' => 'Starter Monthly',
                'description' => 'Ideal for small community libraries and student clubs.',
                'price' => 9.99,
                'duration_days' => 30,
                'max_concurrent_borrows' => 10,
                'status' => 'active',
            ]),
            SubscriptionPlan::create([
                'name' => 'Pro Librarian Annual',
                'description' => 'Full-featured library management suite for public and academic libraries.',
                'price' => 99.00,
                'duration_days' => 365,
                'max_concurrent_borrows' => 50,
                'status' => 'active',
            ]),
            SubscriptionPlan::create([
                'name' => 'Enterprise Network',
                'description' => 'Unlimited capacity, priority support, and multi-branch cataloging.',
                'price' => 249.00,
                'duration_days' => 365,
                'max_concurrent_borrows' => 200,
                'status' => 'active',
            ]),
        ];

        // ═══════════════════════════════════════════════════════════
        // 2. ADMIN USER
        // ═══════════════════════════════════════════════════════════
        $admin = User::create([
            'name' => 'OpenShelf Admin',
            'email' => 'admin@openshelf.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'status' => 'active',
            'phone' => '+855 12 888 999',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        ]);

        // ═══════════════════════════════════════════════════════════
        // 3. MEMBERS (20 REALISTIC READERS WITH PROFILES)
        // ═══════════════════════════════════════════════════════════
        $memberConfigs = [
            ['name' => 'Sokha Chan', 'phone' => '+855 12 345 601', 'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'],
            ['name' => 'Channary Vuthy', 'phone' => '+855 12 345 602', 'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'],
            ['name' => 'Davith Meas', 'phone' => '+855 12 345 603', 'avatar' => 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop'],
            ['name' => 'Sophea Rin', 'phone' => '+855 12 345 604', 'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop'],
            ['name' => 'Visal Ouk', 'phone' => '+855 12 345 605', 'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'],
            ['name' => 'Theara Lim', 'phone' => '+855 12 345 606', 'avatar' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'],
            ['name' => 'Serey Roth', 'phone' => '+855 12 345 607', 'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'],
            ['name' => 'Nary Kong', 'phone' => '+855 12 345 608', 'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop'],
            ['name' => 'Panha Som', 'phone' => '+855 12 345 609', 'avatar' => 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&h=200&fit=crop'],
            ['name' => 'Borey Prak', 'phone' => '+855 12 345 610', 'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop'],
            ['name' => 'Socheata Pich', 'phone' => '+855 12 345 611', 'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop'],
            ['name' => 'Vannak Ty', 'phone' => '+855 12 345 612', 'avatar' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop'],
            ['name' => 'Kunthea Sor', 'phone' => '+855 12 345 613', 'avatar' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop'],
            ['name' => 'Rithy Chhorn', 'phone' => '+855 12 345 614', 'avatar' => 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'],
            ['name' => 'Dany Sarun', 'phone' => '+855 12 345 615', 'avatar' => 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop'],
            ['name' => 'Kalyan Heang', 'phone' => '+855 12 345 616', 'avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop'],
            ['name' => 'Makara Phoung', 'phone' => '+855 12 345 617', 'avatar' => 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop'],
            ['name' => 'Bopha Nuon', 'phone' => '+855 12 345 618', 'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop'],
            ['name' => 'Chetra Keat', 'phone' => '+855 12 345 619', 'avatar' => 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&h=200&fit=crop'],
            ['name' => 'Vicheka Seng', 'phone' => '+855 12 345 620', 'avatar' => 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop'],
        ];

        $members = [];
        foreach ($memberConfigs as $idx => $cfg) {
            $num = $idx + 1;
            $member = User::create([
                'name' => $cfg['name'],
                'email' => "member{$num}@openshelf.com",
                'password' => Hash::make('password123'),
                'role' => 'member',
                'status' => 'active',
                'phone' => $cfg['phone'],
                'avatar' => $cfg['avatar'],
                'notification_preferences' => [
                    'loans' => ['in_app' => true, 'email' => true],
                    'returns' => ['in_app' => true, 'email' => true],
                    'announcements' => ['in_app' => true, 'email' => false],
                ],
            ]);

            // Add member subscription
            $plan = $plans[array_rand($plans)];
            $sub = Subscription::create([
                'user_id' => $member->id,
                'plan_id' => $plan->id,
                'start_date' => Carbon::now()->subMonths(1),
                'end_date' => Carbon::now()->addMonths(5),
                'status' => 'active',
            ]);

            Payment::create([
                'user_id' => $member->id,
                'subscription_id' => $sub->id,
                'amount' => $plan->price,
                'payment_method' => ($idx % 2 === 0) ? 'ABA PayWay' : 'KHQR Bakong',
                'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
                'status' => 'paid',
                'paid_at' => Carbon::now()->subMonths(1),
            ]);

            $members[] = $member;
        }

        // ═══════════════════════════════════════════════════════════
        // 4. LIBRARIANS & LIBRARIES (8 COMPREHENSIVE LIBRARIES)
        // ═══════════════════════════════════════════════════════════
        $librarianConfigs = [
            [
                'name' => 'Dara Sothea',
                'email' => 'librarian1@openshelf.com',
                'phone' => '+855 12 777 001',
                'avatar' => 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
                'lib_name' => 'Central City Library',
                'city' => 'Phnom Penh',
                'address' => 'Corner of Preah Norodom Blvd & St 136, Phnom Penh',
                'desc' => 'The premier central public library featuring over 50,000 physical volumes, high-speed Wi-Fi, modern study pods, and multimedia archives.',
                'image' => 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&h=500&fit=crop',
                'opening_hours' => 'Mon - Fri: 8:00 AM - 7:00 PM, Sat - Sun: 9:00 AM - 5:00 PM',
                'borrowing_rules' => 'Present OpenShelf digital QR member pass at pickup counter. Maximum 5 books concurrently. Loan duration is 14 days with up to 1 online renewal.',
                'borrowing_period_days' => 14,
                'fine_per_day' => 0.50,
                'max_books' => 5,
                'cats' => ['Fiction & Literature', 'Science & Innovation', 'World History', 'Biographies & Memoirs', 'Philosophy & Mind'],
            ],
            [
                'name' => 'Kosal Vong',
                'email' => 'librarian2@openshelf.com',
                'phone' => '+855 12 777 002',
                'avatar' => 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
                'lib_name' => 'Tech Hub Books & Innovation Lab',
                'city' => 'Phnom Penh',
                'address' => 'St 315, Toul Kork Innovation District, Phnom Penh',
                'desc' => 'A cutting-edge tech library and collaborative workspace focusing on software engineering, cloud computing, artificial intelligence, and startup leadership.',
                'image' => 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1550592704-6c76defa9985?w=1400&h=500&fit=crop',
                'opening_hours' => 'Mon - Sat: 7:30 AM - 8:30 PM, Sun: 9:00 AM - 6:00 PM',
                'borrowing_rules' => 'Instant barcode check-out. Code repository links included with technical titles. 21 days standard loan period for developers and students.',
                'borrowing_period_days' => 21,
                'fine_per_day' => 1.00,
                'max_books' => 4,
                'cats' => ['Software Engineering', 'Artificial Intelligence', 'UI/UX Design', 'Cloud Architecture', 'Startup & Venture'],
            ],
            [
                'name' => 'Bopha Chea',
                'email' => 'librarian3@openshelf.com',
                'phone' => '+855 12 777 003',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
                'lib_name' => 'National Heritage & Archives Library',
                'city' => 'Phnom Penh',
                'address' => 'St 92 near Wat Phnom, Daun Penh, Phnom Penh',
                'desc' => 'Preserving centuries of Cambodian heritage, Southeast Asian history, rare manuscripts, Khmer literature, and antique colonial prints.',
                'image' => 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&h=500&fit=crop',
                'opening_hours' => 'Mon - Fri: 8:00 AM - 5:30 PM, Closed Sunday',
                'borrowing_rules' => 'Special handling required for antique volumes. Reading room access free; borrowing privileges available for verified researchers.',
                'borrowing_period_days' => 14,
                'fine_per_day' => 0.75,
                'max_books' => 3,
                'cats' => ['Khmer History', 'Classical Literature', 'Archaeology', 'Southeast Asian Arts'],
            ],
            [
                'name' => 'Kimly Meas',
                'email' => 'librarian4@openshelf.com',
                'phone' => '+855 12 777 004',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
                'lib_name' => 'Sakura Manga & Comic Lounge',
                'city' => 'Phnom Penh',
                'address' => 'St 278, BKK1 Lifestyle Quarter, Phnom Penh',
                'desc' => 'A cozy Japanese manga cafe and graphic novel library boasting over 12,000 translated and original Japanese manga, webtoons, and artbooks.',
                'image' => 'https://images.unsplash.com/photo-1613324682498-08f307455d31?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?w=1400&h=500&fit=crop',
                'opening_hours' => 'Tue - Sun: 10:00 AM - 9:00 PM, Closed Monday',
                'borrowing_rules' => 'Careful handling of dust jackets required. Box sets borrowable as single unit. Fast 7-day turnaround for latest chapters.',
                'borrowing_period_days' => 7,
                'fine_per_day' => 0.50,
                'max_books' => 6,
                'cats' => ['Shonen & Action', 'Seinen & Mystery', 'Graphic Novels', 'Fantasy & Isekai'],
            ],
            [
                'name' => 'Rathana Keo',
                'email' => 'librarian5@openshelf.com',
                'phone' => '+855 12 777 005',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                'lib_name' => 'Future Kids & Youth Discovery Hub',
                'city' => 'Siem Reap',
                'address' => 'Pokambor Ave, Riverside District, Siem Reap',
                'desc' => 'A vibrant, colorful space dedicated to igniting the imagination of children, young adults, and educators through interactive storytelling and STEM kits.',
                'image' => 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1554418651-70309daf95f5?w=1400&h=500&fit=crop',
                'opening_hours' => 'Mon - Sun: 8:00 AM - 6:00 PM',
                'borrowing_rules' => 'Family memberships allow up to 8 books across child categories. No late fines for picture books returned in good condition.',
                'borrowing_period_days' => 14,
                'fine_per_day' => 0.25,
                'max_books' => 8,
                'cats' => ['Children & Fairy Tales', 'Young Adult Fiction', 'STEM for Kids', 'Illustrated Encyclopedias'],
            ],
            [
                'name' => 'Piseth Ngeth',
                'email' => 'librarian6@openshelf.com',
                'phone' => '+855 12 777 006',
                'avatar' => 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop',
                'lib_name' => 'Medical & Life Sciences Academic Library',
                'city' => 'Phnom Penh',
                'address' => 'Near University of Health Sciences, St 182, Phnom Penh',
                'desc' => 'Comprehensive medical textbooks, anatomical atlases, pharmacology journals, and public health research volumes for medical professionals and scholars.',
                'image' => 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&h=500&fit=crop',
                'opening_hours' => 'Mon - Sat: 7:00 AM - 9:00 PM',
                'borrowing_rules' => 'Reserve collection books available for 3-day loan. General medical textbooks 14 days loan.',
                'borrowing_period_days' => 14,
                'fine_per_day' => 1.50,
                'max_books' => 3,
                'cats' => ['Clinical Medicine', 'Pharmacology', 'Biomedical Science', 'Public Health'],
            ],
            [
                'name' => 'Sreymom Heng',
                'email' => 'librarian7@openshelf.com',
                'phone' => '+855 12 777 007',
                'avatar' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
                'lib_name' => 'Angkor Heritage & Cultural Studies Center',
                'city' => 'Siem Reap',
                'address' => 'Charles de Gaulle Blvd, Siem Reap City',
                'desc' => 'Dedicated to the architectural majesty of Angkor Wat, ancient civilizations, tropical forestry, and traditional Khmer arts and crafts.',
                'image' => 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1400&h=500&fit=crop',
                'opening_hours' => 'Mon - Sun: 8:00 AM - 6:30 PM',
                'borrowing_rules' => 'Tour guides, researchers, and local residents receive 21 days borrowing privilege with active membership.',
                'borrowing_period_days' => 21,
                'fine_per_day' => 0.50,
                'max_books' => 5,
                'cats' => ['Angkor Civilizations', 'Fine Arts & Architecture', 'Cultural Anthropology', 'Eco-Tourism'],
            ],
            [
                'name' => 'Chanthou Seng',
                'email' => 'librarian8@openshelf.com',
                'phone' => '+855 12 777 008',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
                'lib_name' => 'Battambang Arts & Colonial Literature Library',
                'city' => 'Battambang',
                'address' => 'St 1.5, Heritage Riverfront Precinct, Battambang',
                'desc' => 'Nestled in a restored 1920s French colonial manor, offering rich collections of modern contemporary painting, poetry, cinema, and acoustic arts.',
                'image' => 'https://images.unsplash.com/photo-1526721940322-10fb6e3ae94a?w=600&h=600&fit=crop',
                'cover' => 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1400&h=500&fit=crop',
                'opening_hours' => 'Tue - Sun: 8:30 AM - 7:00 PM',
                'borrowing_rules' => 'Quiet reading garden open to all visitors. Up to 4 art monographs borrowable simultaneously.',
                'borrowing_period_days' => 14,
                'fine_per_day' => 0.50,
                'max_books' => 4,
                'cats' => ['Contemporary Arts', 'Poetry & Prose', 'Cinema & Photography', 'French Colonial Architecture'],
            ],
        ];

        // Master book catalog definitions
        $sampleBookData = [
            ['title' => 'Atomic Habits', 'author' => 'James Clear', 'publisher' => 'Avery', 'year' => 2018, 'desc' => 'An easy and proven way to build good habits and break bad ones. Tiny changes produce remarkable results.'],
            ['title' => 'Clean Code: A Handbook of Agile Craftsmanship', 'author' => 'Robert C. Martin', 'publisher' => 'Prentice Hall', 'year' => 2008, 'desc' => 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees.'],
            ['title' => 'Designing Data-Intensive Applications', 'author' => 'Martin Kleppmann', 'publisher' => 'O\'Reilly Media', 'year' => 2017, 'desc' => 'The definitive guide to the architecture of modern scalable, reliable, and maintainable systems.'],
            ['title' => 'Sapiens: A Brief History of Humankind', 'author' => 'Yuval Noah Harari', 'publisher' => 'Harper', 'year' => 2014, 'desc' => 'One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one: Homo sapiens.'],
            ['title' => 'Thinking, Fast and Slow', 'author' => 'Daniel Kahneman', 'publisher' => 'Farrar, Straus and Giroux', 'year' => 2011, 'desc' => 'The groundbreaking tour of the mind explaining the two systems that drive the way we think and make choices.'],
            ['title' => 'The Lean Startup', 'author' => 'Eric Ries', 'publisher' => 'Crown Business', 'year' => 2011, 'desc' => 'How today\'s entrepreneurs use continuous innovation to create radically successful businesses.'],
            ['title' => 'Deep Work: Rules for Focused Success', 'author' => 'Cal Newport', 'publisher' => 'Grand Central Publishing', 'year' => 2016, 'desc' => 'Deep work is the ability to focus without distraction on a cognitively demanding task.'],
            ['title' => 'The Pragmatic Programmer: 20th Anniversary Edition', 'author' => 'David Thomas & Andrew Hunt', 'publisher' => 'Addison-Wesley', 'year' => 2019, 'desc' => 'One of the most significant books on modern software construction and craftsmanship.'],
            ['title' => 'Zero to One: Notes on Startups', 'author' => 'Peter Thiel', 'publisher' => 'Crown Currency', 'year' => 2014, 'desc' => 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create.'],
            ['title' => 'Angkor: Heart of an Asian Empire', 'author' => 'Bruno Dagens', 'publisher' => 'Thames & Hudson', 'year' => 1995, 'desc' => 'An illustrated chronicle detailing the architectural grandeur and cultural depth of the Khmer Empire.'],
            ['title' => 'The Psychology of Money', 'author' => 'Morgan Housel', 'publisher' => 'Harriman House', 'year' => 2020, 'desc' => 'Doing well with money isn\'t necessarily about what you know. It\'s about how you behave.'],
            ['title' => 'A History of Cambodia', 'author' => 'David Chandler', 'publisher' => 'Westview Press', 'year' => 2007, 'desc' => 'The definitive survey of Cambodia\'s political, cultural, and social trajectory across centuries.'],
            ['title' => 'Dune (Deluxe Hardcover Edition)', 'author' => 'Frank Herbert', 'publisher' => 'Chilton Books', 'year' => 1965, 'desc' => 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides as he navigates destiny and empire.'],
            ['title' => '1984', 'author' => 'George Orwell', 'publisher' => 'Secker & Warburg', 'year' => 1949, 'desc' => 'A startling and timeless dystopian vision of surveillance, language manipulation, and power.'],
            ['title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'publisher' => 'J. B. Lippincott & Co.', 'year' => 1960, 'desc' => 'A gripping, heart-wrenching story of justice and compassion in the American Deep South.'],
            ['title' => 'The Alchemist: 25th Anniversary Edition', 'author' => 'Paulo Coelho', 'publisher' => 'HarperOne', 'year' => 1988, 'desc' => 'A magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of worldly treasure.'],
            ['title' => 'Clean Architecture: A Craftsman\'s Guide', 'author' => 'Robert C. Martin', 'publisher' => 'Prentice Hall', 'year' => 2017, 'desc' => 'Practical software structure, separation of concerns, and testable component boundaries.'],
            ['title' => 'Building Microservices: Designing Fine-Grained Systems', 'author' => 'Sam Newman', 'publisher' => 'O\'Reilly Media', 'year' => 2021, 'desc' => 'Concepts in service modeling, integration, testing, deployment, and monitoring at scale.'],
            ['title' => 'Refactoring: Improving the Design of Existing Code', 'author' => 'Martin Fowler', 'publisher' => 'Addison-Wesley', 'year' => 2018, 'desc' => 'Understand the principles of refactoring and learn how to make software easier to maintain.'],
            ['title' => 'Head First Design Patterns', 'author' => 'Eric Freeman & Elisabeth Robson', 'publisher' => 'O\'Reilly Media', 'year' => 2020, 'desc' => 'A brain-friendly guide to proven object-oriented software design patterns and best practices.'],
            ['title' => 'The Design of Everyday Things', 'author' => 'Don Norman', 'publisher' => 'Basic Books', 'year' => 2013, 'desc' => 'Even the smartest among us can feel inept when trying to figure out which switch to flip or door to push.'],
            ['title' => 'Don\'t Make Me Think, Revisited', 'author' => 'Steve Krug', 'publisher' => 'New Riders', 'year' => 2014, 'desc' => 'A Common Sense Approach to Web & Mobile Usability that every developer and designer must read.'],
            ['title' => 'Stories of Angkor and the Great Kings', 'author' => 'Chheng Phon', 'publisher' => 'Phnom Penh Heritage Press', 'year' => 2016, 'desc' => 'Traditional Khmer oral histories and mythological epics transcribed for modern literature enthusiasts.'],
            ['title' => 'Introduction to Algorithms (CLRS)', 'author' => 'Thomas H. Cormen', 'publisher' => 'MIT Press', 'year' => 2022, 'desc' => 'Comprehensive textbook covering a broad spectrum of algorithms in depth with rigorous analysis.'],
            ['title' => 'JavaScript: The Definitive Guide (7th Ed)', 'author' => 'David Flanagan', 'publisher' => 'O\'Reilly Media', 'year' => 2020, 'desc' => 'Master modern JavaScript (ES2020+) from web APIs and async programming to full-stack architectures.'],
        ];

        $bookCovers = [
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1626379953822-ba31950e2788?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1534665482403-a909d0d97c67?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1529158062015-c6424aa0b182?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1511108690759-009324a90311?w=500&h=750&fit=crop',
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=750&fit=crop',
        ];

        $librarians = [];
        $libraries = [];
        $allBooks = [];

        foreach ($librarianConfigs as $i => $libCfg) {
            // Create Librarian User
            $librarian = User::create([
                'name' => $libCfg['name'],
                'email' => $libCfg['email'],
                'password' => Hash::make('password123'),
                'role' => 'librarian',
                'status' => 'active',
                'phone' => $libCfg['phone'],
                'avatar' => $libCfg['avatar'],
                'notification_preferences' => [
                    'borrow_requests' => ['in_app' => true, 'email' => true],
                    'returns' => ['in_app' => true, 'email' => true],
                    'reviews' => ['in_app' => true, 'email' => false],
                ],
            ]);

            // Give Librarian an active Pro Subscription & Payment
            $proPlan = $plans[1]; // Pro Annual
            $libSub = Subscription::create([
                'user_id' => $librarian->id,
                'plan_id' => $proPlan->id,
                'start_date' => Carbon::now()->subMonths(2),
                'end_date' => Carbon::now()->addMonths(10),
                'status' => 'active',
            ]);

            Payment::create([
                'user_id' => $librarian->id,
                'subscription_id' => $libSub->id,
                'amount' => $proPlan->price,
                'payment_method' => 'ABA PayWay Card',
                'transaction_id' => 'LIB-SUB-' . strtoupper(Str::random(8)),
                'status' => 'paid',
                'paid_at' => Carbon::now()->subMonths(2),
            ]);

            // Create Library
            $library = Library::create([
                'owner_id' => $librarian->id,
                'name' => $libCfg['lib_name'],
                'city' => $libCfg['city'],
                'address' => $libCfg['address'],
                'description' => $libCfg['desc'],
                'image' => $libCfg['image'],
                'cover_image' => $libCfg['cover'],
                'phone' => $libCfg['phone'],
                'email' => 'contact@' . Str::slug($libCfg['lib_name']) . '.com',
                'opening_hours' => $libCfg['opening_hours'],
                'borrowing_rules' => $libCfg['borrowing_rules'],
                'borrowing_period_days' => $libCfg['borrowing_period_days'],
                'fine_per_day' => $libCfg['fine_per_day'],
                'max_books_per_member' => $libCfg['max_books'],
                'google_maps_url' => 'https://maps.google.com/?q=' . urlencode($libCfg['lib_name'] . ' ' . $libCfg['address']),
                'status' => 'active',
            ]);

            $librarians[] = $librarian;
            $libraries[] = $library;

            // Library Reviews from random members
            $reviewers = collect($members)->random(rand(4, 8));
            foreach ($reviewers as $revMember) {
                LibraryReview::create([
                    'library_id' => $library->id,
                    'user_id' => $revMember->id,
                    'rating' => rand(4, 5),
                    'comment' => 'Outstanding library experience! Quiet reading spaces, helpful librarian staff, and very well organized catalog.',
                ]);
            }

            // Create Categories & Books for this library
            foreach ($libCfg['cats'] as $catIdx => $catName) {
                $category = Category::create([
                    'library_id' => $library->id,
                    'name' => $catName,
                    'status' => 'active',
                ]);

                // Create 6-10 books per category
                $numBooks = rand(6, 10);
                for ($b = 0; $b < $numBooks; $b++) {
                    $template = $sampleBookData[array_rand($sampleBookData)];
                    $totalQty = rand(4, 15);
                    $availQty = rand(1, $totalQty);
                    $isbn = '978-' . rand(1, 9) . '-' . rand(100, 999) . '-' . rand(10000, 99999) . '-' . rand(0, 9);

                    $book = Book::create([
                        'library_id' => $library->id,
                        'category_id' => $category->id,
                        'title' => $template['title'] . ($b > 0 ? " (Vol. " . ($b + 1) . ")" : ""),
                        'author' => $template['author'],
                        'publisher' => $template['publisher'],
                        'publication_year' => $template['year'],
                        'isbn' => $isbn,
                        'quantity' => $totalQty,
                        'available_quantity' => $availQty,
                        'cover_image' => $bookCovers[array_rand($bookCovers)],
                        'description' => $template['desc'] . " Part of the {$catName} collection at {$library->name}.",
                        'status' => 'active',
                    ]);

                    $allBooks[] = $book;

                    // Add Book Reviews
                    if (rand(1, 100) <= 65) {
                        $bookReviewers = collect($members)->random(rand(2, 5));
                        foreach ($bookReviewers as $bUser) {
                            Review::create([
                                'book_id' => $book->id,
                                'user_id' => $bUser->id,
                                'rating' => rand(4, 5),
                                'comment' => "Thoroughly enjoyed reading {$book->title}. The insights and writing flow were phenomenal.",
                            ]);
                        }
                    }
                }
            }
        }

        // ═══════════════════════════════════════════════════════════
        // 5. BORROWINGS ACROSS ALL LIFECYCLE STATES (FOR MEMBERS & LIBRARIANS)
        // ═══════════════════════════════════════════════════════════
        // Statuses: 'pending', 'approved', 'borrowed', 'return_requested', 'returned', 'overdue', 'rejected'

        $borrowingScenarios = [
            // 1. PENDING REQUESTS (Librarians need to approve/reject; Members see 'Request Pending')
            [
                'status' => 'pending',
                'requested_at' => Carbon::now()->subHours(rand(2, 24)),
                'approved_at' => null,
                'picked_up_at' => null,
                'due_date' => null,
                'returned_at' => null,
                'count' => 12,
            ],
            // 2. APPROVED REQUESTS (Waiting for member to visit library and pick up!)
            [
                'status' => 'approved',
                'requested_at' => Carbon::now()->subDays(2),
                'approved_at' => Carbon::now()->subDays(1),
                'picked_up_at' => null,
                'due_date' => Carbon::now()->addDays(14),
                'returned_at' => null,
                'count' => 10,
            ],
            // 3. ACTIVELY BORROWED ON-LOAN (Active reading with healthy remaining due date)
            [
                'status' => 'borrowed',
                'requested_at' => Carbon::now()->subDays(10),
                'approved_at' => Carbon::now()->subDays(9),
                'picked_up_at' => Carbon::now()->subDays(8),
                'due_date' => Carbon::now()->addDays(6),
                'returned_at' => null,
                'count' => 18,
            ],
            // 4. RETURN REQUESTED (Member finished reading & requested return; Librarian needs to confirm!)
            [
                'status' => 'return_requested',
                'requested_at' => Carbon::now()->subDays(14),
                'approved_at' => Carbon::now()->subDays(13),
                'picked_up_at' => Carbon::now()->subDays(12),
                'due_date' => Carbon::now()->addDays(2),
                'returned_at' => null,
                'count' => 8,
            ],
            // 5. OVERDUE LOANS (Due date passed; Fine accumulated!)
            [
                'status' => 'overdue',
                'requested_at' => Carbon::now()->subDays(28),
                'approved_at' => Carbon::now()->subDays(27),
                'picked_up_at' => Carbon::now()->subDays(26),
                'due_date' => Carbon::now()->subDays(5),
                'returned_at' => null,
                'fine_amount' => 2.50,
                'fine_status' => 'unpaid',
                'count' => 6,
            ],
            // 6. RETURNED HISTORY (Completed past loans)
            [
                'status' => 'returned',
                'requested_at' => Carbon::now()->subDays(45),
                'approved_at' => Carbon::now()->subDays(44),
                'picked_up_at' => Carbon::now()->subDays(43),
                'due_date' => Carbon::now()->subDays(29),
                'returned_at' => Carbon::now()->subDays(30),
                'count' => 24,
            ],
            // 7. REJECTED REQUESTS (Declined with reason)
            [
                'status' => 'rejected',
                'requested_at' => Carbon::now()->subDays(5),
                'approved_at' => null,
                'picked_up_at' => null,
                'due_date' => null,
                'returned_at' => null,
                'rejection_reason' => 'Exceeded maximum active loan limit for standard membership.',
                'count' => 5,
            ],
        ];

        foreach ($borrowingScenarios as $scenario) {
            for ($k = 0; $k < $scenario['count']; $k++) {
                $book = $allBooks[array_rand($allBooks)];
                $member = $members[array_rand($members)];

                Borrowing::create([
                    'user_id' => $member->id,
                    'book_id' => $book->id,
                    'library_id' => $book->library_id,
                    'status' => $scenario['status'],
                    'requested_at' => $scenario['requested_at'],
                    'approved_at' => $scenario['approved_at'],
                    'picked_up_at' => $scenario['picked_up_at'],
                    'due_date' => $scenario['due_date'],
                    'returned_at' => $scenario['returned_at'],
                    'fine_amount' => $scenario['fine_amount'] ?? 0.00,
                    'fine_status' => $scenario['fine_status'] ?? 'none',
                    'rejection_reason' => $scenario['rejection_reason'] ?? null,
                ]);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // 6. MEMBER FAVORITES & WAITLISTS
        // ═══════════════════════════════════════════════════════════
        foreach ($members as $mem) {
            // 4 to 8 favorite books per member
            $favBooks = collect($allBooks)->random(rand(4, 8));
            foreach ($favBooks as $fBook) {
                Favorite::firstOrCreate([
                    'user_id' => $mem->id,
                    'book_id' => $fBook->id,
                ]);
            }

            // 1 to 2 waitlists per member
            if (rand(1, 100) <= 60) {
                $wBook = $allBooks[array_rand($allBooks)];
                Waitlist::firstOrCreate([
                    'member_id' => $mem->id,
                    'book_id' => $wBook->id,
                ], [
                    'position' => rand(1, 3),
                ]);
            }
        }

        // ═══════════════════════════════════════════════════════════
        // 7. IN-APP DATABASE NOTIFICATIONS (LIBRARIANS & MEMBERS)
        // ═══════════════════════════════════════════════════════════
        // Notification seeding for each Librarian
        foreach ($librarians as $libUser) {
            $lib = $libUser->library;

            // 1. New borrow request notification (Unread)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\BorrowRequestCreated',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $libUser->id,
                'data' => json_encode([
                    'title' => 'New Borrow Request',
                    'message' => 'Member Sokha Chan requested to borrow "Atomic Habits". Please review.',
                    'target_url' => '/librarian/borrow-requests',
                ]),
                'read_at' => null, // Unread
                'created_at' => Carbon::now()->subMinutes(15),
                'updated_at' => Carbon::now()->subMinutes(15),
            ]);

            // 2. Return confirmation required (Unread)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\ReturnSubmitted',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $libUser->id,
                'data' => json_encode([
                    'title' => 'Book Return Submitted',
                    'message' => 'Member Davith Meas submitted return for "Clean Code". Confirm receipt.',
                    'target_url' => '/librarian/returns',
                ]),
                'read_at' => null, // Unread
                'created_at' => Carbon::now()->subHours(2),
                'updated_at' => Carbon::now()->subHours(2),
            ]);

            // 3. New 5-star review (Read)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\NewLibraryReview',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $libUser->id,
                'data' => json_encode([
                    'title' => '5-Star Review Received!',
                    'message' => 'Channary Vuthy left a 5-star review: "Amazing library environment!"',
                    'target_url' => '/librarian/library',
                ]),
                'read_at' => Carbon::now()->subDay(),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDay(),
            ]);

            // 4. Subscription active alert (Read)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\SubscriptionActive',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $libUser->id,
                'data' => json_encode([
                    'title' => 'Pro Subscription Active',
                    'message' => 'Your Pro Librarian Annual Plan is active through ' . Carbon::now()->addMonths(10)->format('M d, Y') . '.',
                    'target_url' => '/librarian/subscription',
                ]),
                'read_at' => Carbon::now()->subDays(5),
                'created_at' => Carbon::now()->subDays(7),
                'updated_at' => Carbon::now()->subDays(5),
            ]);
        }

        // Notification seeding for Members
        foreach ($members as $memUser) {
            // Loan approved notification
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\BorrowRequestApproved',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $memUser->id,
                'data' => json_encode([
                    'title' => 'Borrow Request Approved!',
                    'message' => 'Your request for "Designing Data-Intensive Applications" was approved. Ready for pickup at Central City Library.',
                    'target_url' => '/member/borrowings',
                ]),
                'read_at' => null, // Unread
                'created_at' => Carbon::now()->subHours(3),
                'updated_at' => Carbon::now()->subHours(3),
            ]);

            // Return accepted notification
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\\Notifications\\ReturnAccepted',
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $memUser->id,
                'data' => json_encode([
                    'title' => 'Book Return Completed',
                    'message' => 'Your return for "The Lean Startup" has been verified and processed by the librarian. Thank you!',
                    'target_url' => '/member/borrowings',
                ]),
                'read_at' => Carbon::now()->subDays(1),
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(1),
            ]);
        }
    }
}

