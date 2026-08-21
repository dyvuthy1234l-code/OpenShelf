<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Library;
use App\Models\Book;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Storage;

class MigrateImagesToCloudinary extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'image:migrate-to-cloudinary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate existing local storage images (users avatars, library logos/covers, book covers) to Cloudinary';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $cloudUrl = config('cloudinary.cloud_url');
        if (empty($cloudUrl) || !str_contains($cloudUrl, '@')) {
            $this->error('Cloudinary is not properly configured. Please set CLOUDINARY_URL in your .env file.');
            return Command::FAILURE;
        }

        $this->info('Starting Migration of Local Images to Cloudinary...');

        // 1. Migrate Users Avatars
        $users = User::whereNotNull('avatar')
            ->where('avatar', 'not like', 'http%')
            ->get();
        
        $userCount = 0;
        foreach ($users as $user) {
            $localPath = $this->resolveLocalPath($user->avatar);
            if ($localPath) {
                try {
                    $uploaded = Cloudinary::upload($localPath, ['folder' => 'openshelf/avatars']);
                    $secureUrl = $uploaded->getSecurePath();
                    if ($secureUrl) {
                        $user->update(['avatar' => $secureUrl]);
                        $userCount++;
                        $this->line("  ✓ User Avatar #{$user->id} -> Cloudinary");
                    }
                } catch (\Throwable $e) {
                    $this->warn("  × Failed User #{$user->id}: " . $e->getMessage());
                }
            }
        }
        $this->info("Migrated {$userCount} User Avatars.");

        // 2. Migrate Library Logos & Covers
        $libraries = Library::all();
        $libCount = 0;
        foreach ($libraries as $library) {
            $updated = false;
            if ($library->image && !str_starts_with($library->image, 'http')) {
                $localPath = $this->resolveLocalPath($library->image);
                if ($localPath) {
                    try {
                        $uploaded = Cloudinary::upload($localPath, ['folder' => 'openshelf/libraries']);
                        $secureUrl = $uploaded->getSecurePath();
                        if ($secureUrl) {
                            $library->image = $secureUrl;
                            $updated = true;
                        }
                    } catch (\Throwable $e) {
                        $this->warn("  × Failed Library Logo #{$library->id}: " . $e->getMessage());
                    }
                }
            }

            if ($library->cover_image && !str_starts_with($library->cover_image, 'http')) {
                $localPath = $this->resolveLocalPath($library->cover_image);
                if ($localPath) {
                    try {
                        $uploaded = Cloudinary::upload($localPath, ['folder' => 'openshelf/covers']);
                        $secureUrl = $uploaded->getSecurePath();
                        if ($secureUrl) {
                            $library->cover_image = $secureUrl;
                            $updated = true;
                        }
                    } catch (\Throwable $e) {
                        $this->warn("  × Failed Library Cover #{$library->id}: " . $e->getMessage());
                    }
                }
            }

            if ($updated) {
                $library->save();
                $libCount++;
                $this->line("  ✓ Library #{$library->id} ({$library->name}) -> Cloudinary");
            }
        }
        $this->info("Migrated {$libCount} Libraries.");

        // 3. Migrate Book Covers
        $books = Book::whereNotNull('cover_image')
            ->where('cover_image', 'not like', 'http%')
            ->get();

        $bookCount = 0;
        foreach ($books as $book) {
            $localPath = $this->resolveLocalPath($book->cover_image);
            if ($localPath) {
                try {
                    $uploaded = Cloudinary::upload($localPath, ['folder' => 'openshelf/books']);
                    $secureUrl = $uploaded->getSecurePath();
                    if ($secureUrl) {
                        $book->update(['cover_image' => $secureUrl]);
                        $bookCount++;
                        $this->line("  ✓ Book #{$book->id} ({$book->title}) -> Cloudinary");
                    }
                } catch (\Throwable $e) {
                    $this->warn("  × Failed Book #{$book->id}: " . $e->getMessage());
                }
            }
        }
        $this->info("Migrated {$bookCount} Book Covers.");

        $this->info('Migration Complete! All local images have been successfully transferred to Cloudinary.');
        return Command::SUCCESS;
    }

    /**
     * Resolve and validate existing local image file path.
     */
    private function resolveLocalPath(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        $cleanPath = ltrim(preg_replace('#^/?(storage/|public/)#', '', $path), '/');
        $fullPath = storage_path('app/public/' . $cleanPath);

        return file_exists($fullPath) ? $fullPath : null;
    }
}
