# OpenShelf Backend Guide

OpenShelf is a Laravel 10 REST API for several libraries. React is not part
of this backend yet. A future React application can call these API routes with
Axios.

## 1. How a request moves through the backend

```text
React (later)
    ↓ Axios request
API route in routes/api.php
    ↓ auth / role / subscription middleware
Controller
    ↓ validation and business rules
Eloquent Model
    ↓ SQL query
MySQL database
```

The `/api` prefix is automatically added to routes in `routes/api.php` by
Laravel.

## 2. Important folders

- `app/Models` contains PHP classes that represent database tables.
- `app/Http/Controllers/Api` contains the API actions.
- `app/Http/Middleware` contains reusable access checks.
- `database/migrations` describes the database structure.
- `database/seeders/DatabaseSeeder.php` creates repeatable demo data.
- `routes/api.php` connects HTTP methods and URLs to controllers.
- `tests/Feature/OpenShelfApiTest.php` checks important API rules.

## 3. Models and relationships

| Model | Main purpose | Important relationships |
| --- | --- | --- |
| `User` | Admin, librarian, or member account | one library, borrowings, subscriptions, payments, favorites |
| `Library` | A library owned by one librarian | owner, books, borrowings |
| `Category` | A global book category | books |
| `Book` | A book in one library and category | library, category, borrowings, favorites |
| `Borrowing` | One member request and its lifecycle | user, book, library |
| `Favorite` | Member-to-book saved item | user, book |
| `SubscriptionPlan` | Price and duration of librarian access | subscriptions |
| `Subscription` | Access period for a user | user, plan, payments |
| `Payment` | Simulated payment record | user, subscription |

Categories are global. A category such as `Programming` can be used by books
in different libraries.

## 4. Database tables

The original project tables are `users`, `libraries`, `categories`, `books`,
`borrowings`, and `personal_access_tokens`. Additional tables are:

- `subscription_plans`: plan name, price, duration, and status.
- `subscriptions`: user, plan, start date, end date, and status.
- `payments`: simulated payment amount, transaction ID, and status.
- `favorites`: unique member/book pairs.
- `notifications`: simple database notifications for borrowing events.

`libraries.owner_id` is unique in Version 1, which enforces one library per
librarian at database level as well as in the controller.

## 5. Authentication and Sanctum tokens

### Register

`POST /api/register`

Send `name`, `email`, `password`, and `password_confirmation`. The backend
always creates an active `member`. A `role` field sent by the frontend is
ignored. Passwords are stored with Laravel `Hash::make`, never as plain text.

### Login

`POST /api/login`

Send `email` and `password`. Inactive users cannot log in. A successful login
returns a Sanctum token and the user.

For later Axios requests, send:

```text
Authorization: Bearer YOUR_TOKEN_HERE
Accept: application/json
```

`GET /api/me` returns the authenticated user. `POST /api/logout` deletes the
current token.

## 6. Role authorization

`auth:sanctum` answers: “Is this request authenticated?”

`role:admin`, `role:librarian`, or `role:member` answers: “Is this user’s role
allowed for this route?” `RoleMiddleware` returns:

- `401` when there is no authenticated user.
- `403` when the user is authenticated but has the wrong role.

Librarian management routes also use `active.subscription`. This checks that
the role is librarian and that the user has an active, non-expired
subscription. Expired subscriptions receive a clear `403` response.

## 7. Member flow

Members can:

1. Browse active libraries, books, and categories.
2. Filter libraries with `?search=RUPP`.
3. Filter books with `?search=laravel`, `?library_id=1`, or `?category_id=2`.
4. Request a book using only its `book_id`.
5. View their own borrowing history.
6. Save and remove favorite books.
7. Read database notifications.

The server loads the book and obtains `library_id` from that book. It does not
trust a library ID supplied by React. The book and library must be active, the
account must be an active member, and an active duplicate request is rejected.

## 8. Librarian flow

A librarian first gets librarian access through a successful subscription
payment simulation. The librarian then creates one library and manages only
that library.

Library image uploads use Laravel's `public` storage disk. MySQL stores only a
path such as `libraries/example.jpg`; API responses add `image_url`. Uploaded
files are limited to `jpg`, `jpeg`, `png`, or `webp`, with a 2 MB maximum.

For a multipart update, use `POST /api/librarian/library/update`. A normal
JSON update can use `PATCH /api/librarian/library`. React can send a file in a
`FormData` object.

Librarian book creation never accepts a trusted `library_id` from the client.
The library comes from the authenticated librarian's `owner_id`. Book update,
view, disable, and borrowing actions are all scoped to that same library.

Deleting a book disables it with status `inactive` instead of physically
deleting it, so old borrowing history remains safe.

## 9. Borrowing lifecycle

