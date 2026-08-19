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

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. USERS
        |--------------------------------------------------------------------------
        */

        $admin = User::updateOrCreate(
            [
                'email' => 'admin@openshelf.com',
            ],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $librarian = User::updateOrCreate(
            [
                'email' => 'librarian@openshelf.com',
            ],
            [
                'name' => 'Demo Librarian',
                'password' => Hash::make('password123'),
                'role' => 'librarian',
                'status' => 'active',
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'member@openshelf.com',
            ],
            [
                'name' => 'Demo Member',
                'password' => Hash::make('password123'),
                'role' => 'member',
                'status' => 'active',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | 2. DEMO LIBRARY
        |--------------------------------------------------------------------------
        */

        $library = Library::updateOrCreate(
            [
                'owner_id' => $librarian->id,
            ],
            [
                'name' => 'OpenShelf Demo Library',
                'description' => 'A demo library for testing OpenShelf.',
                'phone' => '012345678',
                'email' => 'library@openshelf.com',
                'address' => 'Phnom Penh, Cambodia',

                'google_maps_url' => null,
                'latitude' => null,
                'longitude' => null,

                'status' => 'active',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | 3. LIBRARY CATEGORIES
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        | Categories belong to a library.
        | Therefore library_id MUST be provided.
        |
        */

        $categories = [];

        $categoryData = [
            [
                'Programming',
                'Programming and software development books.',
            ],
            [
                'Database',
                'Database design and management books.',
            ],
            [
                'Networking',
                'Computer networking and infrastructure books.',
            ],
            [
                'Science',
                'Science and research books.',
            ],
            [
                'Literature',
                'Literature and language books.',
            ],
        ];

        foreach ($categoryData as [$name, $description]) {

            $categories[$name] = Category::updateOrCreate(
                [
                    // FIX:
                    // Category belongs to this library
                    'library_id' => $library->id,
                    'name' => $name,
                ],
                [
                    'description' => $description,
                    'status' => 'active',
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | 4. DEMO BOOKS
        |--------------------------------------------------------------------------
        */

        $books = [
            [
                'Laravel Basics',
                'Demo Author',
                '978000000001',
                'Programming',
                5,
            ],
            [
                'React Fundamentals',
                'Demo Author',
                '978000000002',
                'Programming',
                3,
            ],
            [
                'Database Systems',
                'Demo Author',
                '978000000003',
                'Database',
                4,
            ],
        ];

        foreach (
            $books as
            [$title, $author, $isbn, $categoryName, $quantity]
        ) {

            Book::updateOrCreate(
                [
                    'library_id' => $library->id,
                    'isbn' => $isbn,
                ],
                [
                    'category_id' =>
                    $categories[$categoryName]->id,

                    'title' => $title,
                    'author' => $author,

                    'description' =>
                    'A sample book for testing OpenShelf.',

                    'quantity' => $quantity,

                    'available_quantity' =>
                    $quantity,

                    'status' => 'active',
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | 5. LIBRARIAN SUBSCRIPTION PLANS
        |--------------------------------------------------------------------------
        */

        $plans = [
            [
                'name' => 'Starter',
                'price' => 5.00,
                'duration_days' => 30,
                'status' => 'active',
            ],

            [
                'name' => 'Professional',
                'price' => 25.00,
                'duration_days' => 180,
                'status' => 'active',
            ],

            [
                'name' => 'Premium',
                'price' => 45.00,
                'duration_days' => 365,
                'status' => 'active',
            ],
        ];

        foreach ($plans as $planData) {

            SubscriptionPlan::updateOrCreate(
                [
                    'name' => $planData['name'],
                ],
                [
                    'price' => $planData['price'],

                    'duration_days' =>
                    $planData['duration_days'],

                    'status' =>
                    $planData['status'],
                ]
            );
        }


        /*
        |--------------------------------------------------------------------------
        | 6. DEMO LIBRARIAN SUBSCRIPTION
        |--------------------------------------------------------------------------
        |
        | Demo Librarian uses Starter Plan.
        |
        */

        $starterPlan = SubscriptionPlan::where(
            'name',
            'Starter'
        )->firstOrFail();


        $subscription = Subscription::updateOrCreate(
            [
                'user_id' => $librarian->id,
                'plan_id' => $starterPlan->id,
            ],
            [
                'status' => 'active',

                'start_date' => today(),

                'end_date' => today()->addDays(
                    $starterPlan->duration_days - 1
                ),
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | 7. DEMO PAYMENT
        |--------------------------------------------------------------------------
        */

        Payment::updateOrCreate(
            [
                'transaction_id' =>
                'SIM-DEMO-LIBRARIAN',
            ],
            [
                'user_id' =>
                $librarian->id,

                'subscription_id' =>
                $subscription->id,

                'amount' =>
                $starterPlan->price,

                'payment_method' =>
                'simulation',

                'status' =>
                'paid',

                'paid_at' =>
                now(),
            ]
        );
    }
}
