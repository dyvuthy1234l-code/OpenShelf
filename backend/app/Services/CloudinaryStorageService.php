<?php

namespace App\Services;

use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CloudinaryStorageService
{
    /**
     * Upload an image to Cloudinary with fallback to local storage.
     * Returns full secure HTTPS URL for Cloudinary or relative path for local disk.
     */
    public static function upload(UploadedFile $file, string $folder = 'uploads'): string
    {
        try {
            $cloudUrl = config('cloudinary.cloud_url');
            if (!empty($cloudUrl) && str_contains($cloudUrl, '@')) {
                $uploaded = Cloudinary::upload($file->getRealPath(), [
                    'folder' => 'openshelf/' . trim($folder, '/'),
                ]);

                $securePath = $uploaded->getSecurePath();
                if ($securePath) {
                    return $securePath;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Cloudinary upload exception, falling back to local disk: ' . $e->getMessage());
        }

        return $file->store($folder, 'public');
    }

    /**
     * Delete an existing image file (local disk or Cloudinary).
     */
    public static function delete(?string $path): void
    {
        if (!$path) {
            return;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            try {
                $cloudUrl = config('cloudinary.cloud_url');
                if (!empty($cloudUrl) && str_contains($cloudUrl, '@')) {
                    $publicId = static::getPublicIdFromUrl($path);
                    if ($publicId) {
                        Cloudinary::destroy($publicId);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to destroy Cloudinary image: ' . $e->getMessage());
            }
        } else {
            $cleanPath = ltrim(preg_replace('#^/?(storage/|public/)#', '', $path), '/');
            if (Storage::disk('public')->exists($cleanPath)) {
                Storage::disk('public')->delete($cleanPath);
            }
        }
    }

    /**
     * Extract Cloudinary public_id from secure URL.
     * Example URL: https://res.cloudinary.com/demo/image/upload/v12345678/openshelf/avatars/sample.jpg
     * Public ID: openshelf/avatars/sample
     */
    public static function getPublicIdFromUrl(string $url): ?string
    {
        $path = parse_url($url, PHP_URL_PATH);
        if (!$path) {
            return null;
        }

        // Strip file extension (.jpg, .png, .webp, etc.)
        $pathWithoutExt = preg_replace('/\.[^.\/]+$/', '', $path);

        // Extract everything after /upload/ (or optional version /upload/v12345/)
        if (preg_match('#/upload/(?:v\d+/)?(.+)$#', $pathWithoutExt, $matches)) {
            return urldecode($matches[1]);
        }

        return null;
    }
}