```text
Member
  ↓ request
pending
  ↓ librarian approves or rejects
approved                 rejected
  ↓ librarian confirms pickup
borrowed
  ↓ librarian confirms return
returned
```

The action endpoints are:

- `POST /api/librarian/borrowings/{id}/approve`
- `POST /api/librarian/borrowings/{id}/reject`
- `POST /api/librarian/borrowings/{id}/pickup`
- `POST /api/librarian/borrowings/{id}/return`

Every librarian action checks `borrowing.library_id` against the authenticated
librarian's library. A different librarian receives `403`.

## 10. Book quantity logic

`quantity` is the total number of physical copies.\
`available_quantity` is the number currently on the shelf.

For example, quantity `5` and available quantity `3` means two copies are
currently borrowed.

Creating a pending request does not change stock. Approval does not change
stock either. Pickup uses a database transaction and decreases
`available_quantity` by one. Return uses a transaction and increases it by
one, never above `quantity` or below zero.

## 11. Admin flow

Admins do not perform normal borrowing actions. They can view platform counts,
libraries, librarians, members, subscriptions, payments, and reports. Admins
can activate or deactivate member/librarian accounts and library status.

The normal status endpoint refuses to modify an admin account or the current
admin account, reducing the chance of accidental lockout.

## 12. Subscription and simulated payment flow

```text
Member
  ↓ choose a plan
POST /api/subscriptions
  ↓ development payment simulation
Payment = paid
  ↓ same database transaction
Subscription = active
  ↓ only now
User role = librarian
```

`GET /api/subscription-plans` lists active plans. `POST /api/subscriptions`
accepts `plan_id` and an optional `payment_method`. It creates a payment with
a `SIM-...` transaction ID. No real payment provider, card, bank, or gateway
is contacted. This is intentionally suitable only for a university demo.

## 13. Google Maps link

The library stores `google_maps_url`, `latitude`, and `longitude`. Version 1
does not call the Google Maps API and does not store an API key. React can
display the URL as a normal directions link.

## 14. Main API routes

All paths below start with `/api`.

| Area | Routes |
| --- | --- |
| Auth | `POST /register`, `POST /login`, `GET /me`, `POST /logout` |
| Catalogue | `GET /libraries`, `/libraries/{id}`, `/books`, `/books/{id}`, `/categories` |
| Member borrowing | `POST /member/borrowings`, `GET /member/borrowings`, `GET /member/borrowings/{id}` |
| Favorites | `GET /member/favorites`, `POST /member/favorites`, `DELETE /member/favorites/{book}` |
| Librarian library | `GET/POST /librarian/library`, `PATCH /librarian/library` |
| Librarian books | `GET/POST /librarian/books`, `GET/POST/PATCH/DELETE /librarian/books/{id}` |
| Librarian borrowing | `GET /librarian/borrowings` plus approve/reject/pickup/return actions |
| Admin | `/admin/dashboard`, `/admin/libraries`, `/admin/librarians`, `/admin/members`, reports |
| Subscription | `/subscription-plans`, `/subscriptions`, `/payments` |
| Notifications | `GET /notifications`, `POST /notifications/{id}/read` |

Successful responses use a `message` and/or `data` field. Laravel validation
errors use the normal Laravel JSON validation response.

## 15. Development accounts

`DatabaseSeeder` creates these accounts with password `password123`:

- Admin: `admin@openshelf.com`
- Librarian: `librarian@openshelf.com`
- Member: `member@openshelf.com`

The demo librarian receives an active simulated subscription. The seeder uses
`updateOrCreate`, so running it again does not create duplicate demo accounts.

Useful commands from the `backend` folder:

```text
php artisan migrate
php artisan db:seed
php artisan route:list
php artisan migrate:status
php artisan test
php artisan storage:link
```

`storage:link` makes files stored on the public disk available through their
`image_url` paths.

## 16. Files added and important files changed

Added controllers: `BookController`, `BorrowingController`,
`CategoryController`, `FavoriteController`, `SubscriptionController`,
`AdminController`, `ReportController`, and `NotificationController`.

Added models: `Favorite`, `SubscriptionPlan`, `Subscription`, and `Payment`.

Added `ActiveSubscriptionMiddleware`, six additive migrations for subscriptions,
payments, favorites, notifications, and one-library ownership, plus focused
feature tests.

Updated authentication, user relationships, library/book APIs, routes,
`RoleMiddleware` registration, the development seeder, and the original user
migration default so new users are members by default.

## 17. Current limitations

- There is no React frontend yet.
- Payments are simulated only.
- Notifications are database-only; there is no email, SMS, WebSocket, or push service.
- There is no PDF/Excel report export.
- Google Maps is a stored link only; there is no Maps API integration.
